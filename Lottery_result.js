"use strict";
//產生樂透中獎號碼
module.exports = {
    /**產生隨機的數字  return Array
    * @param repeat 是否重複
    * @param minNum 含隨機產生最小數字
    * @param maxNum 含隨機產生最大數字
    * @param n 產生n個隨機數字
    */
    getRandomArray: (repeat, minNum, maxNum, n) => {
        let rdmArray = [];
        if (repeat) { //可重複 
            for (let i = n; i > 0; i--) {
                rdmArray.push(Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);     //取得亂數 
            }
        } else { //不可重複
            for (let i = minNum; i <= maxNum; i++) { //產生所有號碼
                rdmArray.push(i)
            }
            for (let i = rdmArray.length - 1; i > 0; i--) { //交換陣列
                const j = Math.floor(Math.random() * (i + 1));
                [rdmArray[i], rdmArray[j]] = [rdmArray[j], rdmArray[i]];
            }
            rdmArray.splice(n, rdmArray.length);
        }
        return rdmArray;
    },
    /** 改成從 issuerule 開始+
     * 產生期號 ymd+issuerule
     * @param date 產生時間
     * @param issue 最後一筆編號
     * @param issuerule 第一筆編碼方式 '001'
     */
    getissue: (date, issue, issuerule) => {
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let ymd = date.getFullYear() + (mm > 9 ? '' : '0') + mm + (dd > 9 ? '' : '0') + dd;
        let num = issuerule;
        if (ymd == String(issue).slice(0, 8)) { //如果是當天
            return Number(issue) + 1;
        } else {
            return "" + ymd + num;
        }
    }
};
