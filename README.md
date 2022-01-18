# 自開彩服務

**功能**:定時產生樂透號碼存入資料料庫，並且提供web api服務。

----
## 目錄
- [自開彩服務](#自開彩服務)
  - [目錄](#目錄)
  - [安裝套件](#安裝套件)
    - [NODE.JS](#nodejs)
    - [mysql](#mysql)
    - [moment](#moment)
    - [node-schedule](#node-schedule)
    - [koa](#koa)
    - [dotenv](#dotenv)
  - [資料庫](#資料庫)
    - [建立資料庫](#建立資料庫)
    - [資料表設定](#資料表設定)
    - [資料表說明](#資料表說明)
  - [|update_at|datetime|修改時間](#update_atdatetime修改時間)
    - [設定環境變數](#設定環境變數)
  - [啟動](#啟動)
    - [彩種新增](#彩種新增)
    - [彩種設定說明](#彩種設定說明)
    - [設定資料庫連線](#設定資料庫連線)
    - [啟動服務](#啟動服務)
  - [WEB API服務](#web-api服務)
    - [URL](#url)
    - [RESULT](#result)
  - [程式碼](#程式碼)
    - [py-lottery.js](#py-lotteryjs)
    - [custom_lottery.js](#custom_lotteryjs)
    - [lottery_schedule.js](#lottery_schedulejs)
    - [set_db.js](#set_dbjs)
    - [lottery_result.js](#lottery_resultjs)
    - [lottery_api](#lottery_api)
    - [controller.js](#controllerjs)
<p id = "install"></p>

## 安裝套件 
<p id = "node"></p>

### NODE.JS 

下載[node.js][src] 並且安裝 。

[src]:
https://nodejs.org/en/

### mysql 
打開命令提示字元，並且指定至此文件資料夾:
       
    $ npm install mysql

### moment 

打開命令提示字元，並且指定至此文件資料夾:
       
    $ npm install moment

<p id = "schedule"></p>

### node-schedule 

打開命令提示字元，並且指定至此文件資料夾:

    $ npm install node-schedule
### koa 

打開命令提示字元，並且指定至此文件資料夾:

    $ npm install koa
    $ npm install koa-router

### dotenv

    $ npm install dotenv
---
<p id ="DB"></P>

## 資料庫 

<p id ="AddDB"></p>

### 建立資料庫

1. 下載並且安裝[mysql][scr]。

[scr]: https://www.mysql.com/

2. 將資料夾 **db_schema**內的[**lottery_db.sql**](./db_schema/lottery_db.sql)匯入資料庫內

<p id ="DBconfing"></p>

### 資料表設定

1. 打開lottery_type並且手動新增一筆資料:
    
        id: 彩票編號
        type:彩票代碼
        name:彩票名稱
1. 打開firm 並且手動新增一筆資料:
    
        name:廠商名稱
        key:API KEY
<p id = "explain"></p>

### 資料表說明

* firm

|名稱|型態|說明
|----|----|----
|id|int|AUTO_INCREMENT
|name|varchar(24)|廠商名稱
|key|varchar(20)|API的金鑰
|created_at|datetime|創建時間
|updated_at|datetime|修改時間

* lottery_data

|名稱|型態|說明
|----|----|----
|id|int|AUTO_INCREMENT
|type|int|彩票編號
|issue|varchar(16)|彩票期數
|result|varchar(128)|彩票號碼
|created_at|datetime|開獎時間

* firm

|名稱|型態|說明
|----|----|----
|id|int|彩票編號
|type|varchar(15)|彩票代碼
|name|varchar(20)|彩票名稱
|created_at|datetime|創建時間
|update_at|datetime|修改時間
 ---

<p id = "env"></p>

### 設定環境變數

1. 打開命令提示字元，並且指定至此文件資料夾:
2. 新增.env
    ```
    $ CP .env-example .env
    ```
3. 資料夾會多出.env檔。打開並且設定HOST、使用者、密碼、資料庫名稱


<p id = "start"></p>

## 啟動

<p id = "lotteryADD"></P>

### 彩種新增
1. 打開資料夾內的[custom_lottery.js](./custom_lottery.js)
2. 在 **lottert_service()** 裡新增任務

    ```javascript
    lottert_service: () => {
        const pypk10 = new Lottery({
            repeat: false, //不可重複
            maxNum: 10, //1~10號
            minNum: 1,
            n: 10 //選10個
        }, {
            type: 1,
            issuerule: '001'
        }, {
            rule: 5, //每5分鐘
            InspectionHour: 48, //超過48小時不回復
            startHour: 9, //9:00~23:55 
            startMinute: 0,
            endHour: 23,
            endMinute: 55
        }); //建立
        pypk10.scheduleCronstyle();
    }
    ```

<p id ="lotteryConfig" ></p>

### 彩種設定說明

1.參數 lotteryNum

|名稱|型態|說明
|----|----|----
|repeat|Boolean|**true**:樂透號碼可以重複。<br>**false**:樂透號 碼不可以重複
|maxNum|Number|樂透的最大號碼 **(包含)**
|minNum|Number|樂透的最小號碼 **(包含)**
|n|Number|號碼數量|

2.參數 lotteryType

|名稱|型態|說明
|----|----|----
|type|Number|彩票編號
|issuerule|String|編碼規則<br>_預設:"001"_|

3.參數 lotterySchedule

|名稱|型態|說明
|----|----|----
|rule|Number|每多少分鐘開一次獎<br>_預設:5_
|InspectionHour|Number|伺服器與資料庫斷線的時間高達多少小時不回復資料<br>_預設:48_
|startHour|Number|樂透於幾點開始開獎 **(包含)**<br>預設0
|startMinute|Number|樂透於幾分開始開獎 **(包含)**<br>_預設:0_
|endHour|Number|樂透於幾分結束開獎 **(包含)**
|endMinute|Number|樂透於幾分結束開獎 **(包含)**<br>_預設:0_|

<p id="con"></p>

### 設定資料庫連線

1. 打開資料夾內的[config.json](./config.json)
2. 設定連線
    ```json
    {
        "DB":{
        "host":"資料庫位置", 
        "user":"使用者帳號",
        "password":"密碼", 
        "database":"資料庫名稱" 
        }
    }
    ```

<p id="startService"></p>

### 啟動服務
* 方法一

        $node py-lottery
* 方法二

    安裝pm2

        $ npm install pm2 -g
    啟動服務

        $ pm2 start py-lottery.js
    查看目前狀態

        $ pm2 list
    監控 log 訊息

        $ pm2 logs
----

<p id = "API"></p>

## WEB API服務

<p id = "URL"></p>

### URL

Path

    127.0.0.1/彩票代碼/    
Method
        
    GET
json

|key|value|說明
|----|----|----
|row|5|樂透的數量 5~20
|key|istar36588|API的金鑰

<p id = "RESULT"></p>

### RESULT


 ```json  
       {
        "type": "pyssc",
        "data": [
                {
                    "issue": "20180102055",
                    "result": [
                        "4",
                        "4",
                        "6",
                        "0",
                        "6"
                    ],
                "time": "2018-01-02 18:10:00"
                }
            ]
        }
```
----
<p id= "code"></p>

## 程式碼

<p id = "py"></p>


### [py-lottery.js](./py-lottery.js)

service的主檔案。

<p id = "custom"></p>

### [custom_lottery.js](./custom_lottery.js)

彩種設定頁，設定方法 [請按此](#彩種新增)。

<p id = "JOB"></p>

### [lottery_schedule.js](./lottery_schedule.js)

+ 執行定時任務
+ 定時器Class

<p id = "set"></p>

### [set_db.js](./set_db.js)
|function|功能|
|----|----|
|getNewest()|從資料庫取得資料庫最新資料，並且產生下一筆資料產生的時間。|
|getSql()|判斷是否需要新增或者回復資料，並且產生sql|
|saveSql()|執行sql。|
|selectDB()|取得service時間之前的5~20筆樂透資料，並整理成json。|
|getkey()|查詢firm資料表內是否有此key，並回傳Boolean。|

<P id = "res"></p>

### [lottery_result.js](./lottery_result.js)

|function|功能|
|----|----|
|getRandomArray()|產生樂透號碼，可選重複或者不重複。|
|getissue()|產生期號。編碼方式支援"YMD001" OR "YMD0001"....|

<P id = "lottery_api"> <P>

### [lottery_api](./lottery_api)
API的路由器

<p id = "controller"> <p>

### [controller.js](./controller.js)

API的控制器

+ 判斷API的ROW 是否在5~20筆之內 ! 如果不是僅輸出5筆。
+ 判斷傳入資料是否正確。
