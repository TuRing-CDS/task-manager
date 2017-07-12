import * as compose from 'koa-compose'

export class Task<T> {

    private middleware: Array<compose.Middleware<T>> = [];

    use(middleware: compose.Middleware<T>) {
        this.middleware.push(middleware);
    }

    start(ctx: T) {
        return compose(this.middleware)(ctx).then(() => {
            return ctx;
        })
    }

}