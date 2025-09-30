import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from './entities/sale.entity';
import { LineItem } from './entities/line-item.entity';
import { Customer } from './entities/customer.entity';
import { UsersService } from '../users/users.service';
import { BusinessesService } from '../businesses/businesses.service';
import { ItemsService } from '../items/items.service';
import { ModifiersService } from '../modifier/modifier.service';
import { PaymentMethod } from './enums/payment-method.enum';
import { ActiveUser as ActiveUserInterface } from '../auth/interfaces/active-user.inteface';

@Injectable()
export class SaleService {
  private readonly logger = new Logger(SaleService.name);

  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(LineItem)
    private readonly lineItemRepository: Repository<LineItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly usersService: UsersService,
    private readonly businessesService: BusinessesService,
    private readonly itemsService: ItemsService,
    private readonly modifierService: ModifiersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createSaleDto: CreateSaleDto, user: ActiveUserInterface) {
    this.logger.debug(
      `Creating sale for user ${user.sub} in business ${user.businessId}`,
    );

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate user and business
      const userEntity = await this.usersService.findOne(user.sub);
      if (!userEntity) {
        throw new NotFoundException('User not found');
      }

      const business = await this.businessesService.findOne(user.businessId);
      if (!business) {
        throw new NotFoundException('Business not found');
      }

      // Validate all variants exist
      for (const lineItemDto of createSaleDto.lineItems) {
        const variant = await this.itemsService.findVariantDetailById(
          lineItemDto.variantId,
        );
        if (!variant) {
          throw new NotFoundException(
            `Variant with ID ${lineItemDto.variantId} not found`,
          );
        }

        // Validate modifier set if provided
        if (lineItemDto.modifierSetId) {
          const modifierSet = await this.modifierService.findSetById(
            lineItemDto.modifierSetId,
          );
          if (!modifierSet) {
            throw new NotFoundException(
              `Modifier set with ID ${lineItemDto.modifierSetId} not found`,
            );
          }
        }
      }

      // Create customer if provided
      let customer: Customer | null = null;
      if (createSaleDto.customer) {
        // Check if customer already exists by email or phone
        const existingCustomer = await queryRunner.manager.findOne(Customer, {
          where: [
            {
              email: createSaleDto.customer.email,
              business: { id: business.id },
            },
            {
              phone: createSaleDto.customer.phone,
              business: { id: business.id },
            },
          ].filter((condition) =>
            Object.values(condition).every(
              (val) => val !== undefined && val !== null,
            ),
          ),
        });

        if (existingCustomer) {
          customer = existingCustomer;
        } else {
          customer = queryRunner.manager.create(Customer, {
            name: createSaleDto.customer.name,
            email: createSaleDto.customer.email || null,
            phone: createSaleDto.customer.phone || null,
            business,
            createdBy: userEntity,
          });
          customer = await queryRunner.manager.save(Customer, customer);
        }
      }

      // Create sale
      const sale = queryRunner.manager.create(Sale, {
        receiptId: uuidv4(),
        discount: createSaleDto.discount || 0,
        tax: createSaleDto.tax || 0,
        subTotal: createSaleDto.subtotal,
        grandTotal: createSaleDto.grandTotal,
        paymentMethod: createSaleDto.paymentMethod || PaymentMethod.CASH,
        receiptNote: createSaleDto.receiptNote || null,
        cashReceive: createSaleDto.cashReceived,
        change: createSaleDto.change || 0,
        customer,
        business,
        createdBy: userEntity,
      });

      const savedSale = await queryRunner.manager.save(Sale, sale);

      // Create line items
      const lineItems: LineItem[] = [];
      for (const lineItemDto of createSaleDto.lineItems) {
        const variant = await this.itemsService.findVariantDetailById(
          lineItemDto.variantId,
        );

        let modifierSet = null;
        if (lineItemDto.modifierSetId) {
          modifierSet = await this.modifierService.findSetById(
            lineItemDto.modifierSetId,
          );
        }

        const lineItem = queryRunner.manager.create(LineItem, {
          variant,
          price: lineItemDto.price,
          quantity: lineItemDto.quantity,
          total: lineItemDto.total,
          modifierSet,
          sale: savedSale,
          createdBy: userEntity,
        });

        const savedLineItem = await queryRunner.manager.save(
          LineItem,
          lineItem,
        );
        lineItems.push(savedLineItem);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(
        `Sale created successfully with ID: ${savedSale.id} and receipt ID: ${savedSale.receiptId}`,
      );

      // Return the complete sale with relations
      return await this.saleRepository.findOne({
        where: { id: savedSale.id },
        relations: [
          'lineItems',
          'lineItems.variant',
          'lineItems.modifierSet',
          'customer',
          'business',
          'createdBy',
        ],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create sale', error.stack);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new ConflictException('Failed to create sale due to a conflict');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: ActiveUserInterface) {
    this.logger.debug(`Fetching all sales for business ${user.businessId}`);

    try {
      const sales = await this.saleRepository.find({
        where: {
          business: { id: user.businessId },
          deletedAt: null,
        },
        select: {
          id: true,
          receiptId: true,
          grandTotal: true,
          createdAt: true,
          paymentMethod: true,
        },
        order: { createdAt: 'DESC' },
      });

      return sales;
    } catch (error) {
      this.logger.error('Failed to fetch sales', error.stack);
      throw new ConflictException('Failed to fetch sales');
    }
  }

  async findOne(id: string, user: ActiveUserInterface) {
    this.logger.debug(
      `Fetching sale with ID: ${id} for business ${user.businessId}`,
    );

    try {
      const sale = await this.saleRepository.findOne({
        where: {
          id,
          business: { id: user.businessId },
          deletedAt: null,
        },
        relations: [
          'lineItems',
          'lineItems.variant',
          'lineItems.modifierSet',
          'customer',
          'business',
          'createdBy',
        ],
      });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      return sale;
    } catch (error) {
      this.logger.error(`Failed to fetch sale with ID: ${id}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new ConflictException('Failed to fetch sale');
    }
  }

  async remove(id: string, user: ActiveUserInterface) {
    this.logger.debug(`Deleting sale with ID: ${id} for user ${user.sub}`);

    try {
      const sale = await this.saleRepository.findOne({
        where: {
          id,
          business: { id: user.businessId },
          deletedAt: null,
        },
        relations: ['createdBy'],
      });

      if (!sale) {
        throw new NotFoundException('Sale not found');
      }

      // Only allow the creator to delete the sale
      if (sale.createdBy.id !== user.sub) {
        throw new BadRequestException('You can only delete sales you created');
      }

      // Soft delete the sale
      await this.saleRepository.softDelete(id);

      this.logger.log(`Sale deleted successfully: ${id}`);
      return { message: 'Sale deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete sale with ID: ${id}`, error.stack);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new ConflictException('Failed to delete sale');
    }
  }
}
