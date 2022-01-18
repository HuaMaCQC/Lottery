const koa = require('koa');
const app = new koa();
const Router = require('koa-router');
const router = new Router();
const controller = require('./controller');

module.exports = {
    api: () => {
        //路由器
        router.get('/:id', async (ctx) => {
            await controller.create(ctx); //導向控制器 
        });
        app.use(router.routes());
        app.listen(3000);
    }
}


