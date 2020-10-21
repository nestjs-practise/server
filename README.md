# 第一个Nestjs应用

> 本课程在MacOS环境下制作,如果是win或linux环境请按照各自的方法安装Node

## 创建应用

要合理的编写应用必须事先了解清楚整个程序的访问流程,本教程会讲解如何一步步演进每一次访问流,作为第一个课时,我们的访问流非常简单,可以参考下图

![](https://pic.lichnow.com/media/20201020231909.png)

### 序列化与验证

`class-transformer`用于对请求和返回等数据进行序列化和反序列化,`class-validator`用于验证请求`dto`等

```shell
~ yarn add class-transformer && yarn add class-validator
```

### 更改适配器

由于Nestjs默认使用的适配器是Express,速度比较慢,我们首先把适配器换成更快的fasify

```shell
yarn add @nestjs/platform-fastify
```

打开vscode

```shell
~ cd ~/Code/learn/blog/api && code ./
```

更改`main.ts`,并把监听的IP改成`0.0.0.0`方便外部访问

```typescript
// main.ts

import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(3000,'0.0.0.0');
}
bootstrap();
```

### 创建基本结构

为了是代码就有分割性,建议不同的功能集合放在各自的模块里,前期模块,控制器等可以通过nest cli命令工具快速创建

**注意: 对于小项目你也可以把所有功能都放在`AppModule`中**

> nest cli的命令可以通过nest {commnd name} -h来查看用途,许多情况下我们需要使用yargs或者command.js来编写更多命令

> 如果在windows中某些shell命令无法执行,请手动删除或创建

删除自带的AppModule下的其它文件并在`app.module.ts`里清除导入

```shell
~ rm src/app.controller.ts src/app.controller.spec.ts src/app.service.ts
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}

```

创建3个模块,其中`CoreModule`为全局模块,并创建相应的控制器,服务等

> 创建好模块后会自动导入到`AppModule`,创建好控制器等提供者后会自动导入到其模块

```shell
# 创建模块
~ nest g module core                                               #核心模块
~ nest g module security                                           #用户权限模块
~ nest g module content                                            #内容模块
# 创建内容模块的服务
~ nest g service category content/services --no-spec \
  && nest g service article content/services --no-spec \
  && nest g service comment content/services --no-spec
# 整理一下文件结构,把service类从子目录提取到上级
~ cd src/content/services \
     && mv category/category.service.ts ./ \
     && mv article/article.service.ts ./ \
     && mv comment/comment.service.ts ./ \
     && rm -rf category article comment \
     && cd ../../../
# 创建dto
~ nest g provider CreateArticle.dto content/dtos  --no-spec \
  && nest g provider UpdateArticle.dto content/dtos  --no-spec \
  && nest g provider QueryArticle.dto content/dtos --no-spec \
  && nest g provider CreateComment.dto content/dtos --no-spec \
  && nest g provider CreateCategory.dto content/dtos --no-spec \
  && nest g provider UpdateCategory.dto content/dtos --no-spec

# 创建控制器
~ nest g controller category content/controllers \
  && nest g controller article content/controllers \
  && nest g controller comment content/controllers         
```

### 调整代码

创建完以上结构后打开vscode后,查看每个`module`的入口文件会发现许多红色波浪线的导入错误错误,这时我们把`ConentModule`中写入的`import`的所有自动导入的提供者以及`controllers`全部删除,然后再在每个提供者的上层目录新建一个`index.ts`,在`index.ts`中把同级的所有提供者导出,接着在`ContentModule`通过`Object.values`方法引入到其`imports`,`controllers`,`providers`,也可以根据需要在`exports`里面导出

> 在此之前在`CoreModule`创建基础控制器方便后续继承使用

```shell
~ cd src/core \
  && mkdir -p base \
  && cd $_ \
  && touch controller.ts \
  && cd ../../content \
  && touch services/index.ts \
  && touch dtos/index.ts \
  && touch controllers/index.ts \
  && cd ../../
```

然后在同级或上级的`index.ts`中导出各个文件并通过`Object.values`在`ContentModule`中导入

> 具体修改后的代码结构请参考本源代码

```typescript
// src/core/base/controller.ts
export abstract class BaseController {}

//src/content/controllers/index.ts,services,dtos等目录相同
export * from './article/article.controller';
export * from './category/category.controller';
export * from './comment/comment.controller';

// src/content/content.module.ts
import { Module } from '@nestjs/common';
import * as constollerMaps from './controllers';
import * as dtoMaps from './dtos';
import * as serviceMaps from './services';

const dtos = Object.values(dtoMaps);
const services = Object.values(serviceMaps);
const providers = [...dtos, ...services];
@Module({
    imports: [],
    controllers,
    providers,
    exports: [...services],
})
export class ContentModule {}

```

让所有的控制器继承`BaseController`,并且让每个`Controller`的路径前缀为复数

示例

```typescript
// src/content/controllers/article/article.controller.ts
import { BaseController } from '@/core/base/controller';
import { Controller } from '@nestjs/common';

@Controller('articles')
export class ArticleController extends BaseController {}

```

### 模块设置

因为`ContentModule`会调用`SecurityModule`的一些服务,所以是依赖关系,我们在`ContentModule`中导入`SecurityModule`

示例

```typescript
// src/content/content.module.ts    
import { SecurityModule } from '@/security/security.module';
@Module({
    imports: [SecurityModule],
    // ...
})
export class ContentModule {}
```

`CoreModule`为公用模块,所以我们把它设置成`Global`,这样就不需要在其它模块引用它也可以使用它导出的服务

```typescript
// src/core/core.module.ts
import { Global, Module } from '@nestjs/common';

@Global()
@Module({})
export class CoreModule {}
```

最后要说的是**所有模块在创建的时候自动在`AppModule`中已经导入,不需要自己额外进行导入**

## Typeorm整合

Nestjs数据操作有许多方案,本教程我们使用最简单方便的Typeorm,后续教程我们会讲解更适用于生产环境的postgresql以及与node结合更好的mongodb,以及更加极客的Prism

### 数据库配置

在使用mysql和typeorm之前我们必须安装驱动和库

```shell
~ yarn add @nestjs/typeorm typeorm mysql
```

在连接数据库之前请先确保你本地已经安装了mysql,以下是推荐的安装方法

- Mac: brew install mysql
- Windows: phpstudy
- linux: apt-get install mysql(debian系) / yum install mysql(rad hat系)

首先用navicat或者mysql-workbanch,phpMyAdmin等客户端工具连接数据库创建一个cms数据库

接着把在`CoreModule`里全局注入Typeorm

> `synchronize`选项用来在开发环境同步Entity,后续我们自己写好命令这个配置要关掉
>
> `autoLoadEntities`用于自动把注入为Repository的Entity加载到typeorm的entities配置

```typescript
// src/core/core.module.ts
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '123456',
            database: 'cms',
            synchronize: true,
            autoLoadEntities: true,
        }),
    ],
})
export class CoreModule {}

```

由于我们后续要在命令行使用数据库配置,所以我们把配置写在一个ts文件中,再写一个专门用于typeorm cli的文件来调用配置

```shell
~ mkdir -p src/console && mkdir -p src/config \
  && touch src/console/ormconfig.ts \
  && touch src/config/database.config.ts \
  && touch src/config/index.ts
```

```typescript
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const database: TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '123456',
    database: 'cms',
    // 自动同步模型,仅在开发环境使用
    // 后面我们讲完《配置优化》和《自定义命令》后这个配置就不需要了
    synchronize: true,
    // 这个配置为了自动加载模型类,而不去从glob匹配中读取
    // 比如使用webpack打包会打成单文件js,那么通过遍历的方式就无法获取模型
    autoLoadEntities: true,
    // 所有表的表前缀,可选设置
    entityPrefix: 'jkxk_',
};

```

```typescript
// src/config/index.ts
export * from './database.config';
```

安装lodash,并使用其`omit`函数来去除typeorm本身配置选项中不包含的额外nestjs的数据库配置

```shell
~ yarn add lodash && yarn add @types/lodash -D
```

```typescript
import { database } from '@/config';
import { ConnectionOptions } from 'typeorm';
import { omit } from 'lodash';

const TypeormConfig: ConnectionOptions = omit(database, [
    'retryAttempts',
    'retryDelay',
    'toRetry',
    'autoLoadEntities',
    'keepConnectionAlive',
    'verboseRetryLog',
]) as ConnectionOptions;
export default TypeormConfig;

```

修改一下`CoreModule`

```typescript
# src/core/core.module.ts
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from '@/config';

@Global()
@Module({
    imports: [TypeOrmModule.forRoot(database)],
})
export class CoreModule {}

```

### 创建模型

由于Nestjs没有整合Typeorm的cli,所以我们需要手动整合

在数据库配置里添加Entity的默认生成目录

```typescript
// src/config/database.config.ts

export const database: TypeOrmModuleOptions = {
    ...
    cli: {
        entitiesDir: 'src/entities',
    },
}
```

在`package.json`的`scripts`中添加Typeorm的CLI

> 在安装之前请先行安装ts-node和cross-env,ts-node用于cli加载console/ormconfig.ts,cross-env用于跨平台设置环境变量

```typescript
~ yarn add ts-node cross-env -D
```

```json
# package.json
"scripts": {
    "typeorm": "cross-env NODE_ENV=development ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js --config console/ormconfig.ts"
}
```

接着使用在`package.json`的`scripts`中添加Typeorm的CLI来生成需要的模型

```shell
# 生成模型
~ yarn typeorm entity:create -n Category -d src/content/entities \
  && yarn typeorm entity:create -n Article -d src/content/entities \
  && yarn typeorm entity:create -n Comment -d src/content/entities
# 调整文件结构,这样做是为了后面写命令的时候可以加载entity方便,比如略过base类等
~ cd src/content/entities \
  && mv Category.ts category.entity.ts \
  && mv Article.ts article.entity.ts \
  && mv Comment.ts comment.entity.ts \
  && cd ../../../
#把所有的Entities在到各自的`index.ts`中导出,跟前面的方法一样
~ touch src/content/entities/index.ts
```

```typescript
// src/content/entities/index.ts
export * from './article.entity';
export * from './category.entity';
export * from './comment.entity';
```

导入到`ContentModule`

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entitieMaps from './entities';
@Module({
    imports: [SecurityModule, TypeOrmModule.forFeature(entities)],
    // ...
})
export class ContentModule {}
```

### 数据结构

> 在Entity装饰器中传入参数来设置表名,表名最好为{模块名_每个模型的复数形式}
>
> 当然我们还可以在数据库整体配置中加入`entityPrefix`来配置所有模型的前缀

先要理清关联关系,目前`ContentModule`的模型之间的关联关系非常简单

- `Category`自身树形嵌套
- `Article`与`Category`为`many-to-many`关联
- `Comment`自身树形嵌套
- `Article`与`Comment`为`one-to-many`关联

然后添加一些各自的字段就完成数据结构的创建了

**注意:树形模型目前建议使用`nested-set`,物化路径和闭表实现当前有bug,后续typeorm官方应该会改进**

> 为了Active Record与Data Mapper两种模式可以混用,我们可以让每个模型继承默认的`BaseEntity`

```typescript
// src/content/entities/category.entity.ts
// ...
@Entity('content_categories')
@Tree('nested-set')
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '分类名称' })
    name!: string;

    @Column({ comment: '分类标识符' })
    slug!: string;

    @TreeChildren()
    children!: Category[];

    @TreeParent()
    parent?: Category;

    /**
     * 分类关联的文章
     *
     * @type {Article[]}
     * @memberof Category
     */
    @ManyToMany((type) => Article, (article) => article.categories)
    articles!: Article[];
}

