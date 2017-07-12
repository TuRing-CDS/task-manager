import * as compose from "koa-compose";
import {Task} from "./task";

interface ManagerOptions {
    threadNumber: number;
}

const defaultOptions: ManagerOptions = {
    threadNumber: 3
};

export class Manager<T> {

    private options: ManagerOptions;

    private tasks: Set<Task<T>> = new Set();

    private taskSteps: Array<compose.Middleware<T>> = [];

    private middleware: Map<String, compose.Middleware<T>> = new Map();

    constructor(options: ManagerOptions = defaultOptions) {
        this.options = Object.assign({}, defaultOptions, options);
    }

    onCreate(create: compose.Middleware<T>) {
        this.middleware.set('create', create);
    }

    setTaskSteps(steps: Array<compose.Middleware<T>>) {
        this.taskSteps = steps;
    }

    addTaskStep(step: compose.Middleware<T>) {
        this.taskSteps.push(step);
    }
    
    async start(ctx: T) {
        while (this.tasks.size < this.options.threadNumber) {
            await this.runTask(ctx);
        }
    }

    async runTask(ctx: T) {
        const task = new Task<T>();
        this.taskSteps.forEach((step) => {
            task.use(step);
        });
        this.tasks.add(task);
        task.start(Object.assign({}, ctx)).then(() => {
            this.tasks.delete(task);
            this.start(ctx);
        }).catch((err: Error) => {
            this.tasks.delete(task);
            this.start(ctx);
        })
    }

}