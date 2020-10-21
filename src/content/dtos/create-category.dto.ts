import { DtoValidationoOptions } from '@/core/decorators';
import { Injectable } from '@nestjs/common';
import { IsDefined, IsOptional, IsString, IsUUID } from 'class-validator';

@Injectable()
@DtoValidationoOptions({ groups: ['create'] })
export class CreateCategoryDto {
    // 在create组下必填
    @IsDefined({ groups: ['create'] })
    @IsString({ always: true })
    name!: string;

    // 在create组下必填
    @IsOptional({ always: true })
    @IsString({ always: true })
    slug?: string;

    // 总是可选
    @IsOptional({ always: true })
    @IsUUID(undefined, { always: true })
    parent?: string;
}
