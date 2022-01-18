"use strict";
const Lottery = require('./lottery_schedule');
module.exports = {
    lottert_service: () => {
        const pypk10 = new Lottery({
            repeat: false, //不可重複
            maxNum: 10, //1~10號
            minNum: 1,
            n: 10 //選10個
        }, {
            type: 1
        }, {
            rule: 5, //每5分鐘
            InspectionHour: 48, //超過48小時不回復
            startHour: 9, //9:05~23:55 
            startMinute: 5,
            endHour: 23,
            endMinute: 55
        }); //建立
        pypk10.scheduleCronstyle();

        const pyssc = new Lottery({
            repeat: true, //可重複
            maxNum: 9, //0~9 號
            minNum: 0,
            n: 5 //選5個
        }, {
            type: 2
        }, {
            rule: 10, //每10分鐘
            InspectionHour: 48, //超過48小時不回復
            startHour: 9, //9:10~23:00
            startMinute: 10,
            endHour: 23,
            endMinute: 0
        });
        pyssc.scheduleCronstyle();

        const py11x5 = new Lottery({
            repeat: false, //不可重複
            maxNum: 11, //1~11號
            minNum: 1,
            n: 5 //選5個
        }, {
            type: 3
        }, {
            rule: 10, //每10分鐘
            InspectionHour: 48, //超過48小時不回復
            startHour: 9, //9:10~23:00
            startMinute: 10,
            endHour: 23,
            endMinute: 0
        }); //建立
        py11x5.scheduleCronstyle();
    }
}
