import {
  Body,
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileDocument, File } from './schema/file.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { request } from 'express';
import { Observable, from, switchMap } from 'rxjs';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(
    createFileDto: CreateFileDto,
    file: Express.Multer.File,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('File should not be empty');
    }

    const cloudinaryResponse = await this.cloudinaryService.uploadImage(file);

    if ('error' in cloudinaryResponse) {
      throw new BadRequestException(cloudinaryResponse.error.message);
    }
    const { title, genre } = createFileDto;

    const fileUrl = cloudinaryResponse.secure_url;

    const createdFile = new this.fileModel({
      title,
      genre,

      file: fileUrl,
    });
    console.log(createdFile);
    const savedFile = await createdFile.save();

    return {
      id: savedFile.id,
      title: savedFile.title,
      genre: savedFile.genre,
      isSeries: savedFile.isSeries,
      file: savedFile.file,
      year: savedFile.year,
    };
  }

  downloadFile(id: string): Observable<Buffer> {
    return from(this.fileModel.findById(id)).pipe(
      switchMap((file) => {
        if (!file) {
          throw new NotFoundException('File not found');
        }
        const fileUrl = file.file;
        return this.downloadFileFromUrl(fileUrl);
      }),
    );
  }

  private downloadFileFromUrl(url: string): Observable<Buffer> {
    return new Observable((observer) => {
      request.get(url),
        (err, response, body) => {
          if (err) {
            console.error(err);
            observer.error(
              new InternalServerErrorException('Failed to download file'),
            );
          } else if (response.status !== 200) {
            observer.error(new NotFoundException('File not found'));
          } else {
            observer.next(body);
            observer.complete();
          }
        };
    });
  }

  findAll() {
    return `This action returns all file`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}

// const bufferStream = streamifier.createReadStream(file.buffer);
// const uploadResult = await cloudinary.v2.uploader.upload(bufferStream, {
//   folder: 'files',
// });
// const fileUrl = uploadResult.secure_url;
// const newFile = new this.fileModel({
//   title,
//   genre,
//   file: fileUrl,
//   year: parseInt(year),
// });
// return newFile.save();
