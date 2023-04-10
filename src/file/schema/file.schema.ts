import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FileDocument = File & Document;
@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class File {
  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  genre: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isSeries: boolean;
  @Prop({
    type: String,
    required: true,
  })
  file: string;
  @Prop({
    type: String,
    required: false,
  })
  year: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
