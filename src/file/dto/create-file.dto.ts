import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateFileDto {
  title: string;

  genre: string;

  file: string;

  id?: string;
}
