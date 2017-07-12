import {Manager} from '../manager';

interface IContext {
    [propName: string]: any
}

async function sleep(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 1000 * time)
    })
}

const manager = new Manager<IContext>();
let id = 0;
manager.setTaskSteps([
    async (context: IContext, next: Function) => {
        console.log('开始获取作业信息', id);
        id++;
        context.id = id;
        context.time = Date.now();
        console.time(`${context.id}:${context.time}`);
        await sleep(context.id);
        return next();
    },
    async (context: IContext, next: Function) => {
        console.log('开始执行任务,提交到shipyard'+context.id);
        await sleep(context.id);
        return next();
    },
    async (context: IContext, next: Function) => {
        await sleep(context.id);
        console.log('检查任务是否完成...........');
        console.timeEnd(`${context.id}:${context.time}`);
    }
]);

manager.start({});