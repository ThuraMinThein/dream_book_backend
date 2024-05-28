import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  //services

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        userId: id,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    user: User,
    newProfilePicture: Express.Multer.File,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    //if the user wants to change the image, replace image in cloudinary with new and old image
    let profilePicture = user.profilePicture;
    if (newProfilePicture) {
      const { url } = await this.cloudinaryService.storeImage(
        newProfilePicture,
        'user-profile-pictures',
      );
      profilePicture = url;

      //delete old image in cloudinary if there is an image exists
      if (user.profilePicture)
        await this.cloudinaryService.deleteImage(user.profilePicture);
    }

    //update user
    const updatedUser = this.usersRepository.create({
      ...user,
      ...updateUserDto,
      profilePicture,
    });
    return this.usersRepository.save(updatedUser);
  }

  async remove(user: User): Promise<User> {
    //delete image in cloudinary if there is an image
    if (user.profilePicture)
      await this.cloudinaryService.deleteImage(user.profilePicture);
    await this.usersRepository.delete(user.userId); //delete user
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
