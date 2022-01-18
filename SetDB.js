/**
* 轉換date格式資料 return string
*/
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
//存取DB
let jsonDate = require('./setting.json');
const mysql = require('mysql'); 
const lottery_result = require('./Lottery_result');
module.exports = {
    /**
     * 生產樂透並存入資料庫
     * @param me class帶入參數
     * @param issue 目前期號
     * @param time 產生的時間
     * @param callback 成功(SQL)
     * @param errcallback 失敗(SQL,串接的SQL,ERR)
     */
    saveLottery:(me,issue,time,callback,errcallback)=>{
        const con = mysql.createConnection({  //資料庫連線
            host:jsonDate.DB.host,
            user:jsonDate.DB.user,
            password:jsonDate.DB.password,
            database:jsonDate.DB.database
        });
        let m_issue = lottery_result.getissue(time,issue,me.issueFirst); //取得期數
        let sql =`INSERT INTO \`${jsonDate.DB.table}\`  
                    ( \`${jsonDate.DB.type}\`, \`${jsonDate.DB.issue}\`, 
                      \`${jsonDate.DB.result}\`, \`${jsonDate.DB.date}\` )
                  VALUES 
                    ( '${me.type}','${m_issue}','${lottery_result.getRandomString(me.minNum,me.maxNum,me.n)}'
                        ,'${time.yyyymmdd()}')`; //產生亂數並存入sql裡
        con.query(sql, function (err, result) { //執行sql
            if(err){ //儲存失敗
                errcallback(err);
                con.end();
            }
            else{ //儲存成功
                callback(sql,m_issue);
                con.end();
            }
        })
    },
    /**
     * 獲取回復的sql
     * @param me class帶入參數
     * @param startTime 樂透於每日幾分點開始開獎
     * @param endTime 樂透於每日幾分結束開獎
     * @param callback 成功(sql)
     * @param errcallback 失敗(err)
     */
    getRegainDbSql:(me,startTime,endTime,callback,errcallback)=>{
        let sql =   `SELECT * FROM \`${jsonDate.DB.table}\` 
                    WHERE
                        \`${jsonDate.DB.type}\` = ${me.type} 
                    ORDER BY 
                        \`${jsonDate.DB.date}\` 
                    DESC LIMIT ${1}`;
        let regainSql = "";
        const con = mysql.createConnection({  //資料庫連線
            host:jsonDate.DB.host,
            user:jsonDate.DB.user,
            password:jsonDate.DB.password,
            database:jsonDate.DB.database
        }); 
        con.query(sql,function (err, result) {
            if(err){
                errcallback(err);
            }else{ //查詢到最新日期
                if(Object.keys(result).length != 0){ //有查詢到最新資料
                    let newDate =result[0][jsonDate.DB.date];
                    do{
                        newDate = me.rule.nextInvocationDate(newDate);//獲取下次產生亂數時間 
                    }while( ((newDate.getHours()*60)+ newDate.getMinutes()) < startTime ||
                            ((newDate.getHours()*60)+ newDate.getMinutes()) >endTime);
                    let issue =  result[0][jsonDate.DB.issue]; //取得最後的期數
                    let serverOpenTime = new Date(); //抓取server正常讀取到資料的時間  
                    if(Math.abs(parseInt( (serverOpenTime.getTime() - newDate.getTime() ) / 1000)) < (me.InspectionHour*3600)){ //如果斷線時間過短於Second
                     //產生sql與issue
                        while(serverOpenTime.getTime()>newDate.getTime()){ 
                            serverOpenTime = new Date();
                            issue = lottery_result.getissue(newDate,issue,me.issueFirst); //產生 issue
                            if(regainSql==""){ //起始sql
                                regainSql=  `INSERT INTO \`${jsonDate.DB.table}\` 
                                                ( \`${jsonDate.DB.date}\`, \`${jsonDate.DB.result}\`
                                                , \`${jsonDate.DB.type}\`, \`${jsonDate.DB.issue}\`)
                                             VALUES 
                                                ('${newDate.yyyymmdd()}','${lottery_result.getRandomString(me.minNum,me.maxNum,me.n)}'
                                                ,'${me.type}','${issue}')`;
                            }else{ //串接sql
                                regainSql +=`,('${newDate.yyyymmdd()}','${lottery_result.getRandomString(me.minNum,me.maxNum,me.n)}'
                                             ,'${me.type}','${issue}')`;
                            }
                            do{
                                newDate = me.rule.nextInvocationDate(newDate);//獲取下次產生亂數時間 
                            }while(((newDate.getHours()*60)+ newDate.getMinutes()) < startTime ||
                                     ((newDate.getHours()*60)+ newDate.getMinutes()) > endTime);
                        }
                        callback(regainSql,issue,newDate);
                    }else{
                        //斷線時間過長 不回復資料
                        newDate = new Date();
                        do{
                            newDate = me.rule.nextInvocationDate(newDate);//獲取下次產生亂數時間 
                        }while( ((newDate.getHours()*60)+ newDate.getMinutes()) < startTime || 
                                ((newDate.getHours()*60)+ newDate.getMinutes()) > endTime);

                        callback('','',newDate);
                    }
                }else{ //沒有查詢到最新資料
                    let newDate = new Date();
                    do{
                        newDate = me.rule.nextInvocationDate(newDate);//獲取下次產生亂數時間 
                    }while( ((newDate.getHours()*60)+ newDate.getMinutes()) < startTime || 
                            ((newDate.getHours()*60)+ newDate.getMinutes()) > endTime);
                    callback('','',newDate);
                }
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
    saveSql:(sql,callback,errcallback)=>{
        const con = mysql.createConnection({  //資料庫連線
            host:jsonDate.DB.host,
            user:jsonDate.DB.user,
            password:jsonDate.DB.password,
            database:jsonDate.DB.database
        }); 
        con.query(sql,function (err, result) {
            if(err){
                con.end();
                errcallback(err);
            }else{
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
    selectDB:(type,row)=>{
        return new Promise ((resolve, reject) =>{
             let sql = `SELECT \`${jsonDate.typeDB.table}\`.\`${jsonDate.typeDB.type}\`,
                               \`${jsonDate.DB.table}\`.\`${jsonDate.DB.issue}\`,
                               \`${jsonDate.DB.table}\`.\`${jsonDate.DB.result}\`,
                               \`${jsonDate.DB.table}\`.\`${jsonDate.DB.date}\` 
                        FROM   \`${jsonDate.DB.table}\`
                        JOIN        \`${jsonDate.typeDB.table}\` ON \`${jsonDate.DB.table}\`.\`${jsonDate.DB.type}\` =
                                    \`${jsonDate.typeDB.table}\`.\`${jsonDate.typeDB.id}\`
                        WHERE       \`${jsonDate.typeDB.table}\`.\`${jsonDate.DB.type}\` = '${type}'
                        ORDER BY    \`${jsonDate.DB.table}\`.\`${jsonDate.DB.date}\` DESC
                        LIMIT       ${row}`;
            let date = '';
            const con = mysql.createConnection({  //資料庫連線
                host:jsonDate.DB.host,
                user:jsonDate.DB.user,
                password:jsonDate.DB.password,
                database:jsonDate.DB.database
            });
            console.log(sql);
            con.query(sql,(err, result)=>{
                console.log(result);
                if (err){
                    resolve ('404');
                }else{
                    if(Object.keys(result).length > 0){
                        let m_data = [];
                        for (let i = 0 ,long =  Object.keys(result).length ; i < long ; i ++){
                            m_data.push({"issue":result[i][jsonDate.DB.issue],
                                         "result":result[i][jsonDate.DB.result].split(','),
                                         "time":result[i][jsonDate.DB.date].yyyymmdd()})
                        }
                        resolve({'type':type,'data':m_data});
                    }else{
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
    getket :key=>{
        const con = mysql.createConnection({  //資料庫連線
            host:jsonDate.DB.host,
            user:jsonDate.DB.user,
            password:jsonDate.DB.password,
            database:jsonDate.DB.database
        });
        return new Promise ((resolve, reject) =>{
            let sql =  `SELECT * FROM \`${jsonDate.firm.table}\` 
                        WHERE \`${jsonDate.firm.key}\` = '${key}'`;
            con.query(sql,(err, result)=>{
                if(Object.keys(result).length > 0){
                    resolve(true);
                }else{
                    resolve(false);
                }
                con.end();
            })
        })
    }
}