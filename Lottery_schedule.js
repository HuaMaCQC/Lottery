"use strict";
const SetDB = require('./set_db');
let schedule = require('node-schedule');

class lottrtyNumber {
    /**
     * @param {Object} lotteryNum
     * @param {Boolean}lotteryNum.repeat 
     * @param {Number} lotteryNum.maxNum 
     * @param {Number} lotteryNum.minNum  
     * @param {Number} lotteryNum.n - 樂透號碼設定
     * - repeat 是否重複
     * - maxNum  最大號碼  
     * - minNum  最小號碼  
     * - n 產生多少個號碼
     * @param {Object} lotteryType 
     * @param {Number} lotteryType.type
     * @param {String} lotteryType.issuerule  樂透編碼設定 
     * - type 彩種 
     * - issuerule 編碼格式 '001'
     * @param {Object} lotterySchedule
     * @param {Number} lotterySchedule.rule  
     * @param {Number} lotterySchedule.InspectionHour
     * @param {Number} lotterySchedule.startHour
     * @param {Number} lotterySchedule.startMinute
     * @param {Number} lotterySchedule.endHour
     * @param {Number} lotterySchedule.endMinute 開獎時間設定 
     * - rule 開獎時間規則(分鐘)
     * - InspectionHour  server斷線超過多少小時不回復
     * - startHour 每日幾點開始開獎
     * - startMinute 每日幾分開始開獎
     * - endHour 每日幾點結束開獎
     * - endMinute 每日幾分結束開獎
     */
    constructor(
        lotteryNum = { repeat: false, maxNum: 0, minNum: 0, n: 0 },
        lotteryType = { type: 0, issuerule: '001' },
        lotterySchedule = { rule: 5, InspectionHour: 48, startHour: 0, startMinute: 0, endHour: 0, endMinute: 0 }
    ) {
        this.repeat = lotteryNum.repeat || false;
        this.rule = lotterySchedule.rule || 0; //觸發規則
        this.maxNum = lotteryNum.maxNum || 0; //最大號碼
        this.minNum = lotteryNum.minNum || 0; //最小號碼
        this.n = lotteryNum.n || 0;  //產生多少個號碼
        this.type = lotteryType.type || 5; //彩種
        this.issuerule = lotteryType.issuerule || '001'; //編碼格式 '001'
        this.InspectionHour = lotterySchedule.InspectionHour || 48; //server斷線超過多少小時不回復
        this.startHour = lotterySchedule.startHour || 0; //每日幾點開始開獎
        this.startMinute = lotterySchedule.startMinute || 0; //每日幾分開始開獎
        this.endHour = lotterySchedule.endHour || 0; //每日幾點結束開獎
        this.endMinute = lotterySchedule.endMinute || 0; //每日幾分結束開獎
    }
    scheduleCronstyle() {  //定時任務
        let dbConnect = true; //偵測資料是否開始被存入資料庫
        let me = this;
        let job = schedule.scheduleJob('job', { second: [0, 30] }, () => {//定時任務
            if (dbConnect) {
                dbConnect = false; //關閉
                SetDB.getNewest(me).then(result => { //取得最新資料並產生下一筆需要產生sql的時間
                    return SetDB.getSql(me, result); //取得新增sql
                }).then(sql => {
                    return SetDB.saveSql(sql);  //存儲資料
                }).then(result1 => {
                    console.log(result1); //儲存成功 印出結果
                    dbConnect = true;  //打開
                    job.reschedule({ hour: 0, minute: 1 }); //更改定時器規則 為每天0:01分執行
                }).catch((err) => { //失敗
                    console.log(err); //印出失敗
                    dbConnect = true; //打開
                    job.reschedule({ second: [0, 30] }); //更改定時器規則 為每分鐘 0秒和30秒 執行
                })
            }
        });
    }
}
module.exports = lottrtyNumber;
