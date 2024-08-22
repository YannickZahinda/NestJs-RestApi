import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AvatarDocument = Avatar & Document;

@Schema()
export class Avatar {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  base64: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);