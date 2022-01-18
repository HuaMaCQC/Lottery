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
let jsonfile = require('jsonfile');
let jsonDate = jsonfile.readFileSync('setting.json');
const mysql = require('mysql'); 
const winning_numbers = require('./winning_numbers.js');

module.exports = {
    /**
     * 生產樂透並存入資料庫
     * @param type 財種
     * @param max 產生最大亂數值
     * @param min 產生最小亂數值
     * @param n 產生多少個亂數
     * @param issues 目前期號
     * @param callback 成功(SQL)
     * @param errcallback 失敗(SQL,串接的SQL,ERR)
     */
    saveLottery:(type,max,min,n,issues,callback,errcallback)=>{
        
        const con = mysql.createConnection({  //資料庫連線
            host:jsonDate.DB.host,
            user:jsonDate.DB.user,
            password:jsonDate.DB.password,
            database:jsonDate.DB.database
        });
        let date = new Date();
        let m_issues = winning_numbers.getissues(date,issues);
        let sql ="INSERT INTO `"+jsonDate.DB.table+"`( `"+jsonDate.DB.date+"`, `"+jsonDate.DB.winning_numbers+"`, `"+jsonDate.DB.type+"`, `"+jsonDate.DB.issues+"`) VALUES ('"
                +date.yyyymmdd()+"','"+winning_numbers.getRandomString(min,max,n)+"','"+type+"','"+m_issues+"')";
        con.query(sql, function (err, result) {
            if(err){
                errcallback(err);
                con.end();
            }
            else{
                callback(sql,m_issues);
                con.end();
            }
        })
    },
    /**
     * 獲取回復的sql
     * @param rule 生產的規則
     * @param Second 斷線時間不超過多少秒數才回復
     * @param type 選擇的財種
     * @param min 最小的亂數值
     * @param max 最大的亂數值
     * @param n 產生多少亂數
     * @param callback 成功(sql)
     * @param errcallback 失敗(err)
     */
    getRegainDbSql:(rule,Second,type,min,max,n,callback,errcallback)=>{
        let sql = "SELECT * FROM `"+jsonDate.DB.table+"` WHERE `"+jsonDate.DB.type+"` = "+type+" ORDER BY `"+jsonDate.DB.date+"` DESC LIMIT 1";
        let regainSql = "";
        const con = mysql.createConnection({  //資料庫連線
            host:jsonDate.DB.host,
            user:jsonDate.DB.user,
            password:jsonDate.DB.password,
            database:jsonDate.DB.database
        }); 
        con.query(sql,function (err, result) {
            if(err){//
                errcallback(err);
            }else{ //查詢到最新日期
                if(Object.keys(result).length != 0){
                    let newDate = rule.nextInvocationDate(result[0][jsonDate.DB.date]);
                    let issues =  result[0][jsonDate.DB.issues]; //取得最後的期數
                    let serverOpenTime = new Date(); //抓取server正常讀取到資料的時間  
                    if(Math.abs(parseInt( (serverOpenTime.getTime() - newDate.getTime() ) / 1000)) < Second){ //如果斷線時間過短於Second
                     //產生sql與issues
                        while(serverOpenTime.getTime()>newDate.getTime()){
                            serverOpenTime = new Date();
                            issues = winning_numbers.getissues(newDate,issues); //產生 issues
                            if(regainSql==""){ //起始sql
                                regainSql="INSERT INTO `"+jsonDate.DB.table+"`( `"+jsonDate.DB.date+"`, `"+jsonDate.DB.winning_numbers+"`, `"+jsonDate.DB.type+"`, `"+jsonDate.DB.issues+"`) VALUES ('"
                                            +newDate.yyyymmdd()+"','"+winning_numbers.getRandomString(min,max,n)+"','"+type+"','"+issues+"')";
                            }else{ //串接sql
                                regainSql +=",('"+newDate.yyyymmdd()+"','"+winning_numbers.getRandomString(min,max,n)+"','"+type+"','"+issues+"')";
                            }
                            newDate = rule.nextInvocationDate(newDate); //獲取下一筆要產生亂數的時間
                        }
                        callback(regainSql,issues,newDate);
                    }else{
                        callback(regainSql,issues,newDate);
                    }
                }else{
                    callback('','',rule.nextInvocationDate(new Date()));
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
            
            //let sql = "SELECT * FROM `"+jsonDate.DB.table+"` WHERE `"+jsonDate.DB.type+"` IN (SELECT `"+jsonDate.typeDB.id+"` FROM `"+jsonDate.typeDB.table+
                   // "` WHERE `"+jsonDate.typeDB.type+"` ='"+type+"') ORDER BY `"+jsonDate.DB.date+"` DESC LIMIT "+row;
             let sql = "SELECT * FROM `"+jsonDate.DB.table+"` "+
                        "JOIN `"+jsonDate.typeDB.table+"` ON `"+jsonDate.DB.table+"`.`"+jsonDate.DB.type+"` = `"+jsonDate.typeDB.table+"`.`"+jsonDate.typeDB.id+"` "+
                        "WHERE `"+jsonDate.typeDB.table+"`.`"+jsonDate.DB.type+"` = '"+type+"' "+
                        "ORDER BY `"+jsonDate.DB.date+"` DESC "+
                        "LIMIT "+row;
            let date = '';
            const con = mysql.createConnection({  //資料庫連線
                host:jsonDate.DB.host,
                user:jsonDate.DB.user,
                password:jsonDate.DB.password,
                database:jsonDate.DB.database
            });
            con.query(sql,(err, result)=>{
                if (err){
                    resolve ('404');
                }else{
                    if(Object.keys(result).length > 0){
                        
                        let m_data = []
                        for (let i = 0 ,long =  Object.keys(result).length ; i < long ; i ++){
                            m_data.push({"issues":result[i][jsonDate.DB.issues],
                                         "result":result[i][jsonDate.DB.winning_numbers],
                                         "time":result[i][jsonDate.DB.date].yyyymmdd()})
                        }
                        resolve({'type':type,'data':m_data});
                    }else
                    {
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
            let sql = "SELECT * FROM `"+jsonDate.firm.table+"` WHERE `key` = '"+ key +"'";
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