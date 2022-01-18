//產生樂透中獎號碼
module.exports ={
    /**產生隨機不重複的數字  return Array
    * @param minNum 含隨機產生最小數字
    * @param maxNum 含隨機產生最大數字
    * @param n 產生n個隨機數字
    */
    getRandomString:(minNum,maxNum,n)=>{
        let rdmArray = [n];		//儲存產生的陣列
        let rdmString ='';
        for(let i = 0 ; i < n ;i++ ) {
            let rdm = 0;		//暫存的亂數
            let exist = false
            do {
                exist = false;			//此亂數是否已存在
                rdm = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;	//取得亂數
                //檢查亂數是否存在於陣列中，若存在則繼續回圈
                if(rdmArray.indexOf(rdm) != -1) exist = true;
            } while (exist);	//產生沒出現過的亂數時離開迴圈
            rdmArray[i] = rdm;
            i == 0 ? rdmString = rdmArray[i] : rdmString += ","+rdmArray[i];
        }
        return rdmString;
    },
    /**
     * 產生期號 ymd+000
     * @param date 產生時間
     * @param issues 最後一筆編號
     */
    getissues:(date,issues)=>{
        let mm = date.getMonth() + 1;
        let dd = date.getDate()
        let ymd = date.getFullYear() + (mm>9 ? '' : '0') + mm+(dd>9 ? '' : '0') + dd;
        let num = '001';
        if(ymd ==String(issues).slice(0,8)){ //如果是當天
            return Number(issues) +1
        }else{
            return ""+ymd+num;
        }
    }
};
