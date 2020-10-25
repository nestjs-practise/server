import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@Injectable()
export class CreateCommentDto {
    @IsNotEmpty()
    @IsString()
    body!: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    article!: string;
}
