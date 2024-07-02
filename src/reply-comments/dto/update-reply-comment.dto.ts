import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class UpdateReplyDto {
  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsEmpty({ message: 'Not allowed to change the parent comment' })
  replyTo: number;
}
