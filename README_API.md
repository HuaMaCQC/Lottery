# 彩票 API

## URL

### Path

    127.0.0.1/彩票代碼/    
### Method
        
    GET
### 參數

|key|value|說明
|----|----|----
|row|5~20|樂透的數量
|key|abc123|API的金鑰

範例:

    127.0.0.1:3000/pyssc?row=5&key=abc123

<p id = "RESULT"></p>

## RESULT

### 型態
    
    json
### 說明
|key|型態|value
|-----|----|----|
|type|String|彩票代碼|
|data|Array|彩票資訊|
|issue|String|期數|
|result|Array|彩票號碼|
|time|YYYY-MM-DD hh:mm:ss|開獎時間|

### 例

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
