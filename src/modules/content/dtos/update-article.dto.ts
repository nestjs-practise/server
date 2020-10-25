import { DtoValidationoOptions } from '@/core/decorators';
import { Injectable } from '@nestjs/common';
import { PartialType } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';
import { CreateArticleDto } from './create-article.dto';

@Injectable()
@DtoValidationoOptions({ skipMissingProperties: true, groups: ['update'] })
export class UpdateArticleDto extends PartialType(CreateArticleDto) {
    // 在create组下必填
    @IsDefined({ groups: ['update'] })
    @IsUUID(undefined, { groups: ['update'] })
    id!: string;
}
