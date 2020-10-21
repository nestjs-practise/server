# 第零步

[typescript]: https://www.typescriptlang.org/	"typescript"
[yarn]: https://classic.yarnpkg.com/zh-Hans/	"Yarn"
[node.js]: https://nodejs.org/zh-cn/	"Node.js"
[nestjs]: https://nestjs.com/	"nestjs"
[n]: https://github.com/tj/n	"n"
[nvm]: https://github.com/nvm-sh/nvm	"nvm"
[npm-check-updates]: https://github.com/raineorshine/npm-check-updates	"npm-check-updates"
[nestjs cli]: https://docs.nestjs.com/cli/overview	"nestjs cli"
[vscode]: https://code.visualstudio.com/	"vscode"
[vscode-eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint	"vscode-eslint"
[vscode-prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode	"vscode-prettier"
[Airbnb]: https://github.com/airbnb/javascript	"aribnb"
[standard]: https://standardjs.com/	"standard"
[eslint]: https://eslint.org/	"eslint"
[prettier]: https://prettier.io/	"prettier"
[golang]: https://golang.org/	"golang"

本套Nestjs教程(包括视频,文档,源码)均抱着免费+开源态度为大家学习使用Typescript进行全栈开发提供助力

## 安装环境

> 如果没有安装[brew](https://brew.sh/)请先安装,如果是windows请安装[chocolatey](https://chocolatey.org/install)

**建议:安装到GLOBAL里面的东西统一使用一个包管理器,我这里使用[Yarn][]**

安装[Node.js][]

```shell
~ brew install node
```

配置npm淘宝镜像

```shell
~ npm config set registry https://registry.npm.taobao.org
```

安装[yarn][]

```shell
~ npm i -g yarn
```

配置[yarn][]淘宝镜像

```shell
~ yarn config set registry https://registry.npm.taobao.org
```

安装镜像管理工具

```shell
~ yarn global add yrm
```

建议安装一个[Node][node.js]版本管理工具比如[n][]或者[nvm][]

```shell
~ yarn global add n
```

安装[npm-check-updates][],这样方便一次升级所有包

```shell
~ yarn global add npm-check-updates
```

安装[nestjs cli][]

```shell
~ yarn global add @nestjs/cli
```

## 初始化项目

创建目录

```shell
~ cd Code && mkdir -p learn/nestjs/server && cd $_
```

创建项目

```shell
~ nest new server # 创建的时候选择yarn,以便后面可做成Monorepo架构
```

## 开发工具

对于[Node.js][],[Typescript][],前端等技术最好的开发工具毋庸置疑的就是[VScode][],任何其它选项(包括vim,emacs,sublime text,atom,webstorm等等)都有这样那样的问题需要去耗费精力,所以建议一步到位,直接使用VScode进行开发

> 最新版VSCode已经自带同步配置和插件的功能,建议启用

安装[vscode][]

```shell
~ brew install vscode
```

安装[eslint][vscode-eslint]插件和[prettier][vscode-prettier]插件

```shell
~ code --install-extension dbaeumer.vscode-eslint \
  && code esbenp.prettier-vscode
```

配置[eslint][vscode-eslint]插件

```json
{
    "editor.formatOnSave": false,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}

```

## 代码规则

### TS编译配置

> 关于[typescript][]的编译配置我会在其它的基础类的文章或者视频里细讲

tsconfig.json

```json
{
    "compilerOptions": {
        "strict": true,
        "target": "es2020",
        "module": "commonjs",
        "moduleResolution": "node",
        "declaration": true,
        "removeComments": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "alwaysStrict": true,
        "sourceMap": true,
        "incremental": true,
        "forceConsistentCasingInFileNames": true,
        "isolatedModules": true,
        "esModuleInterop": true,
        "noUnusedLocals": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "allowSyntheticDefaultImports": true,
        "pretty": true,
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "noImplicitAny": true,
        "allowJs": true,
        "lib": ["esnext", "dom.iterable", "dom", "scripthost", "es2015.symbol"],
        "outDir": "./dist",
        "baseUrl": "./",
        "paths": {
            "@/*": ["src/*"]
        }
    },
    "exclude": ["node_modules", "dist", "uploads"]
}
```

tsconfig.build.json

```json
{
    "extends": "./tsconfig.json",
    "exclude": ["node_modules", "test", "dist", "**/*spec.ts", "uploads"]
}
```

### 代码风格

我个人习惯使用[airbnb][]规范,当然你可以按你的习惯来使用不同的编码法规范,比如[standard][]或者直接使用recommand.他们都具有各自兼容[typescript][]的库.

> [prettier][]用于格式化代码,但是部分配置与[eslint][]冲突,我们通过prettier/@typescript-eslint来解决冲突,这个包帮我们使用eslint来调用[prettier][]而不是直接通过[prettier][]来格式化

安装依赖

```shell
# typescript-eslint
~ yarn add eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin -D
# airbnb
~ yarn add eslint-config-airbnb-typescript eslint-plugin-import -D
# prettier
~ yarn add prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-organize-imports -D
```

以下是我的[eslint][]配置

> 每个人或者每个团队有自己的不同编码风格,ts/js不像[golang][]那么整齐划一,所以为了统一团队或者自己所有项目的编码风格,尽量摸索出适合自己的[eslint][]配置

```javascript
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        createDefaultProgram: true,
        ecmaVersion: '2020',
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    env: {
        node: true,
        jest: true,
    },
    plugins: ['@typescript-eslint', 'import'],
    extends: [
        // 兼容typescript的airbnb规范
        // https://github.com/iamturns/eslint-config-airbnb-typescript
        'airbnb-typescript/base',
        
        // typescript的eslint插件
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        
        // 使用prettier格式化代码
        // https://github.com/prettier/eslint-config-prettier#readme
        'prettier',
        // 整合typescript-eslint与prettier
        'prettier/@typescript-eslint',
        // 整合eslint recommend规范与prettier
        // https://github.com/prettier/eslint-plugin-prettier
        'plugin:prettier/recommended',
    ],
    rules: {
        // ...规则可以根据自己的需要配置,也可以参考本教程源代码配置
    },

    settings: {
        'import/resolver': {
            node: {
                extensions: ['.ts', '.tsx', '.js', '.jsx'],
            },
        },
    },
};

```

`.prettierrc`,`.editorconfig`,`.prettierignore`三个文件的配置请参考源代码或者按需配置

配置好以后打开[Eslint][vscode-eslint],如下图

![](https://pic.lichnow.com/media/20201017005904.png)

![](https://pic.lichnow.com/media/20201017005917.png)

至此,所有配置完成,现在重启[vscode][]就可以进入下一节学习如何愉快的使用[Nestjs]][]构建应用了

