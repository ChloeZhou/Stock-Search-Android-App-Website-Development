var express = require('express');
var router = express.Router();
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
//var path = require("path");
app.use(express.static('public'));
app.use(bodyParser.json());
var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get("/", function (req, res) {
    /*console.log(Object.keys(req.query));
    console.log(req.url);
    console.log(req.query.type);
    console.log(req.query.symbol);*/
    var queType = req.query.type;
    var symbol = req.query.symbol;
    //console.log(req.query.shareChart);
    if (!queType && !symbol) {
        res.sendFile(__dirname + '/index.html');
    }
    if (queType == "priceVol") {
        var requestURL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + symbol + "&outputsize=full&apikey=CXCP8RICMEN0CQIR";
        getPriceVol(res, requestURL);
    }
    if (queType == "SMA" || queType == "EMA" || queType == "STOCH"
        || queType == "RSI" || queType == "ADX" || queType == "CCI"
       || queType == "BBANDS" || queType == "MACD") {
        var requestURL = "https://www.alphavantage.co/query?function=" + queType + "&symbol=" + symbol + "&interval=daily&time_period=10&series_type=close&apikey=CXCP8RICMEN0CQIR";
        getIndicator(res, requestURL, queType);
    }
    if (queType == "news") {
        var requestURL = "https://seekingalpha.com/api/sa/combined/" + symbol +".xml";
        getNews(res, requestURL);
    }
    if (queType == "autocomplete") {
        var requestURL = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=" + symbol;
        getAuto(res, requestURL);
    }
    
})

app.post ('/', function (req, res) {
    console.log("work");
    var shareChart = JSON.parse(req.body);
    //var obj = {};
    //obj.options = JSON.parse(shareChart.options);
    var requestURL = 'http://export.highcharts.com/';
    facebook(res, requestURL, shareChart);
})

// Listen on port 3000, IP defaults to 127.0.0.1

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
})


function getPriceVol (res, url) {
    request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
/*            console.log(Object.keys(response["Time Series (Daily)"])[0]);
            console.log(Object.keys(response["Time Series (Daily)"])[1]);
            console.log("Got a response: ", response["Meta Data"]["2. Symbol"]);*/
            if (response["Meta Data"] != null) {
                var last = Object.keys(response["Time Series (Daily)"])[0];
                var prev = Object.keys(response["Time Series (Daily)"])[1];
                var lastClose = Number(response["Time Series (Daily)"][last]["4. close"]);
                var prevClose = Number(response["Time Series (Daily)"][prev]["4. close"]);
                var change = lastClose - prevClose;
                var percent = change / Number(prevClose) * 100;
                var price = [];
                var volume = [];
                var date = [];
                var history = [];
                var i = 0;
                var moment = require('moment');
                var momenttz = require('moment-timezone');
                var timearr = response["Meta Data"]["3. Last Refreshed"].split(" ");
                var time;
                var dealing;
                //console.log(timearr[1]);
                if (timearr[1] == null || timearr[1] == "") {
                    dealing = false;
                    time = momenttz.tz(response["Meta Data"]["3. Last Refreshed"],"America/New_York").format("YYYY-MM-DD") + " 16:00:00";
                } else {
                    dealing = true;
                    time = momenttz.tz(response["Meta Data"]["3. Last Refreshed"],"America/New_York").format("YYYY-MM-DD HH:mm:ss");
                }
                for (var key in response["Time Series (Daily)"]) {
                    date[i] = moment(key).format("MM/DD");
                    price[i] = Number(response["Time Series (Daily)"][key]["4. close"]);
                    volume[i] = Number(response["Time Series (Daily)"][key]["5. volume"]);
                    var ele = [];
                    var num = key.split(" ");
                    var dateHis = new Date(num[0]);
                    ele[0] = dateHis.getTime();
                    ele[1] = price[i];
                    history[i] = ele;
                    i++;
                }
                var resJson = {
                                "Symbol": response["Meta Data"]["2. Symbol"].toUpperCase(),
                                "LastPrice" : lastClose.toFixed(2),
                                "Close" : prevClose.toFixed(2), 
                                "Open" : Number(response["Time Series (Daily)"][last]["1. open"]).toFixed(2),
                                "Change" : change.toFixed(2),
                                "Change Percent":percent.toFixed(2),
                                "DayRange" : [
                                    Number(response["Time Series (Daily)"][last]["3. low"]).toFixed(2),
                                    Number(response["Time Series (Daily)"][last]["2. high"]).toFixed(2),
                                ],
                                "LastVolume" : response["Time Series (Daily)"][last]["5. volume"],
                                "Timestamp" : time + " EDT", 
                                "Price" : price.slice(0,121),
                                "Volume": volume.slice(0,121),
                                "Date" : date.slice(0,121),
                                "History" : history.slice(0,1000),
                                "Dealing" : dealing
                              };
                res.contentType('application/json');
                res.send(resJson);  
            } else {
                res.send("error");
                console.log("error price");
            }
        } else {
            res.send("error");
            //console.log("Got an error: ", error, ", status code: ", response.statusCode)
        }
    })   
}