// src/content/entities/article.entity.ts
// ...
@Entity('content_articles')
export class Article extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '文章标题' })
    title!: string;

    @Column({ comment: '文章内容' })
    body!: string;

    @Column({ comment: '文章描述', nullable: true })
    description?: string;

    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];

    /**
     * 文章关联的分类
     *
     * @type {Category[]}
     * @memberof Article
     */
    @ManyToMany((type) => Category, (category) => category.articles, {
        cascade: true,
    })
    @JoinTable()
    categories!: Category[];

    /**
     * 文章下的评论
     *
     * @type {Comment[]}
     * @memberof Article
     */
    @OneToMany(() => Comment, (comment) => comment.article, { cascade: true })
    comments!: Comment[];
}

// src/content/entities/comment.entity.ts
// ..
@Entity('content_comments')
@Tree('nested-set')
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '评论内容' })
    body!: string;

    @TreeChildren()
    children!: Comment[];

    @TreeParent()
    parent?: Comment;

    /**
     * 评论所属文章
     *
     * @type {Article}
     * @memberof Comment
     */
    @ManyToOne(() => Article, (article) => article.comments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    article!: Article;
}

```

自此数据结构创建完毕

### 自定义存储类

一般情况下我们只需要使用通过模型获取的默认存储库`em.getReposity({entity})`就可以了,但是一些复杂的数据操作需要我们自定义存储库

> 树形存储库需要继承`TreeRepository`

此处添加两个存储类

```shell
~ mkdir src/content/repositories \
&& touch src/content/repositories/category.repository.ts \
&& touch src/content/repositories/article.repository.ts \
&& touch src/content/repositories/index.ts
```

```typescript
// src/content/repositories/category.repository.ts
// ...
@EntityRepository(Category)
export class CategoryRepository extends TreeRepository<Category> {}
//src/content/repositories/article.repository.ts
// ...
@EntityRepository(Article)
export class ArticleRepository extends Repository<Article> {}

