import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Highcharts from 'highcharts';
import ReactHighCharts from 'react-highcharts';
import uuid from 'uuid';

import Utilities from './Utilities';
import AllFactSheetCharts from './AllFactSheetCharts';

import InfoTable from './InfoTable';

function getGraph(title, subtitle, data){
    //use this function to determine what kind of graph to return
    if (subtitle.indexOf("Overall Score") !== -1) {
        let percentIndex = subtitle.indexOf("%");
        return createHistogram(data, title, parseInt(subtitle.substring(percentIndex - 2, percentIndex)));
    } else if (subtitle.indexOf("Lacking Accountable and Responsible") !== -1) {
        return accountResponseGraphs(data);
    } else if (subtitle.indexOf("Quality Seal") !== -1) {
        return qualityModelGraph(data, "Quality Seal");
    } else if (subtitle.indexOf("Model Completion Status") !== -1) {
        return qualityModelGraph(data, "Model Completion Status");
    }
}

function qualityModelGraph(data, title){

    let counts = {};
    let sortedData = {};

    if (title === "Quality Seal") {
        for (let i = 0; i < data.length; i++) {
            if (data[i]["qualitySeal"] in counts){
                counts[data[i]["qualitySeal"]]++;
                sortedData[data[i]["qualitySeal"]].push(data[i]);
            }else{
                counts[data[i]["qualitySeal"]] = 1;
                sortedData[data[i]["qualitySeal"]] = [];
                sortedData[data[i]["qualitySeal"]].push(data[i]);
            }
            //console.log(data[i]["qualitySeal"]);
        }
    }else if (title === "Model Completion Status") {
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i]["tags"].length; j++){
                if (data[i]["tags"][j]["tagGroup"]["name"] === "State of Model Completeness"){
                    let key = data[i]["tags"][j]["name"];
                    if (key in counts){
                        counts[key]++;
                        sortedData[key].push(data[i]);
                    }else{
                        counts[key] = 1;
                        sortedData[key] = [];
                        sortedData[key].push(data[i]);
                    }

                }
            }
        }
    }

    //console.log(counts);
    //console.log(sortedData);

    let countKeys = Object.keys(counts);

    //reformat data
    let graphData = [];
    for (let i = 0; i < countKeys.length; i++) {
        graphData.push({
            name: countKeys[i],
            y: counts[countKeys[i]]
        });
    }

    //BROKEN
    //DISABLED
    //APPROVED

    let options = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            useHTML: true,
            text: '<h2>' + title + '</h2>'
        },
        tooltip: {
            pointFormat: 'Count: <b>{point.y}</b>'
        },
        plotOptions: {
            series: {
                point: {
                  events: {
                    click: function(event) {
                      //clickInfo.clickedSubType = this.name;
        
                      // series.events triggers before series.point.events, so both can be accessed here
                      //let fsType = clickInfo.clickedFsType;
                      //let subscriptionString = clickInfo.clickedSubType;
        
                      let clickedFsSet = sortedData[this.name];//Utilities.getRelevantFactSheets(data, fsType, Utilities.subscriptionStringToSubType(subscriptionString));
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
            name: 'Seals',
            colorByPoint: true,
            data: graphData
        }]
    };

    return <ReactHighCharts config={options} />
}


//=====================================================================================================================================

function accountResponseGraphs(data) {
    let fsTypes = {'BusinessCapability': 'Domain', 'Process': 'Use Case', 'UserGroup': 'Persona',
    'Project': 'Epic', 'Application': 'Bounded Context', 'Interface': 'Behavior', 'DataObject': 'Data Object',
    'ITComponent': 'IT Component', 'Provider': 'Provider', 'TechnicalStack': 'Technical Stack'};
    let fsKeys = _.keys(fsTypes);

    let subTypes = data.map(fs => {
      return {
        fs: fs,
        subType: Utilities.computeSubType(fs)
      }
    });
    let subCounts = Utilities.countSubTypes(subTypes);
    //return <h1>hi</h1>

    let allGraphs = [];
    let missingStyle = {textAlign: "center"};
    //let n = 0;
    for (let i = 0; i < fsKeys.length; i++) {

      // Erase each div's contents
      //$(`#chart${i}`).html('');

      // Only rewrite new data into the div if it exists
      if (subCounts[fsKeys[i]]) {
        let subPercents = Utilities.computeSubPercents(subCounts[fsKeys[i]]);
        allGraphs.push(AllFactSheetCharts.createHighchart(fsKeys[i], subPercents, fsTypes, data, i));
        //n += 1;
      } else {
        allGraphs.push(<div key={uuid.v1()} style={missingStyle}><h4>{fsTypes[fsKeys[i]]}</h4><p>No Factsheets</p></div>);
      }
    }
    return allGraphs;
}


//================================================================================================================================
function createHistogram(data, fsType, threshold) {
    var x = ["< 10%", "10% - 20%", "20% - 30%", "30% - 40%", "40% - 50%", "50% - 60%", "60% - 70%", "70% - 80%", "80% - 90%", "90% - 100%", "Complete"];
    var y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var filteredData = [[], [], [], [], [], [], [], [], [], [], []];

    for (let i = 0; i < data.length; i++) {
        if (data[i]["completion"]["completion"] < .10) {
            filteredData[0].push(data[i]);
            y[0] = y[0] + 1;
        } else if (data[i]["completion"]["completion"] < .20) {
            filteredData[1].push(data[i]);
            y[1] = y[1] + 1;
        } else if (data[i]["completion"]["completion"] < .30) {
            filteredData[2].push(data[i]);
            y[2] = y[2] + 1;
        } else if (data[i]["completion"]["completion"] < .40) {
            filteredData[3].push(data[i]);
            y[3] = y[3] + 1;
        } else if (data[i]["completion"]["completion"] < .50) {
            filteredData[4].push(data[i]);
            y[4] = y[4] + 1;
        } else if (data[i]["completion"]["completion"] < .60) {
            filteredData[5].push(data[i]);
            y[5] = y[5] + 1;
        } else if (data[i]["completion"]["completion"] < .70) {
            filteredData[6].push(data[i]);
            y[6] = y[6] + 1;
        } else if (data[i]["completion"]["completion"] < .80) {
            filteredData[7].push(data[i]);
            y[7] = y[7] + 1;
        } else if (data[i]["completion"]["completion"] < .90) {
            filteredData[8].push(data[i]);
            y[8] = y[8] + 1;
        } else if (data[i]["completion"]["completion"] < 1) {
            filteredData[9].push(data[i]);
            y[9] = y[9] + 1;
        } else {
            filteredData[10].push(data[i]);
            y[10] = y[10] + 1;
        }
    }

    var colorsChoice = genColorChoices(threshold);
    var options = buildHistogramOptions(fsType, colorsChoice, x, y, data);

    return <ReactHighCharts config={options} />
}

function genColorChoices(threshold) {
    var colors = ['red', 'red', 'red', 'yellow', 'yellow', 'yellow', 'yellow', 'green', 'green', 'green', 'blue'];

    if (threshold < 70) {
        var minGreen = Math.ceil(threshold / 10);

        // Turn intervals above the threshold green
        for (let i = minGreen; i < 7; i++) {
            colors[i] = 'green';
        }
    }
    return colors;
}

function buildHistogramOptions(fsType, colorsChoice, x, y, data) {
    return {
        chart: {
            type: 'column'
        },
        title: {
            text: fsType
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
                colorByPoint: true,
                point: {
                    events: {
                        click: function(event) {
                            let type = Utilities.ebscoToLeanIXTypes(fsType);

                            let m = this.category.match(/\d+/g);
                            let range = [];
                            if (m) {
                                range = m.map(Number);
                            }
            
                            let clickedFsSet = [];
                            if (range.length === 0) {
                                clickedFsSet = Utilities.completionWithinRange(Utilities.getFactSheetsOfType(data, type),
                                1, 1.1);
                            } else if (range.length === 1) {
                                clickedFsSet = Utilities.completionWithinRange(Utilities.getFactSheetsOfType(data, type),
                                0, range[0] / 100);
                            } else {
                                clickedFsSet = Utilities.completionWithinRange(Utilities.getFactSheetsOfType(data, type),
                                range[0] / 100, range[1] / 100);
                            }

                            // TODO: Make InfoTable dynamic so completion percentage can be shown here
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
        series: [{name: "Count", data: y}]
    }
}

export default {
    getGraph: getGraph,
    accountResponseGraphs: accountResponseGraphs,
    createHistogram: createHistogram
}