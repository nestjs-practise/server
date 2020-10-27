export interface ICategoryData {
    name: string;
    children?: ICategoryData[];
}
export const data: ICategoryData[] = [
    {
        name: '教程',
        children: [
            {
                name: 'Ts实战',
            },
            {
                name: 'go语言实战',
            },
        ],
    },
    {
        name: '笔记',
        children: [
            {
                name: 'javascript',
            },
            {
                name: 'php',
                children: [{ name: 'laravel' }],
            },
            {
                name: 'java',
            },
            {
                name: 'python',
            },
            {
                name: 'go',
            },
            {
                name: '架构',
            },
        ],
    },
];
