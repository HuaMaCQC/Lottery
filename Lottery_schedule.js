"use strict";
const SetDB = require('./set_db');
let schedule = require('node-schedule');
const moment = require('moment');

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
     * @param {String} lotteryType.issueinterval  樂透編碼設定 
     * - type 彩種 
     * - issueinterval 編碼格式 '001'
     * @param {Object} lotterySchedule
     * @param {Number} lotterySchedule.interval  
     * @param {Number} lotterySchedule.InspectionHour
     * @param {Number} lotterySchedule.startHour
     * @param {Number} lotterySchedule.startMinute
     * @param {Number} lotterySchedule.endHour
     * @param {Number} lotterySchedule.endMinute 開獎時間設定 
     * - interval 開獎時間規則(分鐘)
     * - InspectionHour  server斷線超過多少小時不回復
     * - startHour 每日幾點開始開獎
     * - startMinute 每日幾分開始開獎
     * - endHour 每日幾點結束開獎
     * - endMinute 每日幾分結束開獎
     */
    constructor(
        lotteryNum = { repeat: false, maxNum: 0, minNum: 0, n: 0 },
        lotteryType = { type: 0, issueinterval: '001' },
        lotterySchedule = { interval: 5, InspectionHour: 48, startHour: 0, startMinute: 0, endHour: 0, endMinute: 0 }
    ) {
        this.repeat = lotteryNum.repeat || false;
        this.interval = lotterySchedule.interval || 0; //觸發規則
        this.maxNum = lotteryNum.maxNum || 0; //最大號碼
        this.minNum = lotteryNum.minNum || 0; //最小號碼
        this.n = lotteryNum.n || 0;  //產生多少個號碼
        this.type = lotteryType.type || 5; //彩種
        this.issueinterval = lotteryType.issueinterval || '001'; //編碼格式 '001'
        this.InspectionHour = lotterySchedule.InspectionHour || 48; //server斷線超過多少小時不回復
        this.startHour = lotterySchedule.startHour || 0; //每日幾點開始開獎
        this.startMinute = lotterySchedule.startMinute || 0; //每日幾分開始開獎
        this.endHour = lotterySchedule.endHour || 0; //每日幾點結束開獎
        this.endMinute = lotterySchedule.endMinute || 0; //每日幾分結束開獎
    }
    scheduleCronstyle() {  //定時任務
        let dbConnect = true; //偵測資料是否開始被存入資料庫
        let dbConnect_1 = true; //偵測資料是否開始被存入資料庫
        let me = this;
        let time = moment().minute(Math.floor((moment().minute()) / me.interval) * me.interval).second(0).toDate();
        let setLottery = true;
        let job = schedule.scheduleJob({ second: [10, 40] }, () => {//定時任務
            if (dbConnect) {
                dbConnect = false; //關閉
                SetDB.getNewest(me).then(result => { //取得最新資料並產生下一筆需要產生sql的時間
                    return SetDB.getSql(me, result); //取得新增sql
                }).then(sql => {
                    return SetDB.saveSql(sql);  //存儲資料
                }).then(result1 => {
                    let endTime = moment().hour(me.endHour).minute(me.endMinute).second(0).toDate(); //今天的結束時間
                    return SetDB.checking(me, 'issue', endTime); //檢查有沒有生產今天最後一筆
                }).then(msg => {
                    console.log(msg); //儲存成功 印出結果
                    dbConnect = true;  //打開
                    job.reschedule({ hour: 0, minute: 10 }); //更改定時器規則 為每天0:10分執行
                }).catch((err) => { //失敗
                    console.log(err); //印出失敗
                    dbConnect = true; //打開
                    job.reschedule({ second: [10, 40] }); //更改定時器規則 為每分鐘 10秒和40秒 執行
                });
            }
        });
        schedule.scheduleJob({ second: 0 }, () => {//定時任務
            if (moment().isSame(time, 'second') || moment().isAfter(time, 'second')) {
                if (dbConnect_1) {
                    dbConnect_1 = false;
                    SetDB.getLotterySql(me, time).then(result => { //取得要開獎的sql
                        if (result.length > 0) { //如果有要開獎的資料
                            let prom = [];
                            for (let i = 0; i < result.length; i++) {  // 執行 sql
                                prom.push(SetDB.saveSql(result[i]));
                            }
                            return Promise.all(prom).then(() => "result"); //全部開獎成功
                        } else {
                            return "result";
                        }
                    }).then(check => {
                        return SetDB.checking(me, check, time); //檢查是否有開成功
                    }).then(msg => { //檢查成功
                        console.log(msg);
                        let endTime = moment().hour(me.endHour).minute(me.endMinute).second(0).toDate(); //今天的結束時間
                        if (moment().isAfter(endTime)) { //如果時間超過今天最後一筆
                            time = new moment(time).add(1, 'day').hour(me.startHour).minute(me.startMinute).second(0).toDate(); //換成明天的早上
                        } else {
                            time = new moment(time).add(me.interval, "minute").toDate(); //換時間
                        }
                        dbConnect_1 = true;
                    }).catch((err) => { //失敗
                        time = moment().minute(Math.floor((moment().minute()) / me.interval) * me.interval).second(0).toDate(); //獲取現在該開獎的時間
                        console.log(err); //印出失敗
                        dbConnect_1 = true;
                    });
                }
            }
        });
    }
}
module.exports = lottrtyNumber;