//src/content/repositories/index.ts
export * from './article.repository';
export * from './category.repository';
```

最后在`CoreModule`中使用`TypeOrmModule.forFeature`,并同时导出(为了其它模块可以使用)

```typescript
// src/content/content.module.ts
import * as repoMaps from './repositories';
// ...
const repositories = Object.values(repoMaps);
@Module({
    imports: [
        SecurityModule,
        TypeOrmModule.forFeature([...entities, ...repositories]),
    ],
    // ...
    exports: [...services, TypeOrmModule.forFeature(repositories)],
})
export class ContentModule {}
```

### 模型事件

分类的`slug`字段可以根据名称自动生成,并且保持唯一性,所以我们需要添加一个`BeforeInsert`模型事件,事件既可以添加到模型里也可以使用`subscriber`添加,此处我们使用`subscriber`

首先在数据库配置中添加默认的生成目录

```typescript
// src/config/database.config.ts
export const database: TypeOrmModuleOptions = {
    // ...
    cli: {
        entitiesDir: 'src/entities',
        subscribersDir: 'src/subscriber',
    },
};

```

生成`CategorySubscriber`,并在index.ts中导出

```shell
~ yarn typeorm subscriber:create -n CategorySubscriber -d src/content/subscribers \
  && touch src/content/subscribers/index.ts
