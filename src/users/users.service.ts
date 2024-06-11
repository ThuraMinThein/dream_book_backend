import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
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
    //new datas
    const { countryCode, localNumber, oldPassword } = updateUserDto;

    //datas from database
    let { phoneNumber, profilePicture, password } = user;

    //phone number
    if (countryCode || localNumber) {
      if (!countryCode)
        throw new BadRequestException('Country code is requied!');
      if (!localNumber)
        throw new BadRequestException('local number is required!');
      phoneNumber = `${countryCode}${localNumber}`;

      //check if phone number is duplicated
      await this.checkConflictPhoneNumber(phoneNumber, user.phoneNumber);
    }

    //if user wants to change the password, check if the old password and new password are the smae
    let newPassword: string = updateUserDto.password;
    if (newPassword) {
      if (!oldPassword)
        throw new BadRequestException('Old password is reuqired');
      const isCorrect = await bcrypt.compare(oldPassword, password);
      if (isCorrect) {
        password = await this.hashPassword(newPassword);
      } else {
        throw new BadRequestException('Incorrect Password');
      }
    }

    //if the user wants to change the image, replace image in cloudinary with new and old image
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
      password,
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

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async hasEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });
    return user;
  }

  async findUserWithEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async checkConflictPhoneNumber(phoneNumber: string, oldPhoneNumber: string) {
    const user = await this.usersRepository.findOne({
      where: {
        phoneNumber,
      },
    });
    if (user && phoneNumber !== oldPhoneNumber)
      throw new ConflictException('Invalid phone number');
  }
}