function getIndicator(res, url, queType) {
    var date = [];
    var i = 0;
    if (queType == "STOCH") {
        var slowK = [];
        var slowD = [];
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                response = JSON.parse(body);
                if (response["Meta Data"] != null) {
                    for(var key in response["Technical Analysis: " + queType]){
                        var moment = require('moment');
                        date[i] = moment(key).format("MM/DD");
                        var value = parseFloat(response["Technical Analysis: " + queType][key]["SlowK"]);
                        slowK[i] = value;
                        value = parseFloat(response["Technical Analysis: " + queType][key]["SlowD"]);
                        slowD[i] = value;
                        i++;
                    }
                    resJson = {
                        "Title" : response["Meta Data"]["2: Indicator"],
                        "Date" : date.slice(0, 121),
                        "SlowK" : slowK.slice(0, 121),
                        "SlowD" : slowD.slice(0, 121)
                    }
                    res.contentType('application/json');
                    res.send(resJson); 
                } else {
                    res.send("error");
                    console.log("error STOCH");
                }
            } else {
                res.send("error");
                //console.log("Got an error: ", error, ", status code: ", response.statusCode)
            }
        })
    } else if (queType == "BBANDS") {
        var middle = [];
        var upper = [];
        var lower = [];
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                response = JSON.parse(body);
                if (response["Meta Data"] != null) {
                    for(var key in response["Technical Analysis: " + queType]){
                        var moment = require('moment');
                        date[i] = moment(key).format("MM/DD");
                        var value = parseFloat(response["Technical Analysis: " + queType][key]["Real Middle Band"]);
                        middle[i] = value;
                        value = parseFloat(response["Technical Analysis: " + queType][key]["Real Lower Band"]);
                        lower[i] = value;
                        value = parseFloat(response["Technical Analysis: " + queType][key]["Real Upper Band"]);
                        upper[i] = value;
                        i++;
                    }
                    resJson = {
                        "Title" : response["Meta Data"]["2: Indicator"],
                        "Date" : date.slice(0, 121),
                        "Middle" : middle.slice(0, 121),
                        "Lower" : lower.slice(0, 121),
                        "Upper" : upper.slice(0, 121)
                    }
                    res.contentType('application/json');
                    res.send(resJson);  
                } else {
                    res.send("error");
                    console.log("error BBANDS");
                }
            } else {
                res.send("error");
                //console.log("Got an error: ", error, ", status code: ", response.statusCode)
            }
        })
    } else if (queType == "MACD") {
        var hist = [];
        var signal = [];
        var macd = [];
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                response = JSON.parse(body);
                if (response["Meta Data"] != null) {
                    for(var key in response["Technical Analysis: " + queType]){
                        var moment = require('moment');
                        date[i] = moment(key).format("MM/DD");
                        var value = parseFloat(response["Technical Analysis: " + queType][key]["MACD_Hist"]);
                        hist[i] = value;
                        value = parseFloat(response["Technical Analysis: " + queType][key]["MACD_Signal"]);
                        signal[i] = value;
                        value = parseFloat(response["Technical Analysis: " + queType][key]["MACD"]);
                        macd[i] = value;
                        i++;
                    }
                    resJson = {
                        "Title" : response["Meta Data"]["2: Indicator"],
                        "Date" : date.slice(0, 121),
                        "Hist" : hist.slice(0, 121),
                        "Signal" : signal.slice(0, 121),
                        "MACD" : macd.slice(0, 121)
                    }
                    res.contentType('application/json');
                    res.send(resJson);  
                } else {
                    res.send("error");
                    console.log("error MACD");
                }
            } else {
                res.send("error");
                //console.log("Got an error: ", error, ", status code: ", response.statusCode)
            }
        })
    } else {
        var results = [];
        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                response = JSON.parse(body);
                if (response["Meta Data"] != null) {
                    var i = 0;
                    for(var key in response["Technical Analysis: " + queType]){
                        var moment = require('moment');
                        date[i] = moment(key).format("MM/DD");
                        var value = parseFloat(response["Technical Analysis: " + queType][key][queType]);
                        results[i] = value;
                        i++;
                    }
                    resJson = {
                        "Title" : response["Meta Data"]["2: Indicator"],
                        "Date" : date.slice(0, 121),
                        "Result" : results.slice(0, 121)
                    }
                    res.contentType('application/json');
                    res.send(resJson);
                } else {
                    res.send("error");
                    console.log("error" + queType);
                }
            } else {
                res.send("error");
                //console.log("Got an error: ", error, ", status code: ", response.statusCode)
            }
        })
    }
}

function getNews (res, url) {
    var title = [];
    var link = [];
    var author = [];
    var date = [];
    request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var parseString = require('xml2js').parseString;
            parseString(body, function (err, result) {
                response = JSON.parse(JSON.stringify(result["rss"]["channel"]));
                //console.log(response[0]["item"][0]["title"][0]);
                var i = 0;
                var count = 0;
                while (i < response[0]["item"].length) {
                    var match = response[0]["item"][i]["link"][0];
                    if (match.match(/article/i)) {
                        title[count] = response[0]["item"][i]["title"][0];
                        link[count] = match;
                        author[count] = response[0]["item"][i]["sa:author_name"][0];
                        date[count] = response[0]["item"][i]["pubDate"][0].replace("-4000", "EDT");
                        count++;
                    }
                    i++;
                }
                var resJson = {
                    "Title" : title,
                    "Link" : link,
                    "Author": author,
                    "Date": date
                };
                res.contentType('application/json');
                res.send(resJson); 
            }); 
        } else {
            res.send("error");
            //console.log("Got an error: ", error, ", status code: ", response.statusCode)
        }
    })   
}

function getAuto (res, url) {
    request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var response = JSON.parse(body);
            res.contentType('application/json');
            res.send(response);  
        } else {
            //console.log("Got an error: ", error, ", status code: ", response.statusCode)
        }
    })   
}

function facebook (res, url, json) {
    request.post({url : url, form: json}, function (error, response, body){
        if (!error && response.statusCode == 200) {
            console.log(body);
            res.send(body);
        } else {
            res.send('error');
        }
    });
}