```

为了后面方便命令行加载,我们更改一下文件名

```shell
~ mv src/content/subscribers/CategorySubscriber.ts src/content/subscribers/category.subscriber.ts
```

为了生成随机名称,我们需要添加`crypto`

```shell
~ yarn add crypto
```

编写事件观察者

```typescript
// src/content/subscribers/category.subscriber.ts
// ...
@EventSubscriber()
export class CategorySubscriber implements EntitySubscriberInterface<Category> {
    /**
     * 在当前链接中添加
     *
     * @param {Connection} connection
     * @memberof CategorySubscriber
     */
    constructor(connection: Connection) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return Category;
    }

    /**
     * 插入数据前置事件
     *
     * @param {InsertEvent<Category>} event
     * @memberof CategorySubscriber
     */
    async beforeInsert(event: InsertEvent<Category>) {
        if (!event.entity.slug) {
            event.entity.slug = await this.generateUniqueSlug(event);
        }
    }

    /**
     * 为slug生成唯一值
     *
     * @param {InsertEvent<Category>} event
     * @returns {Promise<string>}
     * @memberof CategorySubscriber
     */
    async generateUniqueSlug(event: InsertEvent<Category>): Promise<string> {
        const slug = `gkr_${crypto.randomBytes(4).toString('hex').slice(0, 8)}`;
        const category = await event.manager.findOne(Category, {
            slug,
        });
        return !category ? slug : await this.generateUniqueSlug(event);
    }
}

