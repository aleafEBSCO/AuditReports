import React, { Component } from 'react';

import Highcharts from 'highcharts';
import ReactHighCharts from 'react-highcharts';

function getGraph(subtitle, data){
    //use this function to determine what kind of graph to return
    if (subtitle.indexOf("Overall Score") !== -1){
        return createHistogram(data);
    }
}


function createHistogram(data) {

    //console.log(data);

    var x = ["< 10%", "10% - 20%", "20% - 30%", "30% - 40%", "40% - 50%", "50% - 60%", "60% - 70%", "70% - 80%", "80% - 90%", "90% - 100%", "Complete"];
    var y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var filteredData = [[], [], [], [], [], [], [], [], [], [], []];

    for (let i = 0; i < data.length; i++) {
        if (data[i]["completion"]["completion"] < .10) {
            filteredData[0].push(data[i]);
            y[0] = y[0] + 1;
        }else if (data[i]["completion"]["completion"] < .20) {
            filteredData[1].push(data[i]);
            y[1] = y[1] + 1;
        }else if (data[i]["completion"]["completion"] < .30) {
            filteredData[2].push(data[i]);
            y[2] = y[2] + 1;
        }else if (data[i]["completion"]["completion"] < .40) {
            filteredData[3].push(data[i]);
            y[3] = y[3] + 1;
        }else if (data[i]["completion"]["completion"] < .50) {
            filteredData[4].push(data[i]);
            y[4] = y[4] + 1;
        }else if (data[i]["completion"]["completion"] < .60) {
            filteredData[5].push(data[i]);
            y[5] = y[5] + 1;
        }else if (data[i]["completion"]["completion"] < .70) {
            filteredData[6].push(data[i]);
            y[6] = y[6] + 1;
        }else if (data[i]["completion"]["completion"] < .80) {
            filteredData[7].push(data[i]);
            y[7] = y[7] + 1;
        }else if (data[i]["completion"]["completion"] < .90) {
            filteredData[8].push(data[i]);
            y[8] = y[8] + 1;
        }else if (data[i]["completion"]["completion"] < 1) {
            filteredData[9].push(data[i]);
            y[9] = y[9] + 1;
        }else{
            filteredData[10].push(data[i]);
            y[10] = y[10] + 1;
        }

    }

    var colorsChoice = ['red', 'red', 'red', 'yellow', 'yellow', 'yellow', 'yellow', 'green', 'green', 'green', 'blue'];

    //console.log(y);

    var options = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Overall Score'
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Number of Factsheets'
            }
        },
        plotOptions: {
            column: {
                colors: colorsChoice
            },
            series: {
                colorByPoint: true
            }
        },
        series: [{name: "Count", data: y}]
    }

    return <ReactHighCharts config={options} />

    /*
    var myChart = Highcharts.chart('chart', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Overall Score'
        },
        xAxis: {
            categories: x
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Number of Factsheets'
            }
        },
        plotOptions: {
            column: {
                colors: colorsChoice
            },
            series: {
                colorByPoint: true
            }
        },
        series: [{name: "Count", data: y}]
    });
    */
}

export default {
    getGraph: getGraph,
    createHistogram: createHistogram
}