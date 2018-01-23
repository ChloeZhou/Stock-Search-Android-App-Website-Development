var App = angular.module("stockSearch", ['ngMaterial', 'ngAnimate','ngSanitize']);

/*App.controller("errorHandle", function($scope){
    $scope.data = {
        symbol: ""
    };
    $scope.empty = false;
    $scope.messageText = "";
    $scope.error = function() {
        if ($scope.data.symbol == "") {
            $scope.empty = true;  
            $scope.messageText = "Please enter a stock ticker symbol.";  
        } else {
            $scope.empty = false;
            $scope.messageText = "";  
        }
    }
});*/

  'use strict';
  App.controller('AutoCtrl', function ($timeout, $q, $log, $http, $scope,$interval) {
    var self = this;
    self.simulateQuery = false;
    self.isDisabled    = false;

    // list of `state` value/display objects
    //self.states;
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;
    self.search = search;
    self.deletefav = deletefav;
    self.favor = favor;
    //self.refresh = refresh;
    self.share = share;
    self.facebook = facebook;
    self.clearPage = clearPage;
    $scope.records = [
        "SMA",
        "EMA",
        "STOCH",
        "RSI",
        "ADX",
        "CCI",
        "BBANDS",
        "MACD",
    ]
    $scope.favoriteList = [];//temp
    $scope.noOrder = true;
    $scope.noSearch = true;
    $scope.order = "Ascending";
    var ele;
    var local = JSON.parse(localStorage.getItem("symbolList"));
    for (var loE in local) {
        $scope.favoriteList.push(local[loE]);
    }
    console.log($scope.favoriteList);
    //console.log($scope.ctrl.searchText);
    var chartPrice;
    var chartSMA;
    var chartEMA;
    var chartSTOCH;
    var chartRSI;
    var chartADX;
    var chartCCI;
    var chartBBANDS;
    var chartMACD;
    
    $scope.$watch('orderBy + order', function () {
        console.log($scope.orderBy);
        console.log($scope.order);
        if ($scope.orderBy != null && $scope.orderBy != 'Default') {
            $scope.noOrder = false;
        }
        if ($scope.orderBy == 'Default') {
            $scope.noOrder = true;
        }
        if ($scope.order == "Ascending") {
            if ($scope.orderBy == "Symbol") {
                $scope.favoriteList.sort(function(a, b){
                    if (a.Symbol < b.Symbol)
                        return -1;
                    if (a.Symbol > b.Symbol)
                        return 1;
                    return 0;
                });
                console.log($scope.favoriteList);
            } else if ($scope.orderBy == "Price") {
                console.log("sortPrice");
                $scope.favoriteList.sort(function(a, b){
                    return a.Close - b.Close});
                console.log($scope.favoriteList);
            } else if ($scope.orderBy == "Change") {
                $scope.favoriteList.sort(function(a, b){
                    return a.Change - b.Change});  
                console.log($scope.favoriteList);
            } else if ($scope.orderBy == "ChangePercent") {
                $scope.favoriteList.sort(function(a, b){
                    return a["Change Percent"] - b["Change Percent"]}); 
                console.log($scope.favoriteList);
            } else if ($scope.orderBy == "Volume") {
                $scope.favoriteList.sort(function(a, b){
                    return a.Volume - b.Volume}); 
                console.log($scope.favoriteList);
            }
        } else if ($scope.order == "Descending") {
            if ($scope.orderBy == "Symbol") {
                $scope.favoriteList.sort(function(a, b){
                    if (a.Symbol > b.Symbol)
                        return -1;
                    if (a.Symbol < b.Symbol)
                        return 1;
                    return 0;
                });
            } else if ($scope.orderBy == "Price") {
                $scope.favoriteList.sort(function(a, b){
                    return b.Close - a.Close});   
            } else if ($scope.orderBy == "Change") {
                $scope.favoriteList.sort(function(a, b){
                    return b.Change - a.Change});          
            } else if ($scope.orderBy == "ChangePercent") {
                $scope.favoriteList.sort(function(a, b){
                    return b["Change Percent"] - a["Change Percent"]});      
            } else if ($scope.orderBy == "Volume") {
                $scope.favoriteList.sort(function(a, b){
                    return b.Volume - a.Volume});           
            }
        }
    });
    
    function querySearch (query) {
    //var filter = query ? self.states.filter(createFilterFor(query));
        var res = $http({
            method : "GET",
            url : "/?type=autocomplete&symbol=" + query
        }).then(function mySuccess(response) {
            return response.data;
        },function errorCallback(response) {
            return response.statusText;
        })
        return res;
    }
    
    function clearPage() {
        $scope.slide = false;
        $scope.noData = true;
        $scope.ctrl.searchText = "";
        $scope.searchForm.autocompleteField.$touched = false;
    }
    
    function searchTextChange(text) {
      $log.info('Text changed to ' + text);
    }

    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
    }
    
    function search (symbol) {
        $scope.empty = true;
        $scope.myStyle={};
        for (var i = 0; i < $scope.favoriteList.length; i++){
            if ($scope.favoriteList[i].Symbol == symbol) {
                $scope.empty = false;
                $scope.myStyle={color:'#FFD801'};
                break;
            } 
        }
        $scope.nofav = true;
        $scope.nofb = true;
        $scope.slide = true;
        var bar = "<div class=\"progress\" style=\"margin-top:100px\"><div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"45\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 45%\"><span class=\"sr-only\">45% Complete</span></div></div>"
        $('#resultTable').html(bar);
         $('#Price').html(bar);
        $('#historyChart').html(bar);
        $http({
            method : "GET",
            url : "/?type=priceVol&symbol=" + symbol
        }).then(function mySuccess(response) {
            if (response.data.Symbol == null) {
                var alert = "<div class=\"alert alert-danger\" style = \"margin-top:50px;\" role=\"alert\">Error! Failed to get current stock data</div>";
                 $("#resultTable").html(alert);
                alert = "<div class=\"alert alert-danger\" style = \"margin-top:50px;\" role=\"alert\">Error! Failed to get Price data</div>";
                $("#Price").html(alert);
                alert = "<div class=\"alert alert-danger\"  style = \"margin-top:50px;\" role=\"alert\">Error! Failed to get Historical Chart data</div>";
                $("#historyChart").html(alert);
                chartPrice = null;
            } else {
                displayPriceHis(response.data);
                console.log(response.data);
                var changeHtml = "";
                if (response.data.Change > 0) {
                    changeHtml += '<span class = "changeColg">' + response.data.Change + "(" + response.data["Change Percent"] + "%)</span>";
                    changeHtml += '<img class = "picture" src = "http://cs-server.usc.edu:45678/hw/hw8/images/Up.png">';
                } else {
                    changeHtml += '<span class = "changeColr">' + response.data.Change + "(" + response.data["Change Percent"] + "%)</span>";
                    changeHtml += '<img class = "picture" src = "http://cs-server.usc.edu:45678/hw/hw8/images/Down.png">';
                }
                var volumeFormat = response.data.LastVolume.toString().replace(/\d{1,3}(?=(\d{3})+$)/g,function(s){return s+','})
                var resJson =  {
                    "Symbol" : response.data.Symbol,
                    "Close" : Number(response.data.LastPrice),
                    "HTMLForChange" : changeHtml,
                    "Change" : Number(response.data.Change),
                    "Change Percent" : Number(response.data["Change Percent"]),
                    "VolumeStr" : volumeFormat,
                    "Volume" : response.data.LastVolume,
                }
                ele = resJson;
                if ($scope.empty) {
                    $scope.nofav = false;
                }
                $scope.nofb = false;
                $scope.noData = false
            }
        },function errorCallback(response) {
            consloe.log(response.status);
        });
        var bar = "<div class=\"progress\" style = \"margin-top:50px\"><div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"45\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 45%\"><span class=\"sr-only\">45% Complete</span></div></div>"
        $('#newsFeeds').html(bar);
        $http({
            method : "GET",
            url : "/?type=news&symbol=" + symbol
        }).then(function mySuccess(response) {
            if (response.data.Title == null) {
                 var alert = "<div class=\"alert alert-danger\" style = \"margin-top:50px;\" role=\"alert\">Error! Failed to get current stock data</div>";
                $('#newsFeeds').html(alert);
            } else {
                displayNews(response.data);
                console.log(response.data);
            }
        },function errorCallback(response) {
             console.log(response.status);
        });
        indicator("SMA", symbol);
        indicator("EMA", symbol);
        indicator("STOCH", symbol);
        indicator("RSI", symbol);
        indicator("ADX", symbol);
        indicator("CCI", symbol);
        indicator("BBANDS", symbol);
        indicator("MACD", symbol);
    }

    function indicator (type, symbol) {
        var bar = "<div class=\"progress\" style =\"margin-top:50px;\"><div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"45\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 45%\"><span class=\"sr-only\">45% Complete</span></div></div>"
        $('#'+ type).html(bar);
        $http({
            method : "GET",
            url : "/?type=" + type + "&symbol=" + symbol
        }).then(function mySuccess(response) {
            console.log(response.data);
            if (response.data.Date == null) {
                var alert = "<div class=\"alert alert-danger\" style = \"margin-top:50px;\" role=\"alert\">Error! Failed to get "+ type + " data</div>"
                $('#'+ type).html("");
                $('#'+ type).html(alert);
                if (type == 'SMA') {
                    chartSMA = null;
                }
                if (type == 'EMA') {
                    chartEMA = null;
                }
                if (type == 'STOCH') {
                    chartSTOCH = null; 
                }
                if (type == 'RSI') {
                    chartRSI = null;
                }
                if (type == 'ADX') {
                    chartADX = null;
                }
                if (type == 'CCI') {
                    chartCCI = null;
                }
                if (type == 'BBANDS') {
                    chartBBANDS = null; 
                }
                if (type == 'MACD') {
                    chartMACD = null; 
                }
            } else {
                chart(type, response.data);
            }
        },function errorCallback(response) {
            console.log(response.status);
        });
    }
    
    function favor () {
        //local storage
        $scope.favoriteList.push(ele);
        localStorage.setItem("symbolList", JSON.stringify($scope.favoriteList));
    }
    
    function deletefav (element) {
        console.log(element);
        for (var i = 0; i < $scope.favoriteList.length; i++) {
            console.log($scope.favoriteList[i].Symbol);
            if ($scope.favoriteList[i].Symbol == element) {
                $scope.favoriteList.splice(i, 1);
                localStorage.setItem("symbolList", JSON.stringify($scope.favoriteList));   
                break;
            }
        }
        console.log($scope.favoriteList);
    }
    //what if refresh broken????
    $scope.refresh = function () {
        console.log("working refresh");
        for (var i = 0; i < $scope.favoriteList.length; i++) {
            var temp;
            $http({
                method : "GET",
                url : "/?type=priceVol&symbol=" + $scope.favoriteList[i].Symbol
            }).then(function mySuccess(response) {
                if (response.data.Symbol != null) {
                    var changeHtml = "";
                    if (response.data.Change > 0) {
                        changeHtml += '<span class = "changeColg">' + response.data.Change + "(" + response.data["Change Percent"] + "%)</span>";
                        changeHtml += '<img class = "picture" src = "http://cs-server.usc.edu:45678/hw/hw8/images/Up.png">';
                    } else {
                        changeHtml += '<span class = "changeColr">' + response.data.Change + "(" + response.data["Change Percent"] + "%)</span>";
                        changeHtml += '<img class = "picture" src = "http://cs-server.usc.edu:45678/hw/hw8/images/Down.png">';
                    }
                    var volumeFormat = response.data.LastVolume.toString().replace(/\d{1,3}(?=(\d{3})+$)/g,function(s){return s+','});
                    for (var j = 0; j < $scope.favoriteList.length; j++) {
                        if ($scope.favoriteList[j].Symbol == response.data.Symbol) {
                            $scope.favoriteList[j].Close = response.data.LastPrice;
                            $scope.favoriteList[j].HTMLForChange = changeHtml;
                            $scope.favoriteList[j].VolumeStr = volumeFormat;
                            $scope.favoriteList[j].Volume = response.data.LastVolume;
                        }
                    }
                }
            })
        }
        localStorage.setItem("symbolList", JSON.stringify($scope.favoriteList));
    }  
    $scope.refresh();//refresh when page open 
      
    function facebook (tab) {
        $scope.nofb = false;
        //console.log(tab);
        if (tab == 'Price' && chartPrice == null) {
            console.log("Price");
            $scope.nofb = true;
        }
        //console.log(chartSMA);
        if (tab == 'SMA' && chartSMA == null) {
            console.log("SMA");
            $scope.nofb = true;  
        }
        //console.log(chartEMA);
        if (tab == 'EMA' && chartEMA == null) {
            console.log("EMA");
            $scope.nofb = true;       
        }
        //console.log(chartSTOCH);
        if (tab == 'STOCH' && chartSTOCH == null) {
            console.log("STOCH");
            $scope.nofb = true;       
        }
        //console.log(chartRSI);
        if (tab == 'RSI' && chartRSI == null) {
            console.log("RSI");
            $scope.nofb = true;       
        }
        //console.log(chartADX);
        if (tab == 'ADX' && chartADX == null) {
            console.log("ADX");
            $scope.nofb = true;       
        }
        //console.log(chartCCI);
        if (tab == 'CCI' && chartCCI == null) {
            console.log("CCI");
            $scope.nofb = true;       
        }
        //console.log(chartBBANDS);
        if (tab == 'BBANDS' && chartBBANDS == null) {
            console.log("BBANDS");
            $scope.nofb = true;       
        }
        //console.log(chartMACD);
        if (tab == 'MACD' && chartMACD == null) {
            console.log("MACD");
            $scope.nofb = true;       
        }   
    }
      
    function share () {
    
      window.fbAsyncInit = function () {
        FB.init({
          appId            : '163861367535163',
          autoLogAppEvents : true,
          status           : true,      
          xfbml            : true,
          version          : 'v2.11'
        });

      };
        var shareChart;
        var activeTab = $('.nav-tabs .active> a').attr('href');
        console.log(activeTab);
        if (activeTab == '#Price') {
             shareChart = chartPrice;
        } else if (activeTab == '#SMA') {
            shareChart = chartSMA;
        } else if (activeTab == '#EMA') {
            shareChart = chartEMA; 
        } else if (activeTab == '#STOCH') {
            shareChart = chartSTOCH;   
        } else if (activeTab == '#RSI') {
            shareChart = chartRSI;  
        } else if (activeTab == '#ADX') {
            shareChart = chartADX;     
        } else if (activeTab == '#CCI') {
            shareChart = chartCCI;     
        } else if (activeTab == '#BBANDS') {
            shareChart = chartBBANDS;    
        } else if (activeTab == '#MACD') {
            shareChart = chartMACD;     
        }
        var obj = {};
        var exportUrl = shareChart.exporting.url;
        obj.options = JSON.stringify(shareChart);
        obj.type = 'image/png';
        obj.async = true;
        //obj = JSON.stringify(obj);
        //console.log("/?type=facebook&shareChart=" + obj);
        $http({
            method: 'post',
            url:'/',
            data: obj
        }).then(function (response){
            exportUrl += response.data;
            FB.ui({
                app_id: '163861367535163', method: 'feed',
                picture: exportUrl,
                }, (response) => {
                if (response && !response.error_message) {
                   alert('Posted Successfully');
                }else{
                   alert('Not Posted');
                }
            });
            console.log(exportUrl);
        });
    
      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "https://connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
        
    }
                 
    function displayPriceHis (response) {
        var stockTable = '<table class = "table table-striped" style = "margin-top:20px"><tr><td>Stock Ticker Symbol</td><td>'+response.Symbol+'</td></tr>';
        stockTable += '<tr><td>Last Price</td><td>' + response.LastPrice + '</td></tr>';
        if (response.Change > 0) {
            stockTable += '<tr><td>Change(Change Percent)</td><td style = "color:green">' + response.Change + "(" + response["Change Percent"] + "%)";
            stockTable += '<img src = "http://cs-server.usc.edu:45678/hw/hw8/images/Up.png" style = "height:17px; width:17px"></td></tr>';
        } else {
            stockTable += '<tr><td>Change(Change Percent)</td><td style = "color:red">' + response.Change + "(" + response["Change Percent"] + "%)";
            stockTable += '<img src = "http://cs-server.usc.edu:45678/hw/hw8/images/Down.png" style = "height:17px; width:17px"></td></tr>';
        }
        stockTable += '<tr><td>Timestamp</td><td>' + response.Timestamp + '</td></tr>';
        stockTable += '<tr><td>Open</td><td>' + response.Open + '</td></tr>';
        if (response.Dealing) {
            stockTable += '<tr><td>Close</td><td>' + response.Close + '</td></tr>';
        } else {
            stockTable += '<tr><td>Close</td><td>' + response.LastPrice + '</td></tr>';
        }
        stockTable += '<tr><td>Day\'s Range</td><td>' + response.DayRange[0] + ' - ' + response.DayRange[1] + '</td></tr>';
        var volumeFormat = response.LastVolume.toString().replace(/\d{1,3}(?=(\d{3})+$)/g,function(s){return s+','})
        stockTable += '<tr><td>Volume</td><td>' + volumeFormat +  '</td></tr></table>';
        $('#resultTable').html("");
        $('#resultTable').html(stockTable);
        $('#Price').html("");
        $('#historyChart').html("");
        chart("Price", response);
        chart("History", response);
    }
      
    function displayNews(response) {
        var news = "";
            for (var i = 0; i < response.Title.length; i++) {
                news += "<div class = \"newsBack\"><p style = \"margin-bottom:20px\"><a href = \"" + response.Link[i] + "\" class = \"newsTitle\" target=\"_blank\">" + response.Title[i];
                news += "</a></p><p class = \"newsRef\">" + response.Author[i];
                news += "</p><p class = \"newsRef\">" + response.Date[i] + "</p></div>";
            }
        $('#newsFeeds').html("");
        $('#newsFeeds').html(news);
    }
    
    function chart (chartType, res) {
        if (chartType == "Price") {
            chartPrice = {
                chart: {
                    zoomType: 'x',
                },
                title: {
                    text: res.Symbol + " Stock Price and Volume"
                },
                subtitle: {
                    useHTML: true,
                    text: "<a href = 'https://www.alphavantage.co' target= '_blank'>Source: Alpha Vantage</a>"
                },
                xAxis: [{
                    reversed: true,
                    tickInterval: 5,
                    categories: res.Date
                }],
                yAxis: [{ // Primary yAxis
                        title: {
                            text: 'Stock Price'
                        },
                        //min: Math.min.apply(null, res.Price) * 0.8
                        min:0
                        }, { // Secondary yAxis
                        title: {
                            text: 'Volume',
                        },
                        //max: Math.max.apply(null, res.Volumn) * 6,
                        opposite: true
                }],
                plotOptions: {
                    area: {
                        lineWidth: 1,
                        fillOpacity: 0.4,
                         marker: {
                            enabled: false,
                            states: {
                                hover: {
                                    enabled: true,
                                    radius: 5
                                }
                            }
                        },
                        shadow: false,
                        threshold: null
                    }
                },
                legend: {
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                series: [{
                    name: "Price",
                    type: 'area',
                    data: res.Price,
                    tooltip: {
                        valueDecimals:2
                    },
                    color: '#001BFF'
                }, {  
                    name: "Volume",
                    type: 'column',
                    data: res.Volume,
                    yAxis: 1,
                    color: '#E74C3C'
                }],
                exporting : {
                    url: 'https://export.highcharts.com/'
                }
            };
            Highcharts.chart('Price', chartPrice);
        } else if (chartType == "History") {
            var chartHistory = {
                chart: {
                    zoomType: 'x'
                },
                yAxis: [{
                    title: {
                            text: 'Stock Value',
                        },
                        //max: Math.max.apply(null, res.Volumn) * 6,
                        opposite: true
                }],
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions:{
                            rangeSelector: {
                            inputEnabled: $("#historyChart").width() > 480,
                            buttons: [
                            {
                                type: 'month',
                                count: 1,
                                text: '1m'
                            }, {
                                type: 'month',
                                count: 3,
                                text: '3m'
                            }, {
                                type: 'month',
                                count: 6,
                                text: '6m'
                            }, {
                                type: 'year',
                                count: 1,
                                text: '1y'
                            }, {
                                type: 'all',
                                text: 'All'
                            }],
                                selected: 0
                            },   
                        }
                    }]
                },
                 rangeSelector: {
                    buttons: [
                    {
                        type: 'week',
                        count: 1,
                        text: '1w'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    },  {
                        type: 'ytd',
                        count: 1,
                        text: 'YTD'
                    },{
                        type: 'year',
                        count: 1,
                        text: '1y'
                    },{
                        type: 'all',
                        text: 'All'
                    }],
                    selected: 0
                },
                tooltip: {
                    formatter: function () {
                        var s = Highcharts.dateFormat("%A %b %e %Y",this.x);
                        $.each(this.points, function () {
                            //var d = new Date(this.x);
                            //d = moment(date).format("YYYY-MM-DD")
                            s += '<br/><span style="color:' + this.series.color + '">\u25CF</span> ' + this.series.name + ': ' + '<b>' + this.y + '</b>';
                        });
                        return s;
                    }
                },
                title: {
                    text: res.Symbol + ' Stock Value'
                },

                subtitle: {
                        useHTML: true,
                        text: "<a href = 'https://www.alphavantage.co' target= '_blank'>Source: Alpha Vantage</a>"
                },
                plotOptions: {
                        area: {
                            lineWidth: 1,
                            fillOpacity: 0.65,
                             marker: {
                                enabled: false,
                                states: {
                                    hover: {
                                        enabled: true,
                                        radius: 5
                                    }
                                }
                            },
                            shadow: false,
                            threshold: null
                        }
                    },
                series: [{
                    name: res.Symbol,
                    data: res.History.reverse(),
                    type: 'area',
                    tooltip: {
                        valueDecimals: 2
                    }
                }],
                exporting: {
                    url: 'http://export.highcharts.com/'
                }
            };
            Highcharts.stockChart('historyChart', chartHistory); 
        }else if (chartType == "STOCH") {
            chartSTOCH = {
                chart: {
                    zoomType: 'x',
                },
                title: {
                    text: res.Title
                },
                subtitle: {
                    useHTML: true,
                    text: "<a href = 'https://www.alphavantage.co'>Source: Alpha Vantage</a>"
                },
                xAxis: [{
                    reversed: true,
                    tickInterval: 5,
                    categories:  res.Date
                }],
                yAxis: [{ // Primary yAxis
                    title: {
                        text: chartType
                    },
                    tickInterval:10
                }],
                legend: {
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
/*                plotOptions: {
                    series: {
                        lineWidth: 1,
                        marker: {
                          enabled: true,
                          symbol: "square",
                          radius: 2
                        }
                    }
                },*/
                series: [{
                    name: chartType + " SlowK",
                    data:  res.SlowK,
                }, {
                    name: chartType + " SlowD",
                    data:  res.SlowD,
                }],
                exporting: {
                    url: 'http://export.highcharts.com/'
                }
            }
            Highcharts.chart('STOCH', chartSTOCH);
        } else if (chartType == "BBANDS") {
            chartBBANDS = {
                chart: {
                    zoomType: 'x'
                },
                title: {
                    text: res.Title
                },
                subtitle: {
                    useHTML: true,
                    text: "<a href = 'https://www.alphavantage.co'>Source: Alpha Vantage</a>"
                },
                xAxis: [{
                    reversed: true,
                    tickInterval: 5,
                    categories:  res.Date
                }],
                yAxis: [{ // Primary yAxis
                    title: {
                        text: chartType
                    }
                }],
                legend: {
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                /*plotOptions: {
                   series: {
                        lineWidth: 1,
                        marker: {
                                  enabled: true,
                                  symbol: "square",
                                  radius: 2
                        }
                   }
                },*/
                series: [{
                    name: chartType + " Real Middle Band",
                    data:  res.Middle,
                }, {
                    name: chartType + " Real Upper Band",
                    data:  res.Upper,
                }, {
                    name: chartType + " Real Lower Band",
                    data:  res.Lower,
                }],
                exporting: {
                    url: 'http://export.highcharts.com/'
                }
            }
            Highcharts.chart('BBANDS', chartBBANDS);
        } else if (chartType == "MACD") {
            chartMACD = {
                chart: {
                    zoomType: 'x'
                },
                title: {
                    text: res.Title
                },
                subtitle: {
                    useHTML: true,
                    text: "<a href = 'https://www.alphavantage.co'>Source: Alpha Vantage</a>"
                },
                xAxis: [{
                    reversed: true,
                    tickInterval: 5,
                    categories:  res.Date
                }],
                yAxis: [{ // Primary yAxis
                    title: {
                        text: chartType
                    }
                }],
                legend: {
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                /*plotOptions: {
                    series: {
                        lineWidth: 1,
                        marker: {
                          enabled: true,
                          symbol: "square",
                          radius: 2
                        }
                    }
                },*/
                series: [{
                    name: chartType + " MACD",
                    data:  res.MACD
                }, {
                    name: chartType + " MACD_Hist",
                    data:  res.Hist
                }, {
                    name: chartType + " MACD_Signal",
                    data:  res.Signal
                }],
                exporting: {
                    url: 'http://export.highcharts.com/'
                }
            }
            Highcharts.chart('MACD', chartMACD);
        } else {
            var chartJson = {
                    chart: {
                        zoomType: 'x'
                    },
                    title: {
                        text: res.Title
                    },
                    subtitle: {
                        useHTML: true,
                        text: "<a href = 'https://www.alphavantage.co'>Source: Alpha Vantage</a>"
                    },
                    xAxis: [{
                        reversed: true,
                        tickInterval: 5,
                        categories:  res.Date
                    }],
                    yAxis: [{ // Primary yAxis
                        title: {
                            text: chartType
                        }
                    }],
                    legend: {
                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                    },
                    /*plotOptions: {
                        series: {
                            color: '#FF0000',
                            lineWidth: 1,
                            marker: {
                              enabled: true,
                              symbol: "square",
                              radius: 2
                            }
                        }
                    },*/
                    series: [{
                        name: chartType,
                        data:  res.Result
                    }],
                    exporting: {
                        url: 'http://export.highcharts.com/'
                    }
                }
            Highcharts.chart(chartType, chartJson);
            if (chartType == 'SMA') {
                chartSMA = chartJson;
            } else if (chartType == 'EMA') {
                chartEMA = chartJson;
            } else if (chartType == 'RSI') {
                chartRSI = chartJson;           
            } else if (chartType == 'ADX') {
                chartADX = chartJson;
            } else {
                chartCCI = chartJson;
            }
        }
    
    }

    $(function(){ 
        $(".toggle").click(function () {
            if ($(this).hasClass("off")) {
                console.log("work");
                Timer = $interval($scope.refresh,5000);
            } else {
                console.log("work");
                $interval.cancel(Timer);
            }
        });
    })
    
  });