```

把事件观察者添加到`ContentModule`的提供者列表中

```typescript
// src/content/content.module.ts
// ...
import * as subscriberMaps from './subscribers';

const subscribers = Object.values(subscriberMaps);
const providers = [...subscribers, ...dtos, ...services];
```

## 访问控制

### 全局管道

默认的`ValidationPipe`如果作为全局验证管道是无法设置自定义选项的,所以我们需要自定义一个管道来作为全局的数据验证管道,自定义管道继承自`ValidationPipe`

先安装一个`deepmerge`用于深度合并`ValidationPipe`的默认选项和在`dto`里我们自定义的选项

```shell
~ yarn add deepmerge
```

创建文件

> 记得在相邻的index.ts中导出pipe

```shell
~ touch src/core/constants.ts \
  && mkdir src/core/pipes \
  && touch src/core/pipes/dto.validation.pipe.ts \
  && mkdir src/core/decorators \
  && touch src/core/decorators/dto-validation-options.decorator.ts \
  && touch src/core/decorators/index.ts
```

编写验证器

```typescript
// src/core/constants.ts
// 为DTO存储自定义原元素(管道选项)的常量
export const DTO_VALIDATION_OPTIONS = 'dto_validation_options';

// src/core/decorators/dto-validation-options.decorator.ts
// 用于DTO类顶部自定义全局管道选项
export const DtoValidationoOptions = (
    options?: ValidatorOptions & { transformOptions?: ClassTransformOptions },
) => SetMetadata(DTO_VALIDATION_OPTIONS, options ?? {})

// src/core/pipes/dto.validation.pipe.ts
// ...
import merge from 'deepmerge';
@Injectable()
export class DtoValidationPipe extends ValidationPipe {
    async transform(value: any, metadata: ArgumentMetadata) {
        const { metatype, type } = metadata;
        // 获取要验证的dto类
        const dto = metatype as any;
        // 获取dto类的装饰器元数据中的自定义验证选项
        const options = Reflect.getMetadata(DTO_VALIDATION_OPTIONS, dto) || {};
        // 把当前已设置的选项解构到备份对象
        const originOptions = { ...this.validatorOptions };
        // 把当前已设置的class-transform选项结构到备份对象
        const originTransform = { ...this.transformOptions };
        // 把自定义的class-transform和type选项解构出来
        const {
            transformOptions,
            type: optionsType,
            ...customOptions
        } = options;
        // 根据DTO类上设置的type来设置当前的DTO请求类型,默认为'body'
        const requestType: Paramtype = optionsType ?? 'body';
        // 如果被验证的DTO设置的请求类型与被验证的数据的请求类型不是同一种类型则跳过此管道
        if (requestType !== type) return value;

        // 合并当前transform选项和自定义选项
        if (transformOptions) {
            this.transformOptions = merge(
                this.transformOptions,
                transformOptions ?? {},
                {
                    arrayMerge: (_d, s, _o) => s,
                },
            );
        }
        // 合并当前验证选项和自定义选项
        this.validatorOptions = merge(
            this.validatorOptions,
            customOptions ?? {},
            {
                arrayMerge: (_d, s, _o) => s,
            },
        );
        // 验证并transform dto对象
        let result = await super.transform(value, metadata);
        // 如果dto类中存在transform方法,则返回调用进一步transform之后的结果
        if (typeof dto.transform === 'function') {
            result = await dto.transform(result);
        }
        // 重置验证选项
        this.validatorOptions = originOptions;
        // 重置transform选项
        this.transformOptions = originTransform;
        return result;
    }
}

