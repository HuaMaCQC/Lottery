const Lottery = require('./Lottery_schedule'); 

//天津快樂十分
module.exports ={
    lottert_service:()=>{
        //天津快樂十分
        const tjklsf = new Lottery(20,1,46,72,8,'001',9,10,22,50); //建立
        tjklsf.rule.minute = [0,10,20,30,40,50]; //每10分鐘
        tjklsf.scheduleCronstyle(); //啟動計時
        

        //北京PK拾
        const pypk10 = new Lottery(); //建立
        pypk10.rule.minute=[0,5,10,15,20,25,30,35,40,45,50,55];
        //pypk10.rule.second = [5,35]
        pypk10.type = 45;
        pypk10.maxNum=10;
        pypk10.minNum=1;
        pypk10.n =10;
        pypk10.startHour = 9; //開始於幾點
        pypk10.startminute = 7; //開始於幾分
        pypk10.endHour = 23; //結束於幾點
        pypk10.endminute = 57; //結束於幾分
        pypk10.scheduleCronstyle();
    }
}
