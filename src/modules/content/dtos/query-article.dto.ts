import { DtoValidationoOptions } from '@/core/decorators';
import { Injectable } from '@nestjs/common';
import { IsOptional, IsUUID } from 'class-validator';

@Injectable()
@DtoValidationoOptions({ type: 'query' })
export class QueryArticleDto {
    @IsOptional()
    @IsUUID()
    category?: string;
}