```

把验证器添加到全局验证

```typescript
// src/core/core.module.ts
// ...
import { DtoValidationPipe } from './pipes';
const providers = [
    {
        provide: APP_PIPE,
        useFactory: () =>
            new DtoValidationPipe({
                transform: true,
                forbidUnknownValues: true,
                validationError: { target: false },
            }),
    },
];
@Global()
@Module({
    imports: [TypeOrmModule.forRoot(database), RouterModule.forRoutes(routes)],
    providers: [...providers],
})
// ...
```

### 编写DTO

有了全局验证管道之后,接下来可以为每个`DTO`添加验证字段,我们先创建`CreateDto`

> 别忘了顶部加上我们的验证器选项,没有分组的不需要添加groups选项,skipMissingProperties选项是为了更新时跳过没有写入的属性验证

```typescript
//src/content/dtos/create-category.dto.ts
//...
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

//src/content/dtos/create-article.dto.ts
// ...
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
// src/content/dtos/create-category.dto.ts
// ...
@Injectable()
@DtoValidationoOptions({ type: 'query' })
export class QueryArticleDto {
    @IsOptional()
    @IsUUID()
    category?: string;
}
//src/content/dtos/create-comment.dto.ts
//...
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
```

所有的`UpdateDto`都继承自`CreateDto`,所以在创建`UpdateDto`之前为了后面编写`OpenApi`注释时系统能自动把`UpdateDto`中继承过来的属性标识为可选项,需要使用`PartialType`函数,所以我们需要先安装nestjs的swagger适配器

```shell
~ yarn add @nestjs/swagger fastify-swagger
```

```typescript
// src/content/dtos/update-category.dto.ts
// ...
@Injectable()
@DtoValidationoOptions({ skipMissingProperties: true, groups: ['update'] })
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    // 在create组下必填
    @IsDefined({ groups: ['update'] })
    @IsUUID(undefined, { groups: ['update'] })
    id!: string;
}
// src/content/dtos/update-article.dto.ts
//. ...
@Injectable()
@DtoValidationoOptions({ skipMissingProperties: true, groups: ['update'] })
export class UpdateArticleDto extends PartialType(CreateArticleDto) {
    // 在create组下必填
    @IsDefined({ groups: ['update'] })
    @IsUUID(undefined, { groups: ['update'] })
    id!: string;
}
```

### 控制器CRUD

写好Dto之后我们就可以写控制器了,现在我们的任务很简单,就是编写简单的CRUD

当前因为没有写`service`,所以就用返回字符代替一下.类似下面这样

> 评论管理后面是通过用户来过滤的并且没有`show`,暂时也不需要写`index`而直接通过文章关联查询称呼来,所以`store`和`destory`就行

示例

```typescript
// src/content/controllers/article/article.controller.ts
// ...
export class ArticleController extends BaseController {
    @Get()
    async index(
        @Query()
        { category }: QueryArticleDto,
    ) {
        return [];
    }

    @Get(':id')
    async show(@Param('id', new ParseUUIDPipe()) id: string) {
        return 'one article';
    }

    @Post()
    async store(data: CreateArticleDto) {
        return 'result';
    }

    @Patch()
    async update(data: UpdateArticleDto) {
        return 'result';
    }

    @Delete(':id')
    async destroy(@Param('id', new ParseUUIDPipe()) id: string) {
        return 'result';
    }
}
```

## 服务与数据

现在让我们来编写真实的数据操作

当一个模型没有自定义`Repository`的时候(例如`Comment`),像下面这样注入服务

```typescript
    // constructor(
    //     @InjectRepository(Comment)
    //     private commentRepository: Repository<Comment>,
    // ) {
    // }
```



### 服务方法

为三个服务类添加CRUD方法

> 具体代码请查看本教程源文件,请切换chapter1分支

**CategoryService**

```typescript
// src/content/services/category.service.ts
// ...
@Injectable()
export class CategoryService {
    // ...

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

```

**ArticleService**

```typescript
// src/content/services/article.service.ts
// ...
type FindParams = {
    category?: string;
};
@Injectable()
export class ArticleService {
    // ....

