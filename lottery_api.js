"use strict";
const koa = require('koa');
const app = new koa();
const Router = require('koa-router');
const router = new Router();
const controller = require('./controller');

let init = false;

module.exports = {
    api: () => {
        if (!init) {
            //路由器
            router.get('/:id', async (ctx) => {
                await controller.create(ctx); //導向控制器 
            });
            app.use(router.routes());
            app.listen(3000);
            init = true;
        } else {
            console.log('api inited');
        }

    }
}


