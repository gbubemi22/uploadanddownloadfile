import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { User } from 'src/user/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  logger = new Logger();

  validatePasswordString(password: string) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;

    if (!password.match(regex)) {
      throw new BadRequestException(
        'Password must contain a capital letter, number, special character & greater than 8 digits.',
      );
    }

    return true;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, username, password } = createUserDto;

      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new HttpException(
          'An account with that email already exists!',
          HttpStatus.CONFLICT,
        );
      }
      console.log(createUserDto);
      const usernameExits = await this.userModel.findOne({ username });

      if (usernameExits) {
        throw new HttpException(
          'An account with that username already exists!',
          HttpStatus.CONFLICT,
        );
      }

      this.validatePasswordString(password);

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await this.userModel.create({
        email,
        username,
        password: hashedPassword,
      });

      return user;
    } catch (error) {
      console.log(error.message);
    }
  }

  async dosePasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ username });
    const doesUserExist = !!user;

    if (!doesUserExist) return null;

    const doesPasswordMatch = await this.dosePasswordMatch(
      user.password,
      password,
    );

    if (!doesPasswordMatch) return null;

    return user;
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{ token: string } | null> {
    const { username, password } = loginAuthDto;

    const user = await this.validateUser(username, password);

    if (!user)
      throw new HttpException('Credentials invalid!', HttpStatus.UNAUTHORIZED);

    const jwt = await this.jwtService.signAsync({ user });
    return { token: jwt };
  }

  async verifyJwt(jwt: string): Promise<{ exp: number }> {
    try {
      const { exp } = await this.jwtService.verifyAsync(jwt);
      return { exp };
    } catch (error) {
      throw new HttpException('Invalid JWT', HttpStatus.UNAUTHORIZED);
    }
  }
}
