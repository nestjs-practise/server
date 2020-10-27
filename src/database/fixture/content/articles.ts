export interface IArticleData {
    title: string;
    summary?: string;
    contentFile: string;
}
export const data: IArticleData[] = [
    {
        title: '基于角色和属性的Node.js访问控制',
        contentFile: 'rbac.md',
    },
    {
        title: 'docker简介',
        contentFile: 'docker-introduce.md',
    },
    {
        title: 'go协程入门',
        contentFile: 'goroutings.md',
    },
    {
        title: '基于lerna.js构建monorepo',
        contentFile: 'lerna.md',
    },
    {
        title: '通过PHP理解IOC编程',
        contentFile: 'php-di.md',
    },
    {
        title: '玩转React Hooks',
        contentFile: 'react-hooks.md',
    },
    {
        title: 'TypeORM fixtures cli中文说明',
        contentFile: 'typeorm-fixtures-cli.md',
    },
    {
        title: '使用yargs构建node命令行(翻译)',
        contentFile: 'yargs.md',
    },
    {
        title: 'Typescript装饰器详解',
        summary:
            '装饰器用于给类,方法,属性以及方法参数等增加一些附属功能而不影响其原有特性。其在Typescript应用中的主要作用类似于Java中的注解,在AOP(面向切面编程)使用场景下非常有用',
        contentFile: 'typescript-decorator.md',
    },
];
