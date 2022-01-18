"use strict";
const SetDB = require('./set_db.js');
let moment = require('moment');
module.exports = {
    create: async ctx => {
        let row = 5;
        let ctxRow = ctx.query.row;
        if (ctxRow != undefined && ctxRow < 21 && ctxRow > 5 && typeof(ctxRow) === 'number') { //限制數量 5~20
            row = ctxRow; //給與數量
        }
        try {
            if (ctx.query.key != undefined) { //有沒有給key
                if (await SetDB.getkey(ctx.query.key) === true) { //檢查key是否正確   
                    ctx.body = await SetDB.selectDB(ctx.params.id, row, moment()); //給資料
                }
            }
        } catch (error) {
            console.log(error);
        }

    }
}