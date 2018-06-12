import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Highcharts from 'highcharts';
import ReactHighCharts from 'react-highcharts';
import uuid from 'uuid';

import InfoTable from './InfoTable';

function lifecycleGraph(data) {
    let counts = {
        "No lifecycle": 0,
        "Has lifecycle": 0
    }
    let sortedData = {
        "No lifecycle": [],
        "Has lifecycle": []
    }
    for (let i = 0; i < data.length; i++){
        if (data[i]["lifecycle"] === null || data[i]["lifecycle"]["phases"].length === 0){
            counts["No lifecycle"]++;
            sortedData["No lifecycle"].push(data[i]);
          }else{
            counts["Has lifecycle"]++;
            sortedData["Has lifecycle"].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions("Lifecycle", graphData, sortedData);
    return [<ReactHighCharts config={options} />, sortedData["No lifecycle"].length];
    
}

function businessCriticalityGraph(data) {
    let counts = {
        "No Business Criticality": 0,
        "No Business Criticality Description": 0,
        "No Business Criticality and No Description": 0,
        "Has Business Criticality and Description": 0
    }
    let sortedData = {
        "No Business Criticality": [],
        "No Business Criticality Description": [],
        "No Business Criticality and No Description": [],
        "Has Business Criticality and Description": []
    }
    for (let i = 0; i < data.length; i++){
        if ((data[i]["businessCriticality"] === null) && (data[i]["businessCriticalityDescription"] === null || data[i]["businessCriticalityDescription"] === "")){
            counts["No Business Criticality and No Description"]++;
            sortedData["No Business Criticality and No Description"].push(data[i]);
          }else if ((data[i]["businessCriticality"] === null) && !(data[i]["businessCriticalityDescription"] === null || data[i]["businessCriticalityDescription"] === "")){
            counts["No Business Criticality"]++;
            sortedData["No Business Criticality"].push(data[i]);
          }else if (!(data[i]["businessCriticality"] === null) && (data[i]["businessCriticalityDescription"] === null || data[i]["businessCriticalityDescription"] === "")){
            counts["No Business Criticality Description"]++;
            sortedData["No Business Criticality Description"].push(data[i]);
          }else{
            counts["Has Business Criticality and Description"]++;
            sortedData["Has Business Criticality and Description"].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions("Business Criticality", graphData, sortedData);
    return [<ReactHighCharts config={options} />, (counts["No Business Criticality and No Description"] + counts["No Business Criticality"] + counts["No Business Criticality Description"])];
}

function functionalFitGraph(data) {
    let counts = {
        "No Functional Fit": 0,
        "No Functional Fit Description": 0,
        "No Functional Fit and No Description": 0,
        "Has Functional Fit and Description": 0
    }
    let sortedData = {
        "No Functional Fit": [],
        "No Functional Fit Description": [],
        "No Functional Fit and No Description": [],
        "Has Functional Fit and Description": []
    }
    for (let i = 0; i < data.length; i++){
        if ((data[i]["functionalSuitability"] === null) && (data[i]["functionalSuitabilityDescription"] === null || data[i]["functionalSuitabilityDescription"] === "")){
            counts["No Functional Fit and No Description"]++;
            sortedData["No Functional Fit and No Description"].push(data[i]);
          }else if ((data[i]["functionalSuitability"] === null) && !(data[i]["functionalSuitabilityDescription"] === null || data[i]["functionalSuitabilityDescription"] === "")){
            counts["No Functional Fit"]++;
            sortedData["Functional Fit"].push(data[i]);
          }else if (!(data[i]["functionalSuitability"] === null) && (data[i]["functionalSuitabilityDescription"] === null || data[i]["functionalSuitabilityDescription"] === "")){
            counts["No Functional Fit Description"]++;
            sortedData["No Functional Fit Description"].push(data[i]);
          }else{
            counts["Has Functional Fit and Description"]++;
            sortedData["Has Functional Fit and Description"].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions("Functional Fit", graphData, sortedData);
    return [<ReactHighCharts config={options} />, (counts["No Functional Fit and No Description"] + counts["No Functional Fit"] + counts["No Functional Fit Description"])];
}

//=====================================================================
function graphFormat(counts) {
    let countKeys = Object.keys(counts);
    //reformat data
    let graphData = [];
    for (let i = 0; i < countKeys.length; i++) {
        graphData.push({
            name: countKeys[i],
            y: counts[countKeys[i]]
        });
    }
    return graphData;
}

function pieChartOptions(graphTitle, graphData, sortedData) {
    return {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            useHTML: true,
            text: '<h2>' + graphTitle + '</h2>'
        },
        tooltip: {
            pointFormat: 'Count: <b>{point.y}</b>'
        },
        plotOptions: {
            series: {
                point: {
                  events: {
                    click: function(event) {
        
                      let clickedFsSet = sortedData[this.name];
                      //console.log(data);
                      if (clickedFsSet.length !== 0) {
                        ReactDOM.render(<InfoTable data={clickedFsSet} />, document.getElementById('info'));
        
                        let top = event.pageY;
                        $('#info').css('top', `${top + 25}px`);
                        
                        // Scroll lock
                        document.body.style.overflow = 'hidden';
                        // Toggle backdrop
                        $('#backdrop').toggleClass('modal-backdrop in');
                        // Show info
                        $('#info').show();
                      }
                    }
                  }
                }
            },
            pie: {
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'data',
            colorByPoint: true,
            data: graphData
        }]
    };
}

export default {
    lifecycleGraph: lifecycleGraph,
    businessCriticalityGraph: businessCriticalityGraph,
    functionalFitGraph: functionalFitGraph

}