const SetDB = require('./SetDB');
let schedule = require('node-schedule');
class lottrtyNumber  {
    /**
     * @param {Number} maxNum 最大號碼
     * @param {Number} minNum 最小號碼
     * @param {Number} InspectionHour server斷線超過多少小時不回復
     * @param {String} issueFirst 編碼格式 '001'
     * @param {Number} n 產生多少個號碼
     * @param {rule} rule 觸發規則 
     * @param {Number} type 財種
     * @param {Number} startHour 每日幾點開始開獎  
     * @param {Number} startminute 每日幾分開始開獎
     * @param {Number} endHour 每日幾點結束開獎
     * @param {Number} endminute 每日幾分結束開獎
     */
    constructor(
        maxNum = 10,
        minNum=1,
        type = 0,
        InspectionHour=48,
        n= 10,
        issueFirst = '001',
        startHour = 0,
        startminute = 0,
        endHour = 23,
        endminute = 0,
    )
    {
        this.rule =  new schedule.RecurrenceRule();
        this.maxNum = maxNum;
        this.minNum=minNum;
        this.type = type;
        this.InspectionHour=InspectionHour;
        this.n= n;
        this.issueFirst = issueFirst;
        this.startHour = startHour;
        this.startminute = startminute;
        this.endHour = endHour;
        this.endminute = endminute;
    }
    scheduleCronstyle(){  //定時任務
        let startTime =this.startHour*60 + this.startminute ;
        let endTime = this.endHour*60 + this.endminute;
        let getLottery = false; //有沒有取得樂透
        let regainSql =''; //server需要回復的資料
        let dbConnect = true; //偵測資料是否開始被存入資料庫
        let dbConnect_1 = false; //偵測 資料庫最新資料更新是否開始
        let lastTime = ''; //DB產生的資料暫存
        let issue = ''; //期數
        let me = this;
        let nextTime = new Date(); //下一次執行的時間
        setInterval(()=>{//定時任務
            //與DB連線失敗
            if(regainSql =='' &&  !dbConnect_1){  //如果伺服器與DB第一次連線了 與DB資料同步 
                dbConnect_1=true; //關閉(防止重複執行)
                SetDB.getRegainDbSql(me,startTime,endTime,(sql,m_issue,m_nextTime)=>{
                    regainSql = sql;         //取得需要恢復的資料
                    issue = m_issue;      //取得最新一筆的期數
                    nextTime = m_nextTime; //取得最新一筆生產的時間
                    dbConnect_1=true;               
                    dbConnect=false;      //成功取道最新資料才開始恢復
                },err=>{    //連線異常
                    dbConnect_1=false; //打開       
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
            if(!dbConnect){ //如果已經檢查完資料庫
                if( nextTime.getTime() <= new Date().getTime() && !getLottery ){ //下次時間到了
                    getLottery = true;
                     SetDB.saveLottery(me,issue,nextTime,(msg,m_issue)=>{//儲存成功
                        console.log('儲存成功'+msg+'現在時間:'+new Date());
                         issue=m_issue; //取得期數
                         do{
                            nextTime = me.rule.nextInvocationDate(nextTime);//獲取下次產生亂數時間 
                         }while( ((nextTime.getHours()*60)+ nextTime.getMinutes()) < startTime ||
                          ((nextTime.getHours()*60)+ nextTime.getMinutes()) >endTime );
                         getLottery = false;
                     },(sql,_sql,m_issue,err)=>{//儲存失敗
                        getLottery = false;
                        console.log('server異常');
                        dbConnect_1 = false;
                        regainSql = '';
                        dbConnect = true;
                    });
                }
            }  
        },10000);
    }
}
module.exports = lottrtyNumber;