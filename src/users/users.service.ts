import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  //services

  // async findAll(): Promise<User[]> {
  //   const users = await this.usersRepository.find();
  //   if (users.length === 0) {
  //     throw new NotFoundException('No users exist');
  //   }
  //   return users;
  // }

  // async findOne(id: number): Promise<User> {
  //   const user = await this.usersRepository.findOne({
  //     where: {
  //       userId: id,
  //     },
  //   });
  //   if (!user) throw new NotFoundException('User not found');
  //   return user;
  // }

  async update(
    user: User,
    newProfilePicture: Express.Multer.File,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    //phone number
    let phoneNumber: string = user.phoneNumber;
    const { countryCode, localNumber } = updateUserDto;
    if (countryCode && localNumber) {
      phoneNumber = `${countryCode}${localNumber}`;
    }

    //if the user wants to change the image, replace image in cloudinary with new and old image
    let profilePicture = user.profilePicture;
    if (newProfilePicture) {
      const { url } = await this.cloudinaryService.storeImage(
        newProfilePicture,
        'user-profile-pictures',
      );
      profilePicture = url;

      //delete old image in cloudinary if there is an image exists
      user?.profilePicture &&
        (await this.cloudinaryService.deleteImage(user.profilePicture));
    }

    //update user
    const updatedUser = this.usersRepository.create({
      ...user,
      ...updateUserDto,
      phoneNumber,
      profilePicture,
    });
    return this.usersRepository.save(updatedUser);
  }

  async remove(user: User): Promise<User> {
    //delete image in cloudinary if there is an image
    user?.profilePicture &&
      (await this.cloudinaryService.deleteImage(user.profilePicture));

    //delete user
    await this.usersRepository.delete(user.userId);
    return user;
  }

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
}
