//產生樂透中獎號碼
module.exports = {
    /**產生隨機不重複的數字  return Array
    * @param minNum 含隨機產生最小數字
    * @param maxNum 含隨機產生最大數字
    * @param n 產生n個隨機數字
    */
    getRandomString: (minNum, maxNum, n) => {
        let rdmArray = [];
        for (let i = minNum; i <= maxNum; i++) { //產生所有號碼
            rdmArray.push(i)
        }
        for (let i =  rdmArray.length -1 ; i > 0  ; i--) { //交換陣列
            const j = Math.floor(Math.random() * (i + 1));
            [rdmArray[i], rdmArray[j]] = [rdmArray[j], rdmArray[i]];
        }
        return rdmArray.join(',');
    },
    /**
     * 產生期號 ymd+000
     * @param date 產生時間
     * @param issue 最後一筆編號
     * @param issueFirst 第一筆編碼方式 '001'
     */
    getissue: (date, issue, issueFirst) => {
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let ymd = date.getFullYear() + (mm > 9 ? '' : '0') + mm + (dd > 9 ? '' : '0') + dd;
        let num = issueFirst;
        if (ymd == String(issue).slice(0, 8)) { //如果是當天
            return Number(issue) + 1;
        } else {
            return "" + ymd + num;
        }
    }
};
