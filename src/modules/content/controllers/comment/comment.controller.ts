import { CreateCommentDto } from '@/modules/content/dtos';
import { CommentService } from '@/modules/content/services';
import { BaseController } from '@/core/base/controller';
import {
    Body,
    Controller,
    Delete,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';

@Controller('comments')
export class CommentController extends BaseController {
    constructor(private commentService: CommentService) {
        super();
    }

    @Post()
    async store(@Body() data: CreateCommentDto) {
        return await this.commentService.create(data);
    }

    @Delete(':id')
    async destroy(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.commentService.delete(id);
    }
}
