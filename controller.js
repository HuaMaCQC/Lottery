const SetDB = require('./set_db.js');
let moment = require('moment');
module.exports = {
    create: async ctx => {
        let row = 1; //預設數量為1
        if (ctx.query.row != undefined && ctx.query.row < 21 && ctx.query.row > 4) { //限制數量 5~20
            row = ctx.query.row; //給與數量
        }
        if (ctx.query.key != undefined) { //有沒有給key
            if (await SetDB.getket(ctx.query.key) === true) { //檢查key是否正確   
                ctx.body = await SetDB.selectDB(ctx.params.id, row, moment()); //給資料
            }
        }
    }
}