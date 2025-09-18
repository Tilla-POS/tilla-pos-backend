import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { Modifier } from './entities/modifier.entity';
import { ModifierSet } from './entities/modifier-set.entity';
import { CreateModifierDto } from './dto/create-modifier.dto';
import { UpdateModifierDto } from './dto/update-modifier.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class ModifiersService {
  constructor(
    @InjectRepository(Modifier)
    private readonly modifierRepo: Repository<Modifier>,
    @InjectRepository(ModifierSet)
    private readonly modifierSetRepo: Repository<ModifierSet>,
  ) {}

  async create(dto: CreateModifierDto) {
    const modifier = this.modifierRepo.create({
      name: dto.name,
      options: dto.options.map((o) => this.modifierSetRepo.create(o)),
    });
    try {
      return await this.modifierRepo.save(modifier);
    } catch (e) {
      throw new RequestTimeoutException('Fail to create the modifier', e);
    }
  }

  async findAll() {
    try {
      return await this.modifierRepo.find({ relations: ['options'] });
    } catch (e) {
      throw new RequestTimeoutException('Fail to fetch modifiers', e);
    }
  }

  async findAllByIds(ids: string[]) {
    return await this.modifierRepo.find({
      where: { id: In(ids) },
      relations: ['options'],
    });
  }

  async findOne(id: string) {
    const modifier = await this.modifierRepo.findOne({
      where: { id },
      relations: ['options'],
    });
    if (!modifier) throw new NotFoundException(`Modifier ${id} not found`);
    return modifier;
  }

  async update(id: string, dto: UpdateModifierDto) {
    let modifier: Modifier;
    try {
      modifier = await this.findOne(id);
    } catch (e) {
      throw new RequestTimeoutException(
        `Fail to fetch the modifier with id: ${id}`,
        e,
      );
    }
    if (!modifier) throw new BadRequestException(`Modifier ${id} not found`);
    modifier.name = dto.name ?? modifier.name;
    if (dto.options) {
      await this.modifierSetRepo.delete({ modifier: { id } });
      modifier.options = dto.options.map((o) => this.modifierSetRepo.create(o));
    }
    try {
      return await this.modifierRepo.save(modifier);
    } catch (e) {
      throw new RequestTimeoutException('Fail to update the modifier', e);
    }
  }

  async remove(id: string) {
    let modifier: Modifier;
    try {
      modifier = await this.findOne(id);
    } catch (e) {
      throw new RequestTimeoutException(`Fail to fetch modifier: ${id}`, e);
    }
    if (!modifier) throw new BadRequestException(`Modifier ${id} not found`);
    try {
      return await this.modifierRepo.softRemove(modifier);
    } catch (e) {
      throw new RequestTimeoutException('Fail to remove the modifier', e);
    }
  }

  async restore(id: string) {
    try {
      return await this.modifierRepo.restore(id);
    } catch (e) {
      throw new RequestTimeoutException('Fail to restore the modifier', e);
    }
  }
}
