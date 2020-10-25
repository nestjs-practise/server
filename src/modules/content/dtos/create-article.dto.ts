import { DtoValidationoOptions } from '@/core/decorators';
import { Injectable } from '@nestjs/common';
import { IsDefined, IsOptional, IsString, IsUUID } from 'class-validator';

@Injectable()
@DtoValidationoOptions({ groups: ['create'] })
export class CreateArticleDto {
    // 在create组下必填
    @IsDefined({ groups: ['create'] })
    @IsString({ always: true })
    title!: string;

    // 在create组下必填
    @IsDefined({ groups: ['create'] })
    @IsString({ always: true })
    body!: string;

    // 总是可选
    @IsOptional({ always: true })
    @IsString({ always: true })
    description?: string;

    // 总是可选
    @IsOptional({ always: true })
    @IsString({ each: true, always: true })
    keywords?: string[];

    // 总是可选
    @IsOptional({ always: true })
    @IsUUID(undefined, { each: true, always: true })
    categories?: string[];
}
