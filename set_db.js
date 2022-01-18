"use strict";
/**
* 轉換date格式資料 return string
*/
Date.prototype.yyyymmdd = function () { //日期排序
    let mm = this.getMonth() + 1; // getMonth() is 重0開始
    let dd = this.getDate();
    let h = this.getHours();
    let m = this.getMinutes();
    let s = this.getSeconds();

    return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('-') + " " + [(h > 9 ? '' : '0') + h,
    (m > 9 ? '' : '0') + m,
    (s > 9 ? '' : '0') + s
    ].join(':');
}

//存取DB
const mysql = require('mysql');
const lottery_result = require('./lottery_result');
const moment = require('moment');
require('dotenv').config();

const con = mysql.createPool({  //資料庫連線
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

let con_query = (sql, callback) => {
    con.getConnection((err,connection) =>{
        if(err){
            callback(err);
        }else {
            connection.query(sql,(err,result)=>{
                connection.release();
                callback(err, result);
            }); 
        }
    });
}

module.exports = {
    /**
     * 取下一筆需要產生的時間
     * @param me class帶入參數
     */
    getNewest: (me) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM lottery_data 
                    WHERE
                       type = ${me.type} 
                    ORDER BY 
                    created_at 
                    DESC LIMIT 1`;
            con_query(sql, (err, result) => {
                let m_start = moment().hour(me.startHour).minute(me.startMinute).second(0); //開始產生的時間
                let m_end = moment().hour(me.endHour).minute(me.endMinute).second(0);  //結束產生的時間
                if (err) {
                    reject(new Error('error occur!')); //失敗
                } else { //查詢到最新日期
                    // 取得下一筆要產生亂數的時間           
                    let newDate = m_start.toDate(); //預設產生一整天
                    let issue = ''; //預設第一次產生
                    if (result.length != 0) {  //有查詢到最新資料
                        let res_time = result[0]['created_at'];
                        issue = result[0]['issue'];
                        if (moment(res_time).isSame(moment(), 'day')) { //如果最新的一筆資料是在今天的話
                            newDate = moment(result[0]['created_at']).add(me.rule, 'minute').toDate(); //取得下一筆執行的時間
                        } else {  //不是在今天                  
                            if (moment().diff(moment(res_time), 'h') < me.InspectionHour) { //如果server斷線沒有過長
                                m_start = new moment(res_time).hour(me.startHour).minute(me.startMinute); //設置開始日期
                                m_end = new moment(res_time).hour(me.endHour).minute(me.endMinute); //設置結束日期
                                if (moment(res_time).valueOf() == m_end.valueOf()) { //資料庫的最新資料=最後一筆的時間
                                    m_start.add(1, 'day'); //換天
                                    m_end.add(1, 'day'); //換天
                                    newDate = m_start.toDate();
                                } else { //如果最新資料不是最後一筆
                                    newDate = new moment(res_time).add(me.rule, 'minute').toDate(); //生產時間為下一個時間
                                }
                            }
                        }
                    }
                    resolve({ 'newDate': newDate, 'start': m_start, 'end': m_end, 'issue': issue }); //return
                }
            });
        });
    },
    /** 
     * 產生需要新增的sql字串 
     * @param me class帶入參數
     * @param newest  getNewest return得參數
    */
    getSql: (me, newest) => {
        return new Promise((resolve, reject) => {
            let regainSql = []; //要新增的sql
            let resultSQL = ''; //串接好的sql
            let newDate = newest.newDate; //下一筆要新增的時間
            let m_start = newest.start; //開始產生的時間
            let m_end = newest.end; //結束產生的時間
            let issue = newest.issue;  //期數
            for (let d = moment().diff(m_start, 'days'); d >= 0; d--) {//要產生幾天
                let Num = Math.floor((m_end.diff(moment(newDate), 'minute')) / me.rule) + 1; //計算要產生幾筆
                console.log('產生' + Num + '筆');
                for (let i = Num; i > 0; i--) { //要產生幾筆
                    issue = lottery_result.getissue(newDate, issue, me.issuerule); //產生 issue
                    regainSql.push(`('${newDate.yyyymmdd()}','${me.type}','${issue}')`); //將結果push進陣列
                    newDate = moment(newDate).add(me.rule, 'minute').toDate(); //產生下一筆的時間
                }
                m_start.add(1, 'day');//換天
                m_end.add(1, 'day');
                newDate = m_start.toDate(); //換天
            }
            if (regainSql.length > 0) {
                resultSQL = `INSERT INTO lottery_data ( created_at , type, issue) VALUES ` + regainSql.join(','); //串接
            }
            resolve(resultSQL);  //return
        });
    },
    /**
     * 執行sql
     * @param sql 要執行的sql
     */
    saveSql: (sql) => {
        return new Promise((resolve, reject) => {
            if (sql != '') { //偵測有沒有要儲存的資料
                con_query(sql, (err, result) => {
                    if (err) {
                        reject(new Error(err)); //失敗
                    } else {
                        resolve(sql); //return
                    }
                });
            } else {
                resolve(sql); //return
            }
        });
    },
    /** 
     * 檢查是否有資料
     * @param me class帶入的參數
     * @param check 要檢查的欄位
     * @param created_at 要檢查幾點幾分的資料
     */
    checking: (me,check,created_at) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM lottery_data 
                       WHERE ${check} != '' 
                       AND type = ${me.type} 
                       AND created_at =  '${created_at.yyyymmdd()}'`; //檢查那時間的資料是否有資料
            con_query(sql, (err, result) => { 
                if(err){
                    console.log('err   sql = ' + sql);
                    reject(new Error(err)); //失敗
                }else{
                    if(result.length > 0  ){
                        resolve(result);
                    }else{
                        reject('err : 資料庫缺少 :'+ created_at.yyyymmdd() + ' 的資料' );
                    }
                   
                }
            });
        });
     },
    /**
     * 取得開獎的樂透的sql
     * @param me class帶入的參數
     * @param time 本期的時間
    */
    getLotterySql: (me,time) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM lottery_data 
                       WHERE result = '' 
                       AND type = ${me.type} 
                       AND created_at <=  '${time.yyyymmdd()}'`;
            let regainSql = []; //要新增的sql
            con_query(sql, (err, result) => {
                if(err){
                    reject(new Error(err)); //失敗
                }else{
                    for(let i = 0  ; i < result.length ; i ++ ){ //串sql
                        let lotteryNum = lottery_result.getRandomArray(me.repeat,me.minNum, me.maxNum, me.n).join(','); //產生樂透號碼
                        regainSql.push(`UPDATE lottery_data SET result = "${lotteryNum}" WHERE id = ${result[i]['id']}`);
                    }
                    resolve(regainSql);
                }
            });
        });
    },
    /**
     * 查詢最新資料
     * @param type 要查詢的財種
     * @param row 要查詢前幾個
     * @param now 要查詢的時間
     */
    selectDB: (type, row, now) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT lottery_type.type,
                               lottery_data.issue,
                               lottery_data.result,
                               lottery_data.created_at 
                        FROM   lottery_data
                        JOIN        lottery_type ON lottery_data.type =
                                    lottery_type.id
                        WHERE       lottery_data.created_at < '${new Date(now).yyyymmdd()}'
                                    AND lottery_type.type = '${type}'
                        ORDER BY    lottery_data.created_at DESC
                        LIMIT       ${row}`;
            let date = '';
            console.log(sql);
            con_query(sql, (err, result) => {
                if (err) {
                    resolve('404');
                } else {
                    if (Object.keys(result).length > 0) {
                        let m_data = [];
                        for (let i = 0, long = Object.keys(result).length; i < long; i++) {
                            m_data.push({
                                "issue": result[i]['issue'],
                                "result": result[i]['result'].split(','),
                                "time": result[i]['created_at'].yyyymmdd()
                            });
                        }
                        resolve({ 'type': type, 'data': m_data });
                    } else {
                        resolve('');
                    }
                }
            });
        });
    },
    /**
     * 查詢是否有這個key
     * @param key 廠商的key
     */
    getkey: key => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM firm 
                        WHERE \`key\` = '${key}'`;
            con_query(sql, (err, result) => {
                if (err) {
                    resolve(false);
                } else {
                    if (Object.keys(result).length > 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            });
        });
    }
}