const SetDB = require('./set_db');
let schedule = require('node-schedule');
const moment = require('moment');

class lottrtyNumber {
    /**
     * @param {Object} lotteryNum 
     * @param {Number} lotteryNum.maxNum 
     * @param {Number} lotteryNum.minNum  
     * @param {Number} lotteryNum.n - 樂透號碼設定
     * - maxNum  最大號碼  
     * - minNum  最小號碼  
     * - n 產生多少個號碼
     * @param {Object} lotteryType 
     * @param {Number} lotteryType.type
     * @param {String} lotteryType.issueFirst  樂透編碼設定 
     * - type 彩種 
     * - issueFirst 編碼格式 '001'
     * @param {Object} lotterySchedule 
     * @param {Number} lotterySchedule.InspectionHour
     * @param {Number} lotterySchedule.startHour
     * @param {Number} lotterySchedule.startMinute
     * @param {Number} lotterySchedule.endHour
     * @param {Number} lotterySchedule.endMinute 開獎時間設定 
     * - InspectionHour  server斷線超過多少小時不回復
     * - startHour 每日幾點開始開獎
     * - startMinute 每日幾分開始開獎
     * - endHour 每日幾點結束開獎
     * - endMinute 每日幾分結束開獎
     */
    constructor(
        lotteryNum = { maxNum: 10, minNum: 1, n: 10 },
        lotteryType = { type: 0, issueFirst: '001' },
        lotterySchedule = { InspectionHour: 48, startHour: 0, startMinute: 0, endHour: 23, endMinute: 55 }) {

        this.rule = new schedule.RecurrenceRule(); //觸發規則
        this.maxNum = lotteryNum.maxNum || 10; //最大號碼
        this.minNum = lotteryNum.minNum || 1; //最小號碼
        this.n = lotteryNum.n || 10;  //產生多少個號碼
        this.type = lotteryType.type || 0; //彩種
        this.issueFirst = lotteryType.issueFirst || '001'; //編碼格式 '001'
        this.InspectionHour = lotterySchedule.InspectionHour || 48; //server斷線超過多少小時不回復
        this.startHour = lotterySchedule.startHour || 0; //每日幾點開始開獎
        this.startMinute = lotterySchedule.startMinute || 0; //每日幾分開始開獎
        this.endHour = lotterySchedule.endHour || 23; //每日幾點結束開獎
        this.endMinute = lotterySchedule.endMinute || 55; //每日幾分結束開獎
    }
    scheduleCronstyle() {  //定時任務
        let dbConnect = false; //偵測資料是否開始被存入資料庫
        let me = this;
        let startTime = moment().hour(me.startHour).minute(me.startMinute).second(0).subtract(1, 's');
        let endTime = moment().hour(me.endHour).minute(me.endMinute).second(0).add(1, 's');
        let today = moment();
        setInterval(() => {//定時任務
            if (today.isBefore(moment().add(1, 'day'), 'day')) { //現在的時間是否在範圍內
                if (!dbConnect) {  //如果伺服器與DB第一次連線了 與DB資料同步
                    dbConnect = true; //關閉(防止重複執行)
                    SetDB.getRegainDbSql(me, startTime, endTime, today, (sql, m_strat, m_end) => {
                        if (sql == '') { //如果不需要儲存資料
                            dbConnect = false;
                            startTime = m_strat; //取得明天要產生的
                            endTime = m_end;
                        } else {
                            SetDB.saveSql(sql, () => {
                                console.log('儲存成功')
                                startTime = m_strat;
                                endTime = m_end;
                                dbConnect = false;
                            }, err => {
                                console.log('儲存失敗');
                            })
                        }
                    }, err => {    //連線異常
                        console.log('連線異常');
                        dbConnect = false; //打開       
                    })
                }
            }
        }, 1000);
    }
}
module.exports = lottrtyNumber;