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

  async findUserWithEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  //services

  // async create(createUserDto: CreateUserDto) {
  //   const { password } = createUserDto;

  //   //check if emial exists or not
  //   await this.hasEmail(createUserDto.email);

  //   //hash password
  //   createUserDto.password = await this.hashPassword(password);

  //   //create new user
  //   const newUser = this.usersRepository.create(createUserDto);
  //   return this.usersRepository.save(newUser);
  // }

  async findAll(): Promise<any> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: {
        userId: id,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.findOne(id);

    // const updatedUser = this.usersRepository.merge(user, updateUserDto);
    const updatedUser = this.usersRepository.create({
      ...user,
      ...updateUserDto,
    });
    return this.usersRepository.save(updatedUser);
  }

  async remove(id: number): Promise<any> {
    const user = await this.findOne(id);
    await this.usersRepository.delete(id);
    return user;
  }
}
