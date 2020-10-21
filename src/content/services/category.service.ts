import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos';
import { Category } from '../entities';
import { CategoryRepository } from '../repositories';

@Injectable()
export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) {}

    async findTrees() {
        return await this.categoryRepository.findTrees();
    }

    async findOneOrFail(id: string) {
        return await this.categoryRepository.findOneOrFail(id);
    }

    async create(createDto: CreateCategoryDto) {
        const { parent, ...createData } = createDto;
        const data: Omit<CreateCategoryDto, 'parent'> & {
            parent?: Category;
        } = { ...createData };
        if (parent) {
            data.parent = await this.categoryRepository.findOneOrFail(parent);
        }
        const item = await this.categoryRepository.save(data);
        return this.findOneOrFail(item.id);
    }

    async update(updateDto: UpdateCategoryDto) {
        const { id, parent, ...createData } = updateDto;
        const data: Omit<UpdateCategoryDto, 'id' | 'parent'> & {
            parent?: Category;
        } = { ...createData };
        if (!(await this.categoryRepository.findOne(id))) {
            throw new ForbiddenException('category not exists');
        }
        if (parent) {
            data.parent = await this.categoryRepository.findOneOrFail(parent);
        }
        if (Object.keys(data).length > 0) {
            await this.categoryRepository.update(id, data);
        }
        return await this.findOneOrFail(id);
    }

    async delete(id: string) {
        const item = await this.findOneOrFail(id);
        return await this.categoryRepository.remove(item);
    }

    /**
     * 打平并展开树
     *
     * @param {Category[]} trees
     * @param {string[]} [relations=[]]
     * @returns {Promise<Category[]>}
     * @memberof CategoryService
     */
    async toFlatTrees(
        trees: Category[],
        relations: string[] = [],
    ): Promise<Category[]> {
        const data: Category[] = [];
        for (const tree of trees) {
            const item = await this.categoryRepository.findOne(tree.id, {
                relations,
            });
            data.push(item!);
            data.push(...(await this.toFlatTrees(tree.children, relations)));
        }
        return data;
    }
}
