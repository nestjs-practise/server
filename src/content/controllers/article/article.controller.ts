import {
    CreateArticleDto,
    QueryArticleDto,
    UpdateArticleDto,
} from '@/content/dtos';
import { ArticleService } from '@/content/services';
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
    Query,
} from '@nestjs/common';

@Controller('articles')
export class ArticleController extends BaseController {
    constructor(private articleService: ArticleService) {
        super();
    }

    @Get()
    async index(
        @Query()
        { category }: QueryArticleDto,
    ) {
        return await this.articleService.findList({ category });
    }

    @Get(':id')
    async show(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.articleService.findOneOrFail(id);
    }

    @Post()
    async store(@Body() data: CreateArticleDto) {
        return await this.articleService.create(data);
    }

    @Patch()
    async update(@Body() data: UpdateArticleDto) {
        return await this.articleService.update(data);
    }

    @Delete(':id')
    async destroy(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.articleService.delete(id);
    }
}
