<html>
    <head>
        <title>stock</title>
        <meta charset="UTF-8" />
        <script src="https://code.highcharts.com/highcharts.src.js"></script>
        <style>
             .background {
                background-color: whitesmoke;
                border:2px solid gainsboro;
                width: 450px;
                height: 185px;
                margin-left:auto;
                margin-right:auto;
                margin-bottom:10px;
            }
            .title {
                font-family:serif;
                font-size: 30;
                text-align: center;
                margin-bottom:20px;
            }
            .line {
                border-bottom:0px;
                border-right:0px;
                border-left:0px;
                border-top: 2px solid gainsboro;
                margin:5px;
                position:relative;
                bottom:5px;
            }
            .annotation {
                text-align:left;  
                font-family:serif;
                font-size: 15;
                position: relative;
                left:10px;
            }
            .box {
                position: relative;
                left:10px;
            }
            .btn {
                position:relative;
                top:10px;
                left: 190px;
            }
            table {
                width:1000px;
                margin-left:auto;
                margin-right:auto;
                margin-bottom:10px;
            }
            table, tr, td {
                font-family:sans-serif;
                font-size: 10;
                border: 1px solid gainsboro;
                border-collapse: collapse;
            }
            tr {
                height: 20px;
            }
            .left {
                background-color:whitesmoke;
                font-weight: bold;
                width:350px;
            }
            .right {
                background-color: rgb(251, 251, 251);
                width:650px;
                text-align:center;
            }
            .image {
                width:15px;
                height:15px;
            }
            .link{
                color: blue;
                text-decoration: none;
                margin-left:20px;
            }
            #container {
                width: 1000px; 
                margin-left:auto;
                margin-right:auto;
            }
            #displayNews {
                width: 300px;
                margin-left:auto;
                margin-right:auto;
            }
            #text {
                text-align:center;
                color:darkgray;
                margin-bottom:10px;
            }
            #grayArrow {
                width: 50px;
                height: 25px;
                display: block;
                margin-left:auto;
                margin-right:auto;
                margin-bottom:10px;
            }
            .publicTime {
                text-align:left;  
                font-family:sans-serif;
                font-size: 10;
                position: relative;
                left:15px;
            }
            .newsTable {
                height: 200px;
            }
            .newsTable table{
                background-color:whitesmoke;
                border: 2px solid gainsboro;
            }
            .newsTable table tr {
                height: 25px;
            }
            .newsLink{
                text-align:left;
                color: blue;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class = "background">
            <div class = "title">
                <i>Stock Search</i>
                <hr class = "line">
            </div>
            <form method="POST" action="HSTOCKW6.php">
                <span class = "annotation">Enter Stock Ticker Symbol:*</span>
                <input id = "inputSymbol" class = "box" type = "text" name = "symbol" value="<?php 
                    if (isset($_POST['symbol'])){
                        echo($_POST['symbol']); 
                    }
                ?>">
                <br>
                <input class = "btn" type="submit" name = "search" value = "Search">
                <button class = "btn" type="button" name = "clear" onclick = "clearPage()">Clear</button>
            </form>
            <script Language = "JavaScript">
                function clearPage()
                    {
                        document.getElementById("inputSymbol").value = "";
                        if (document.getElementById("tableid")) {
                            document.getElementById("tableid").innerHTML = "";
                        }
                        if (document.getElementById("container")) {
                            document.getElementById("container").innerHTML = "";
                        }
                        if (document.getElementById("displayNews")) {
                            document.getElementById("displayNews").innerHTML = "";
                        }    
                        if (document.getElementById("news")) {
                            document.getElementById("news").innerHTML = "";
                        }
                    }           
            </script>
            <i class = "annotation">* _ Mandatory fields.</i>
        </div>
        <?PHP
            if (isset($_POST['search'])) {
                if (isset($_POST['symbol']) && $_POST['symbol'] != "") {
                    $request = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='.$_POST['symbol'].'&outputsize=full&apikey=CXCP8RICMEN0CQIR';
                    $json = @file_get_contents($request);
                    if (preg_match("/503/", $http_response_header[0]) || preg_match("/404/", $http_response_header[0])) {
                        echo "Error Message: ";
                        echo $http_response_header[0];   // HTTP/1.1 401 Unauthorized
                        exit;
                    }
                    $obj = json_decode($json);
                    //Error Message
                    if (isset($obj->{'Error Message'})) {
                        $table = '<table id = "tableid"><tr><td class ="left">Error</td><td class = "right">Error:NO recored has been found, please enter a valid symbol</td></tr></table>';
                        echo $table;
                        exit;
                    }
                    $table = '<table id = "tableid"><tr><td class ="left">Stock Ticker Symbol</td><td class = "right">'.$obj->{'Meta Data'}->{'2. Symbol'}.'</td></tr>';
                    $last = current($obj->{'Time Series (Daily)'});
                    $previous = next($obj->{'Time Series (Daily)'});
                    $table .= '<tr><td class = "left">Close</td><td class = "right">'. $last->{'4. close'}.'</td></tr>';
                    $table .= '<tr><td class = "left">Open</td><td class = "right">'. $last->{'1. open'}.'</td></tr>';
                    $table .= '<tr><td class = "left">Previous Close</td><td class = "right">'. $previous->{'4. close'}.'</td></tr>';
                    $lastclose = (double)$last->{'4. close'};
                    $previousclose = (double)$previous->{'4. close'};
                    $change = number_format($lastclose - $previousclose,2);
                    $table .= '<tr><td class = "left">Change</td><td class = "right">'.$change;
                    if ($change < 0) {
                        $table .= '<img src = "http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png" class = "image"></td></tr>';
                    } else {
                        $table .= '<img src = "http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png" class = "image"></td></tr>';
                    }
                    $percent = number_format($change / $previous->{'4. close'} * 100,2);
                    $table .= '<tr><td class = "left">Change Percent</td><td class = "right">'. $percent.'%';
                    if ($percent < 0) {
                        $table .= '<img src = "http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png" class = "image"></td></tr>';
                    } else {
                        $table .= '<img src = "http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png" class = "image"></td></tr>';
                    }
                    $table .= '<tr><td class = "left">Day\'s Range</td><td class = "right">'.$last->{'3. low'}.'-'.$last->{'2. high'}.'</td></tr>';
                    $table .= '<tr><td class = "left">Volume</td><td class = "right">'.number_format($last->{'5. volume'}).'</td></tr>';
                    date_default_timezone_set($obj->{'Meta Data'}->{'5. Time Zone'});
                    $table .= '<tr><td class = "left">Timestamp</td><td class = "right">'.date('Y-m-d', strtotime($obj->{'Meta Data'}->{'3. Last Refreshed'})).'</td></tr>';
                    $table .= '<tr><td class = "left">Indicators</td><td class = "right">';
                    $table .= '<a href = "javascript:void(0)" class = "link" onclick = "chart(this.innerHTML)">'.'Price'.'</a>';
                    $table .= '<a href = "javascript:void(0)" class = "link" onclick = "chart(this.innerHTML)">'.'SMA'.'</a>';
                    $table .= '<a href = "javascript:void(0)" class = "link" onclick = "chart(this.innerHTML)">'.'EMA'.'</a>';
                    $table .= '<a href = "javascript:void(0)" class = "link" onclick = "chart(this.innerHTML)">'.'STOCH'.'</a>';
                    $table .= '<a href = "javascript:void(0)" class = "link" onclick = "chart(this.innerHTML)">'.'RSI'.'</a>';
                    $table .= '<a href = "javascript:void(0)" class = "link" onclick = "chart(this.innerHTML)">'.'ADX'.'</a>';
                    $table .= '<a href = "javascript:void(0)" class = "link" onclick = "chart(this.innerHTML)">'.'CCI'.'</a>';
                    $table .= '<a href = "javascript:void(0)" class = "link" onclick = "chart(this.innerHTML)">'.'BBANDS'.'</a>';
                    $table .= '<a href = "javascript:void(0)" class = "link" onclick = "chart(this.innerHTML)">'.'MACD'.'</a>';
                    $table .='</td></tr></table>';
                    echo $table; 
                    $price = array();
                    $date = array();
                    $volumn = array();
                    $i = 0;
                    foreach ($obj->{'Time Series (Daily)'} as $theDate => $value) {
                        $date[$i] = date('m/d', strtotime($theDate));
                        $price[$i] = round($value->{'4. close'}, 2);
                        $volumn[$i] = (int)$value->{'5. volume'};
                        $i++;
                    }
                    $price = array_slice($price, 0, 121);
                    $date = array_slice($date, 0, 121);
                    $volumn = array_slice($volumn, 0, 121);
                    $maxVolumn = max($volumn) * 6;
                    $minPrice = min($price) * 0.8;
                    $price = json_encode($price);
                    $date = json_encode($date);
                    $volumn = json_encode($volumn);
                ?>  
                    <div id ="container"></div>
                    <script language = "javascript">
                        function chart(chartType) {
                            if (chartType == "Price") {
                                Highcharts.chart('container', {
                                    chart: {
                                        height: 500,
                                        zoomType: 'x',
                                        borderColor: '#D1D0CE',
                                        borderWidth: 1
                                    },
                                    title: {
                                        text: "Stock Price (" + "<?php echo date('m/d/Y', strtotime($obj->{'Meta Data'}->{'3. Last Refreshed'}))?>" + ")"
                                    },
                                    subtitle: {
                                        useHTML: true,
                                        text: "<a href = 'https://www.alphavantage.co' target= '_blank'>Source: Alpha Vantage</a>"
                                    },
                                    xAxis: [{
                                        reversed: true,
                                        tickInterval: 5,
                                        categories: <?php echo $date?>
                                    }],
                                    yAxis: [{ // Primary yAxis
                                            title: {
                                                text: 'Stock Price'
                                            },
                                            min: <?php echo $minPrice;?>
                                        }, { // Secondary yAxis
                                            title: {
                                                text: 'Volume',
                                            },
                                            max: <?php echo $maxVolumn;?>,
                                            opposite: true
                                    }],
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
                                    legend: {
                                        layout: 'vertical',
                                        align: 'right',
                                        x:0,
                                        verticalAlign: 'top',
                                        y:150,
                                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                                    },
                                    series: [{
                                        name: "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>",
                                        type: 'area',
                                        data: <?php echo $price?>,
                                        tooltip: {
                                            valueDecimals:2
                                        },
                                        color: '#E74C3C'
                                    }, {  
                                        name: "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>" + " Volume",
                                        type: 'column',
                                        data: <?php echo $volumn?>,
                                        yAxis: 1,
                                        color: '#FFFFFF'
                                    }]
                                });
                            }
                            if (chartType == "SMA") {
                                var url = "https://www.alphavantage.co/query?function=SMA&symbol=" + "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>" + "&interval=daily&time_period=10&series_type=close&apikey=CXCP8RICMEN0CQIR";
                                loadJSON(url, chartType);
                            }
                            if (chartType == "EMA") {
                                var url = "https://www.alphavantage.co/query?function=EMA&symbol=" + "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>" + "&interval=daily&time_period=10&series_type=close&apikey=CXCP8RICMEN0CQIR";
                                loadJSON(url, chartType);
                            }
                            if (chartType == "STOCH") {
                                var url = "https://www.alphavantage.co/query?function=STOCH&symbol=" + "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>" + "&interval=daily&slowkmatype=1&slowdmatype=1&time_period=10&series_type=close&apikey=CXCP8RICMEN0CQIR";
                                loadJSON(url, chartType);
                            }
                            if (chartType == "RSI") {
                                var url = "https://www.alphavantage.co/query?function=RSI&symbol=" + "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>" + "&interval=daily&time_period=10&series_type=close&apikey=CXCP8RICMEN0CQIR";
                                loadJSON(url, chartType);
                            }
                            if (chartType == "ADX") {
                                var url = "https://www.alphavantage.co/query?function=ADX&symbol=" + "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>" + "&interval=daily&time_period=10&series_type=close&apikey=CXCP8RICMEN0CQIR";
                                loadJSON(url, chartType);
                            }
                            if (chartType == "CCI") {
                                var url = "https://www.alphavantage.co/query?function=CCI&symbol=" + "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>" + "&interval=daily&time_period=10&series_type=close&apikey=CXCP8RICMEN0CQIR";
                                loadJSON(url, chartType);
                            }
                            if (chartType == "BBANDS") {
                                var url = "https://www.alphavantage.co/query?function=BBANDS&symbol=" + "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>" + "&interval=daily&time_period=5&nbdevup=3&nbdevdn=3&time_period=5&series_type=close&apikey=CXCP8RICMEN0CQIR";
                                loadJSON(url, chartType);
                            }
                            if (chartType == "MACD") {
                                var url = "https://www.alphavantage.co/query?function=MACD&symbol=" + "<?php echo $obj->{'Meta Data'}->{'2. Symbol'}?>" + "&interval=daily&time_period=10&series_type=close&apikey=CXCP8RICMEN0CQIR";
                                loadJSON(url, chartType);
                            }
                        }
                        
                        function loadJSON (url, chartType){
                            if (window.XMLHttpRequest){
                                // code for IE7+, Firefox, Chrome, Opera, Safari
                                xmlhttp=new XMLHttpRequest();
                            }
                            else{
                                // code for IE6, IE5
                                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                            }
                            xmlhttp.onreadystatechange = function() {
                              if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                                indicatorsChart(chartType, JSON.parse(xmlhttp.responseText));
                              }
                            };
                            xmlhttp.open("GET",url,true); //open, send, responseText are
                            xmlhttp.send();
                        }
                        
                        function indicatorsChart (chartType, chartData) {
                            var date = [];
                            var i = 0;
                            if (chartType == "STOCH") {
                                var slowK = [];
                                var slowD = [];
                                for(var key in chartData["Technical Analysis: " + chartType]){
                                    var numOfDate = key.split(" ");
                                    numOfDate = numOfDate[0].split("-");
                                    date[i] = numOfDate[1] + "/" + numOfDate[2];
                                    var value = parseFloat(chartData["Technical Analysis: " + chartType][key]["SlowK"]);
                                    slowK[i] = value;
                                    value = parseFloat(chartData["Technical Analysis: " + chartType][key]["SlowD"]);
                                    slowD[i] = value;
                                    i++;
                                }
                                date = date.slice(0, 121);
                                slowK = slowK.slice(0, 121);
                                slowD = slowD.slice(0, 121);
                                Highcharts.chart('container', {
                                    chart: {
                                        zoomType: 'x',
                                        borderColor: '#D1D0CE',
                                        borderWidth: 1,
                                        height:500
                                    },
                                    title: {
                                        text: chartData["Meta Data"]["2: Indicator"]
                                    },
                                    subtitle: {
                                        useHTML: true,
                                        text: "<a href = 'https://www.alphavantage.co'>Source: Alpha Vantage</a>"
                                    },
                                    xAxis: [{
                                        reversed: true,
                                        tickInterval: 5,
                                        categories:  date
                                    }],
                                    yAxis: [{ // Primary yAxis
                                        title: {
                                            text: chartType
                                        },
                                        tickInterval:10
                                    }],
                                    legend: {
                                        layout: 'vertical',
                                        align: 'right',
                                        x:0,
                                        verticalAlign: 'top',
                                        y:150,
                                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                                    },
                                    plotOptions: {
                                        series: {
                                            lineWidth: 1,
                                            marker: {
                                              enabled: true,
                                              symbol: "square",
                                              radius: 2
                                            }
                                        }
                                    },
                                    series: [{
                                        name: chartData["Meta Data"]["1: Symbol"] + " SlowK",
                                        data:  slowK,
                                        color: '#FF0000'
                                    }, {
                                        name: chartData["Meta Data"]["1: Symbol"] + " SlowD",
                                        data:  slowD,
                                        color: '#3BB9FF'
                                    }]
                                })
                            } else if (chartType == "BBANDS") {
                                var middle = [];
                                var upper = [];
                                var lower = [];
                                for(var key in chartData["Technical Analysis: " + chartType]){
                                    var numOfDate = key.split(" ");
                                    numOfDate = numOfDate[0].split("-");
                                    date[i] = numOfDate[1] + "/" + numOfDate[2];
                                    var value = parseFloat(chartData["Technical Analysis: " + chartType][key]["Real Middle Band"]);
                                    middle[i] = value;
                                    var value = parseFloat(chartData["Technical Analysis: " + chartType][key]["Real Lower Band"]);
                                    lower[i] = value;
                                    var value = parseFloat(chartData["Technical Analysis: " + chartType][key]["Real Upper Band"]);
                                    upper[i] = value;
                                    i++;
                                }
                                date = date.slice(0, 121);
                                middle = middle.slice(0, 121);
                                lower = lower.slice(0, 121);
                                upper = upper.slice(0, 121);
                                Highcharts.chart('container', {
                                    chart: {
                                        zoomType: 'x',
                                        borderColor: '#D1D0CE',
                                        borderWidth: 1,
                                        height:500
                                    },
                                    title: {
                                        text: chartData["Meta Data"]["2: Indicator"]
                                    },
                                    subtitle: {
                                        useHTML: true,
                                        text: "<a href = 'https://www.alphavantage.co'>Source: Alpha Vantage</a>"
                                    },
                                    xAxis: [{
                                        reversed: true,
                                        tickInterval: 5,
                                        categories:  date
                                    }],
                                    yAxis: [{ // Primary yAxis
                                        title: {
                                            text: chartType
                                        }
                                    }],
                                    legend: {
                                        layout: 'vertical',
                                        align: 'right',
                                        x:0,
                                        verticalAlign: 'top',
                                        y:150,
                                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                                    },
                                    plotOptions: {
                                       series: {
                                            lineWidth: 1,
                                            marker: {
                                                      enabled: true,
                                                      symbol: "square",
                                                      radius: 2
                                            }
                                       }
                                    },
                                    series: [{
                                        name: chartData["Meta Data"]["1: Symbol"] + " Real Middle Band",
                                        data:  middle,
                                        color: '#FF0000'
                                    }, {
                                        name: chartData["Meta Data"]["1: Symbol"] + " Real Upper Band",
                                        data:  upper,
                                        color:'#3BB9FF',
                                    }, {
                                        name: chartData["Meta Data"]["1: Symbol"] + " Real Lower Band",
                                        data:  lower,
                                        color:'#000000'
                                    }]
                                })
                            } else if (chartType == "MACD") {
                                var hist = [];
                                var signal = [];
                                var macd = [];
                                for(var key in chartData["Technical Analysis: " + chartType]){
                                    var numOfDate = key.split(" ");
                                    numOfDate = numOfDate[0].split("-");
                                    date[i] = numOfDate[1] + "/" + numOfDate[2];
                                    var value = parseFloat(chartData["Technical Analysis: " + chartType][key]["MACD_Hist"]);
                                    hist[i] = value;
                                    value = parseFloat(chartData["Technical Analysis: " + chartType][key]["MACD_Signal"]);
                                    signal[i] = value;
                                    value = parseFloat(chartData["Technical Analysis: " + chartType][key]["MACD"]);
                                    macd[i] = value;
                                    i++;
                                }
                                date = date.slice(0, 121);
                                hist = hist.slice(0, 121);
                                signal = signal.slice(0, 121);
                                macd = macd.slice(0, 121);
                                Highcharts.chart('container', {
                                    chart: {
                                        zoomType: 'x',
                                        borderColor: '#D1D0CE',
                                        borderWidth: 1,
                                        height:500
                                    },
                                    title: {
                                        text: chartData["Meta Data"]["2: Indicator"]
                                    },
                                    subtitle: {
                                        useHTML: true,
                                        text: "<a href = 'https://www.alphavantage.co'>Source: Alpha Vantage</a>"
                                    },
                                    xAxis: [{
                                        reversed: true,
                                        tickInterval: 5,
                                        categories:  date
                                    }],
                                    yAxis: [{ // Primary yAxis
                                        title: {
                                            text: chartType
                                        }
                                    }],
                                    legend: {
                                        layout: 'vertical',
                                        align: 'right',
                                        x:0,
                                        verticalAlign: 'top',
                                        y:150,
                                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                                    },
                                    plotOptions: {
                                        series: {
                                            lineWidth: 1,
                                            marker: {
                                              enabled: true,
                                              symbol: "square",
                                              radius: 2
                                            }
                                        }
                                    },
                                    series: [{
                                        name: chartData["Meta Data"]["1: Symbol"] + " MACD",
                                        data:  macd,
                                        color: '#FF0000'
                                    }, {
                                        name: chartData["Meta Data"]["1: Symbol"] + " MACD_Hist",
                                        data:  hist,
                                        color: '#E8A317'
                                    }, {
                                        name: chartData["Meta Data"]["1: Symbol"] + " MACD_Signal",
                                        data:  signal,
                                        color: '#3BB9FF'
                                    }]
                                })
                            } else {
                                var results = [];
                                for(var key in chartData["Technical Analysis: " + chartType]){
                                    var numOfDate = key.split(" ");
                                    numOfDate = numOfDate[0].split("-");
                                    date[i] = numOfDate[1] + "/" + numOfDate[2];
                                    var value = parseFloat(chartData["Technical Analysis: " + chartType][key][chartType]);
                                    results[i] = value;
                                    i++;
                                }
                                date = date.slice(0, 121);
                                results = results.slice(0, 121);
                                Highcharts.chart('container', {
                                        chart: {
                                            zoomType: 'x',
                                            borderColor: '#D1D0CE',
                                            borderWidth: 1,
                                            height:500
                                        },
                                        title: {
                                            text: chartData["Meta Data"]["2: Indicator"]
                                        },
                                        subtitle: {
                                            useHTML: true,
                                            text: "<a href = 'https://www.alphavantage.co'>Source: Alpha Vantage</a>"
                                        },
                                        xAxis: [{
                                            reversed: true,
                                            tickInterval: 5,
                                            categories:  date
                                        }],
                                        yAxis: [{ // Primary yAxis
                                            title: {
                                                text: chartType
                                            }
                                        }],
                                        legend: {
                                            layout: 'vertical',
                                            align: 'right',
                                            x:0,
                                            verticalAlign: 'top',
                                            y:150,
                                            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                                        },
                                        plotOptions: {
                                            series: {
                                                color: '#FF0000',
                                                lineWidth: 1,
                                                marker: {
                                                  enabled: true,
                                                  symbol: "square",
                                                  radius: 2
                                                }
                                            }
                                        },
                                        series: [{
                                            name: chartData["Meta Data"]["1: Symbol"],
                                            data:  results
                                        }]
                                    })
                                }
                        }
                        //call functions
                        chart('Price');
                    </script>                                 
        <?php 
                    $newsRequest = 'https://seekingalpha.com/api/sa/combined/'. $_POST['symbol'] .'.xml';
                    $xml = @file_get_contents($newsRequest);
                    if (preg_match("/503/", $http_response_header[0]) || preg_match("/404/", $http_response_header[0])) {
                        echo "Error Message: ";
                        echo $http_response_header[0];   // HTTP/1.1 401 Unauthorized
                        exit;
                    }
                    $newsData = simplexml_load_string($xml);
                    if (!$newsData) {
                        exit;
                    } else {
                        $latestNews = array();
                        $latestNews['news'] = array();
                        $i = 0;
                        $count = 0;
                        while ($i < $newsData->channel->item->count() && $count < 5) {
                            $match = (string)$newsData->channel->item[$i]->link;
                            if (preg_match("/article/i", $match)) {
                                $latestNews['news'][$count]['title'] = (string)$newsData->channel->item[$i]->title;
                                $latestNews['news'][$count]['link'] = (string)$newsData->channel->item[$i]->link;
                                $latestNews['news'][$count]['pubDate'] = str_replace("-0400", "", (string)$newsData->channel->item[$i]->pubDate);
                                $count++;
                            }
                            $i++;
                        }
                    }
                ?>
        <div onclick="displayNews()" id = "displayNews">
            <p id = "text">click to show stock news</p>
            <img id="grayArrow" src="http://cs-server.usc.edu:45678/hw/hw6/images/Gray_Arrow_Down.png">
        </div>
        <div class = "newsTable"><table id = "news"></table></div>
        <script language = "javascript">
            function displayNews() {
                var image = document.getElementById('grayArrow');
                var text = document.getElementById('text');
                var newsTable = document.getElementById('news');
                var json = <?php echo json_encode($latestNews);?>;
                if (image.src.match("Gray_Arrow_Down")) {
                    image.src = "http://cs-server.usc.edu:45678/hw/hw6/images/Gray_Arrow_Up.png";
                    text.innerHTML = "click to hide stock news";
                    for (i = 0; i < 5; i++){
                        newsTable.innerHTML += "<tr><td><a class = \"newslink\" href =\"" + json['news'][i]['link'] + "\" target=\"_blank\">" + json['news'][i]['title'] + "</a><span class = \"publicTime\">Publicated Time: " + json['news'][i]['pubDate'] + "</span></td></tr>";
                    }
                } else {
                    image.src = "http://cs-server.usc.edu:45678/hw/hw6/images/Gray_Arrow_Down.png";
                    text.innerHTML = "click to show stock news";
                    news.innerHTML = "";
                }
            }
        </script>
        <?php
                } else {
                    echo '<script language="javascript">';
                    echo 'alert("Please enter a symbol")';
                    echo '</script>';
                    exit;
                } 
            }
        ?>              
        <NOSCRIPT></NOSCRIPT>
    </body>
</html>