import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { Role } from '../user.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(3)
  @MaxLength(128)
  readonly email: string = '';

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password = '';

  @IsString()
  @IsOptional()
  readonly image: string = '';

  @IsString()
  @ValidateIf((r) => typeof r.role !== 'undefined')
  @IsIn(Object.values(Role))
  role: Role;
}
