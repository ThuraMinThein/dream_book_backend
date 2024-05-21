import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  //functions

  async hasEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });
    if (user) throw new ConflictException('Email already exists');
  }

  //services

  async create(createUserDto: CreateUserDto) {
    //check if emial exists or not
    await this.hasEmail(createUserDto.email);

    //create new user
    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        userId: id,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    // const updatedUser = this.usersRepository.merge(user, updateUserDto);
    const updatedUser = this.usersRepository.create({
      ...user,
      ...updateUserDto,
    });
    return this.usersRepository.save(updatedUser);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.softDelete(id);
    return user;
  }
}
