//#region function
/**開獎號碼與時間存入資料庫
 * @param string 開獎號碼
 * @param date 開獎時間 'YYYY-MM-DD 23:59:59';
 */
function setDB (string,date)
{
    const mysql = require('mysql');
    const con = mysql.createConnection({  //資料庫連線
        host:"localhost",
        user:"root",
        password:"",
        database:"lottery"
    })
    let sql ="INSERT INTO `datadb`( `DATE`, `NUMBER`) VALUES ('"+date+"','"+string+"')";
        con.query(sql, function (err, result) {
              if(err) throw  false
                //儲存結束後...
        });
    con.end();  
}
/**產生隨機不重複的數字  return string
 * @param minNum 含隨機產生最小數字
 * @param maxNum 含隨機產生最大數字
 * @param n 產生n個隨機數字
 */
function getRandomString(minNum, maxNum, n) {	//隨機產生不重覆的n個數字
	let rdmArray = [n];		//儲存產生的陣列
    let rdmString =""; //字串
	for(let i = 0 ; i < n ;i++ ) {
		let rdm = 0;		//暫存的亂數
        let exist = false
		do {
			exist = false;			//此亂數是否已存在
			rdm = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;	//取得亂數
			//檢查亂數是否存在於陣列中，若存在則繼續回圈
			if(rdmArray.indexOf(rdm) != -1) exist = true;
 
		} while (exist);	//產生沒出現過的亂數時離開迴圈
        i == 0 ? rdmString = "" +  rdm : rdmString += "," +  rdm; 
		rdmArray[i] = rdm;
	}
	return rdmString;
}
/**
 * var rule = new schedule.RecurrenceRule();
 * rule.second  = 0; 
 * scheduleCronstyle(rule,msg => { //code....});
 * @param rule   觸發時間 new schedule.RecurrenceRule()
 */
let schedule = require('node-schedule');
function scheduleCronstyle(rule,callback)
{
    schedule.scheduleJob(rule, function(){
                let lotteryNumber =getRandomString(1, 10, 10);
                let date = new Date();
                date = date.yyyymmdd();
                setDB(lotteryNumber,date);
                if(typeof callback == Function ) callback(lotteryNumber);
                console.log('時間:'+date +'      亂數:'+ lotteryNumber);
            });
}
/**
 * 轉換date格式資料 return string
 * Date.yyyymmdd
 */
Date.prototype.yyyymmdd = function() { //日期排序
    let mm = this.getMonth() + 1; // getMonth() is zero-based
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
//#endregion

//let schedule = require('node-schedule');

let rule = new schedule.RecurrenceRule(); //觸發規則

rule.second  = '0'; //每分鐘觸發
scheduleCronstyle(rule);