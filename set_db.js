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
let config = require('./config.json');
const mysql = require('mysql');
const lottery_result = require('./lottery_result');
const moment = require('moment');
module.exports = {
    /**
     * 產生一整天sql
     * @param me class帶入參數
     * @param startTime 樂透於每日幾分點開始開獎
     * @param endTime 樂透於每日幾分結束開獎
     * @param today 開獎時間
     * @param callback 成功(sql)
     * @param errcallback 失敗(err)
     */
    getRegainDbSql: (me, startTime, endTime, today, callback, errcallback) => {
        let m_start = startTime; //開始產生的時間
        let m_end = endTime; //結束產生的時間
        let sql = `SELECT * FROM \`${config.DB.table}\` 
                    WHERE
                        \`${config.DB.type}\` = ${me.type} 
                    ORDER BY 
                        \`${config.DB.date}\` 
                    DESC LIMIT ${1}`;
        let regainSql = "";
        const con = mysql.createConnection({  //資料庫連線
            host: config.DB.host,
            user: config.DB.user,
            password: config.DB.password,
            database: config.DB.database
        });
        con.query(sql, function (err, result) {
            if (err) {
                errcallback(err);
            } else { //查詢到最新日期
                let newDate = m_start.toDate();
                let issue = '';
                if (Object.keys(result).length != 0) {  //有查詢到最新資料
                    newDate = result[0][config.DB.date];  //設定生產資料由資料庫最新資料開始
                    issue = result[0][config.DB.issue]; //取得最後的期數
                    if (moment().diff(moment(newDate), 'h') > me.InspectionHour && moment(newDate).isBefore()) { //如果server斷線時間過長
                        newDate = m_start.toDate(); //設定產生資料由server開啟當天開始
                    }
                    m_start = moment(newDate).hour(me.startHour).minute(me.startMinute).second(0).subtract(1, 's');
                    m_end = moment(newDate).hour(me.endHour).minute(me.endMinute).second(0).add(1, 's');
                }
                do {
                    newDate = me.rule.nextInvocationDate(newDate);//獲取下次產生亂數時間
                    if (moment(newDate).isAfter(m_end)) { //如果要產生的時間在最後一筆之後
                        m_start.add(1, 'day'); //偵測時間改到明天
                        m_end.add(1, 'day');
                    }
                } while (!moment(newDate).isBetween(m_start, m_end))
                while (moment(newDate).isBetween(m_start, m_end) && m_end.isBefore(moment().add(1, 'day'), 'day')) { //要新增的時間有沒有在範圍內 而且是在今天
                    issue = lottery_result.getissue(newDate, issue, me.issueFirst); //產生 issue
                    if (regainSql == "") { //起始sql
                        regainSql = `INSERT INTO \`${config.DB.table}\` 
                                        ( \`${config.DB.date}\`, \`${config.DB.result}\`
                                        , \`${config.DB.type}\`, \`${config.DB.issue}\`)
                                     VALUES 
                                        ('${newDate.yyyymmdd()}','${lottery_result.getRandomString(me.minNum, me.maxNum, me.n)}'
                                        ,'${me.type}','${issue}')`;
                    } else { //串接sql
                        regainSql += `,('${newDate.yyyymmdd()}','${lottery_result.getRandomString(me.minNum, me.maxNum, me.n)}'
                                     ,'${me.type}','${issue}')`;
                    }
                    newDate = me.rule.nextInvocationDate(newDate);//獲取下次產生亂數時間 
                    if (moment(newDate).isAfter(m_end)) { //如果要產生的時間在最後一筆之後
                        m_start.add(1, 'day'); //偵測時間改到明天
                        m_end.add(1, 'day');
                    }
                }
                today.add(1, 'day');
                callback(regainSql, m_start, m_end);
            }
        })
        con.end();
    },
    /**
     * 儲存sql
     * @param sql 要儲存執行的sql
     * @param callback 成功();
     * @param errcallback 失敗(err);
     */
    saveSql: (sql, callback, errcallback) => {
        const con = mysql.createConnection({  //資料庫連線
            host: config.DB.host,
            user: config.DB.user,
            password: config.DB.password,
            database: config.DB.database
        });
        con.query(sql, function (err, result) {
            if (err) {
                con.end();
                errcallback(err);
            } else {
                con.end();
                callback();
            }
        })
    },
    /**
     * 查詢最新資料
     * @param type 要查詢的財種
     * @param row 要查詢前幾個
     */
    selectDB: (type, row, now) => {
        return new Promise((resolve, reject) => {
            let sql = `SELECT \`${config.typeDB.table}\`.\`${config.typeDB.type}\`,
                               \`${config.DB.table}\`.\`${config.DB.issue}\`,
                               \`${config.DB.table}\`.\`${config.DB.result}\`,
                               \`${config.DB.table}\`.\`${config.DB.date}\` 
                        FROM   \`${config.DB.table}\`
                        JOIN        \`${config.typeDB.table}\` ON \`${config.DB.table}\`.\`${config.DB.type}\` =
                                    \`${config.typeDB.table}\`.\`${config.typeDB.id}\`
                        WHERE       \`${config.DB.table}\`.\`${config.DB.date}\` < '${new Date(now).yyyymmdd()}'
                                    AND \`${config.typeDB.table}\`.\`${config.DB.type}\` = '${type}'
                        ORDER BY    \`${config.DB.table}\`.\`${config.DB.date}\` DESC
                        LIMIT       ${row}`;
            let date = '';
            const con = mysql.createConnection({  //資料庫連線
                host: config.DB.host,
                user: config.DB.user,
                password: config.DB.password,
                database: config.DB.database
            });
            con.query(sql, (err, result) => {
                if (err) {
                    resolve('404');
                } else {
                    if (Object.keys(result).length > 0) {
                        let m_data = [];
                        for (let i = 0, long = Object.keys(result).length; i < long; i++) {
                            m_data.push({
                                "issue": result[i][config.DB.issue],
                                "result": result[i][config.DB.result].split(','),
                                "time": result[i][config.DB.date].yyyymmdd()
                            })
                        }
                        resolve({ 'type': type, 'data': m_data });
                    } else {
                        resolve('');
                    }
                    con.end();
                }
            })
        })
    },
    /**
     * 查詢是否有這個key
     * @param key 廠商的key
     */
    getket: key => {
        const con = mysql.createConnection({  //資料庫連線
            host: config.DB.host,
            user: config.DB.user,
            password: config.DB.password,
            database: config.DB.database
        });
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM \`${config.firm.table}\` 
                        WHERE \`${config.firm.key}\` = '${key}'`;
            con.query(sql, (err, result) => {
                if (Object.keys(result).length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
                con.end();
            })
        })
    }
}