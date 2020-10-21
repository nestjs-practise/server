import { CreateCategoryDto, UpdateCategoryDto } from '@/content/dtos';
import { CategoryService } from '@/content/services';
import { BaseController } from '@/core/base/controller';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from '@nestjs/common';

@Controller('categories')
export class CategoryController extends BaseController {
    constructor(private categoryService: CategoryService) {
        super();
    }

    @Get()
    async index() {
        return this.categoryService.findTrees();
    }

    @Get(':id')
    async show(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.categoryService.findOneOrFail(id);
    }

    @Post()
    async store(@Body() data: CreateCategoryDto) {
        return this.categoryService.create(data);
    }

    @Patch()
    async update(@Body() data: UpdateCategoryDto) {
        return this.categoryService.update(data);
    }

    @Delete(':id')
    async destroy(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.categoryService.delete(id);
    }
}
