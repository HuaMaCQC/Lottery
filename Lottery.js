
const SetDB = require('./SetDB.js');
let schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
Date.prototype.yyyymmdd = function() { //日期排序
    let mm = this.getMonth() + 1; // getMonth() is 重0開始
    let dd = this.getDate();
    let h = this.getHours();
    let m = this.getMinutes();
    let s = this.getSeconds();

    return [this.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
       ].join('-') +" "+ [ (h>9 ? '' : '0') + h,
        (m>9 ? '' : '0') + m,
        (s>9 ? '' : '0') + s
        ].join(':');
}
class lottrtyNumber {
    /**
     * @param {rule} rule 觸發規則 
     * @param {Number} type 財種
     */
    constructor(rule,type){
        this.rule =  new schedule.RecurrenceRule(rule);
        this.maxNum = 10; //亂數最大值
        this.minNum = 1; //亂數最小值
        this.type = 0; //中獎類別
        this.InspectionSecond = 86400; //server斷線後 再啟動檢查時間間隔超過多少不再新增
        this.n=10; //生產的個數
    }
    scheduleCronstyle() //定時任務
    {  
        let regainSql =''; //server需要回復的資料
        let dbConnect = true; //偵測資料是否開始被存入資料庫
        let dbConnect_1 = false; //偵測 資料庫最新資料更新是否開始
        let lastTime = '';//DB產生的資料暫存
        let issues = '';
        let me = this;
        let nextTime = new Date(); //下一次執行的時間
        let time = []; //每秒執行一次
        for (let i = 0 ; i < 60 ; i ++){
            time.push(i);
        }
        rule.second = time;
        schedule.scheduleJob(rule, function(){//定時任務 
            //與DB連線失敗
            if(regainSql =='' &&  !dbConnect_1){  //如果伺服器與DB第一次連線了 
                dbConnect_1=true;
                SetDB.getRegainDbSql(me.rule,me.InspectionSecond,me.type,me.minNum,me.maxNum,me.n,(sql,m_issues,m_nextTime)=>{ 
                    regainSql = sql;              //取得需要恢復的資料
                    issues = m_issues;
                    nextTime = m_nextTime;
                    dbConnect_1=true;                
                    dbConnect=false;             //成功取道最新資料才開始恢復
                },err=>{
                    dbConnect_1=false
                })
            }else if(regainSql !='' && !dbConnect) { //恢復DB
                dbConnect = true;
                SetDB.saveSql(regainSql,()=>{
                    console.log('DB復原成功:'+regainSql);
                    regainSql='';
                    dbConnect = false; 
                },err=>{
                    console.log('復原失敗');
                    dbConnect = false;
                });
            }
            //定時產生
             if( String(nextTime) == String(new Date() )){ //下次時間到了
                 SetDB.saveLottery(me.type,me.maxNum,me.minNum,me.n,issues,(msg,m_issues)=>{//儲存成功
                    console.log('儲存成功'+msg);
                     issues=m_issues; //取得期數
                     nextTime = a.nextInvocationDate();//獲取下次產生亂數時間
                 },(sql,_sql,m_issues,err)=>{//儲存失敗
                    console.log('server異常');
                    dbConnect_1 = false;
                    regainSql = '';
                    dbConnect = true;
                });
            }
        });
        
        
    }
}
module.exports = lottrtyNumber;
module.exports.schedule = schedule;
/*
let lottrty_1 = new lottrtyNumber();
lottrty_1.rule.second=[0,5,10,15,20,25,30,35,40,45,50,55];
lottrty_1.type = 46;
lottrty_1.maxNum=10;
lottrty_1.minNum=1;
lottrty_1.scheduleCronstyle();*/


