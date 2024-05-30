import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthDtos } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserSerializer } from '../utils/serializers/user.serializer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  //services

  async signUp(authDto: AuthDtos) {
    const { email, password } = authDto;

    //check if email exist
    await this.usersService.hasEmail(email);

    //hash password
    const hashedPassword = await this.hashPassword(password);

    const newUser = this.usersRepository.create({
      ...authDto,
      password: hashedPassword,
    });

    const user = await this.usersRepository.save(newUser);

    const token = await this.createAccessToken(user.userId, user.email);

    return new UserSerializer({
      ...user,
      expiredDate: this.expiredDate(),
      access_token: token,
    });
  }

  async logIn(authDto: AuthDtos) {
    const { email, password } = authDto;
    const user = await this.usersService.findUserWithEmail(email);
    if (!user) throw new UnauthorizedException('Credential Error');

    //password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credential Error');

    //jwt token create
    const token = await this.createAccessToken(user.userId, user.email);

    return new UserSerializer({
      ...user,
      expiredDate: this.expiredDate(),
      access_token: token,
    });
  }

  //functions
  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async createAccessToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email: email,
    };
    const secretKey = this.configService.get('JWT_SECRET_KEY');
    const token = await this.jwtService.signAsync(payload, {
      secret: secretKey,
      expiresIn: '90d',
    });

    return token;
  }

  expiredDate() {
    const today = new Date();
    const tockenExpiredDate = addDays(today, 90);
    return tockenExpiredDate;
  }
}
