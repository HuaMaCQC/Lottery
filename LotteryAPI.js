const koa = require('koa');
const app = new koa();
const Router = require('koa-router');
const router = new Router();
const controller = require('./controller');
const Lottery = require('./Lottery'); 
const tjklsf = new Lottery();

router.get('/:id',async(ctx)=>{ 
    await controller.create(ctx); //導向控制器 
});
app.use(router.routes());
app.listen(3000);

//天津快樂十分
//let aaa = new Lottery.schedule
//console.log()
//tjklsf.rule.minute=[new Lottery.schedule.Range(2.2,20.1,0.1)];
let time = []; //每秒執行一次
for (let i = 0 ; i < 60 ; i ++)time.push(i);
tjklsf.rule.second = time; 
tjklsf.type = 46; //彩票編號
tjklsf.maxNum=20; //最大20
tjklsf.minNum=1; //最小1
tjklsf.n =8; //8個號碼
tjklsf.scheduleCronstyle(); //啟動計時

/*
const bjpk10 = new Lottery(); //建立
bjpk10.rule.second=[0,5,10,15,20,25,30,35,40,45,50,55];
bjpk10.type = 45;
bjpk10.maxNum=10;
bjpk10.minNum=1;
bjpk10.n =10;
bjpk10.scheduleCronstyle();*/