    /**
     * 根据条件获取文章查询的Query
     *
     * @protected
     * @param {FindParams} [params={}]
     * @param {FindHook} [callback]
     * @returns
     * @memberof ArticleService
     */
    protected async getQuery(params: FindParams = {}, callback?: FindHook) {
        let query = this.articleRepository
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.categories', 'cat')
            .loadRelationCountAndMap('a.commentsCount', 'a.comments');
        if (callback) {
            query = await callback(query);
        }
        if (params?.category) {
            query = await this.queryByCategory(params.category, query);
        }
        return query;
    }

    /**
     * 查询出分类及其后代分类下的所有文章
     *
     * @param {string} id
     * @param {SelectQueryBuilder<Article>} query
     * @returns
     * @memberof ArticleService
     */
    async queryByCategory(id: string, query: SelectQueryBuilder<Article>) {
        const root = await this.categoryService.findOneOrFail(id);
        const tree = await this.categoryRepository.findDescendantsTree(root);
        const flatDes = await this.categoryService.toFlatTrees(tree.children);
        const ids = [tree.id, ...flatDes.map((item) => item.id)];
        return query.where('cat.id IN (:...ids)', {
            ids,
        });
    }
}

```

**CommentService**

```typescript
// src/content/services/comment.service.ts
@Injectable()
export class CommentService {
    // ...
}

```

你会发现服务类中有许多诸如

```typescript
const { parent, ...createData } = createDto;
        const data: Omit<CreateCategoryDto, 'parent'> & {
            parent?: Category;
        } = { ...createData };
        if (parent) {
            data.parent = await this.categoryRepository.findOneOrFail(parent);
        }
```

这样非常冗余的代码,别急,后面的教程我们会通过自定义约束规则来缩减

### 服务调用

写完服务我们就可以在控制器中愉快的调用了,使用`service`后的控制器如下

```typescript
// src/content/controllers/article/article.controller.ts
@Controller('manage/articles')
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
```

### 模块路由

因为Nestjs默认的路由是无法嵌套的,所以我们需要下载一个[nest-router](https://github.com/nestjsx/nest-router)来实现嵌套路由

> 后面的教程我们会讲解如何自己实现更加好的中心化路模块并与open api结合

```shell
~ yarn add nest-router
```

创建路由配置文件并在`config/index.ts`中导出

```shell
~ touch src/config/routes.config.ts
```

```typescript
// src/config/routes.config.ts
// ...
export const routes: Routes = [
    {
        path: '/content',
        module: ContentModule,
    },
];
```

在`CoreModule`中注册

```typescript
// src/content/content.module.ts
imports: [
        //...
    RouterModule.forRoutes(routes),
],
```

## 启动应用

> 大家会觉得每个读取数据接口必须先创建数据然后复制ID,这样的方法太麻烦
>
> 没关系,后面我们会学习编写测试以及自动注入初始数据等,这样就能进行自动化测试了,并且后续还会使用到自动生成的swagger api文档,非常方便

在创建完项目后,我们尝试启动项目并测试接口

```shell
~ yarn start:dev
```

下载[insomnia](https://insomnia.rest/)

> 当然你可以用[postman](https://www.postman.com/)等其它工具

新建一个`workspace`,命名为`nest-practice`

![image-20201021205516295](https://pic.lichnow.com/media/20201021205645.png)

添加名为`development`的`Sub Environments`,并写入

```json
{
  "base_url": "http://localhost:3000"
}
```

然后选择`development`这个子环境

![image-20201021210111691](https://pic.lichnow.com/media/20201021210114.png)

创建好之后的接口如下

![image-20201022014651558](/Users/lichnow/Library/Application Support/typora-user-images/image-20201022014651558.png)

具体操作流程是首先在`create`接口中先创建一个数据,再复制返回的`Id`放入`show`,`update`,`delete`中进行测试

如果全部接口都没有问题,这节教程基本就结束了！
