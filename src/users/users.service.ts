import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto, PutUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashing } from '../common/encrypt/provider/hashing';
import { ActiveUser as ActiveUserInterface } from '../auth/interfaces/active-user.inteface';

@Injectable()
export class UsersService {
  constructor(
    /**
     * Inject User Repository
     */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    /**
     * Inject Hashing Service
     */
    private readonly hashingService: Hashing,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = this.userRepository.create({
        ...createUserDto,
        password: await this.hashingService.hashPassword(
          createUserDto.password,
        ),
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new RequestTimeoutException(
        'Failed to create user. Please try again later.',
        error,
      );
    }
  }

  async findAll() {
    try {
      return await this.userRepository.find({ relations: ['business'] });
    } catch (error) {
      throw new RequestTimeoutException(
        'Failed to retrieve users. Please try again later.',
        error,
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.userRepository.findOne({
        where: { id: id },
        relations: ['business'],
      });
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to retrieve user with ID ${id}. Please try again later.`,
        error,
      );
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: { email: email },
        relations: ['business'],
      });
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to retrieve user with email ${email}. Please try again later.`,
        error,
      );
    }
  }

  async getCurrentUser(activeUser: ActiveUserInterface): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: activeUser.sub },
        relations: ['business'],
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new RequestTimeoutException(
        'Failed to retrieve current user. Please try again later.',
        error,
      );
    }
  }

  async patch(id: string, patchUserDto: PatchUserDto) {
    let user: User;
    try {
      // find the user by ID
      user = await this.userRepository.findOne({ where: { id: id } });
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to fetch user with ID ${id}. Please try again later.`,
        error,
      );
    }
    // If the user not found, throw an error
    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found.`);
    }
    // If the user found, update the user with the provided data
    user.username = patchUserDto.username || user.username;
    user.phone = patchUserDto.phone || user.phone;
    user.email = patchUserDto.email || user.email;
    user.password = patchUserDto.password || user.password;

    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to update user with ID ${id}. Please try again later.`,
        error,
      );
    }
  }

  async put(id: string, putUserDto: PutUserDto) {
    let user: User;
    try {
      // find the user by ID
      user = await this.userRepository.findOne({ where: { id: id } });
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to fetch user with ID ${id}. Please try again later.`,
        error,
      );
    }
    // If the user not found, throw an error
    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found.`);
    }
    try {
      // If the user found, update the user with the provided data
      await this.userRepository.update(id, putUserDto);
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to update user with ID ${id}. Please try again later.`,
        error,
      );
    }
    // and return the updated user
    const updatedUser = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!updatedUser) {
      throw new BadRequestException(`Failed to update user with ID ${id}.`);
    }
    return updatedUser;
  }

  async remove(id: string) {
    let user: User;
    try {
      // find the user by ID
      user = await this.userRepository.findOne({ where: { id: id } });
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to delete user with ID ${id}. Please try again later.`,
        error,
      );
    }
    // If the user not found, throw an error
    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found.`);
    }
    try {
      // If the user found, remove the user
      return await this.userRepository.softDelete(id);
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to delete user with ID ${id}. Please try again later.`,
        error,
      );
    }
  }

  async restore(id: string) {
    try {
      return await this.userRepository.restore(id);
    } catch (error) {
      throw new RequestTimeoutException(
        `Failed to restore user with ID ${id}. Please try again later.`,
        error,
      );
    }
  }
}
