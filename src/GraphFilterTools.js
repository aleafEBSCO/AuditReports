import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Highcharts from 'highcharts';
import ReactHighCharts from 'react-highcharts';
import uuid from 'uuid';

import Utilities from './Utilities';

import InfoTable from './InfoTable';

function accountableResponsibleGraphs(data) {
    let filteredData = {
        Domain: data.filter(fs => {return (fs.type === "BusinessCapability")}),
        "Use Case": data.filter(fs => {return (fs.type === "Process")}),
        Persona: data.filter(fs => {return (fs.type === "UserGroup")}),
        Epic: data.filter(fs => {return (fs.type === "Project")}),
        "Bounded Context": data.filter(fs => {return (fs.type === "Application")}),
        Behavior: data.filter(fs => {return (fs.type === "Interface")}),
        "Data Object": data.filter(fs => {return (fs.type === "DataObject")}),
        "IT Component": data.filter(fs => {return (fs.type === "ITComponent")}),
        Provider: data.filter(fs => {return (fs.type === "Provider")}),
        "Technical Stack": data.filter(fs => {return (fs.type === "TechnicalStack")})
    }


    let graphsInfo = {
        Domain: {},
        "Use Case": {},
        Persona: {},
        Epic: {},
        "Bounded Context": {},
        Behavior: {},
        "Data Object": {},
        "IT Component": {},
        Provider: {},
        "Technical Stack": {}
    }

    var keys = Object.keys(graphsInfo);

    for (let i = 0; i < keys.length; i++) {
        graphsInfo[keys[i]].counts = {
            "No responsible, no accountable": 0,
            "Responsible, no accountable": 0,
            "Accountable, no responsible": 0,
            "Responsible and accountable": 0
        }
        graphsInfo[keys[i]].sortedData = {
            "No responsible, no accountable": [],
            "Responsible, no accountable": [],
            "Accountable, no responsible": [],
            "Responsible and accountable": []
        }

        let account = false;
        let response = false;

        let currentData = filteredData[keys[i]];
        for (let j = 0; j < currentData.length; j++) {
            account = false;
            response = false;
            for (let k = 0; k < currentData[j]["subscriptions"]["edges"].length; k++){
                if (currentData[j]["subscriptions"]["edges"][k]["node"]["type"] === "ACCOUNTABLE"){
                    account = true;
                }else if (currentData[j]["subscriptions"]["edges"][k]["node"]["type"] === "RESPONSIBLE"){
                    response = true;
                }
            } 

            if (!(response) && !(account)) {
                graphsInfo[keys[i]].counts["No responsible, no accountable"]++;
                graphsInfo[keys[i]].sortedData["No responsible, no accountable"].push(currentData[j]);
            }else if ((response) && !(account)) {
                graphsInfo[keys[i]].counts["Responsible, no accountable"]++;
                graphsInfo[keys[i]].sortedData["Responsible, no accountable"].push(currentData[j]);
            }else if (!(response) && (account)) {
                graphsInfo[keys[i]].counts["Accountable, no responsible"]++;
                graphsInfo[keys[i]].sortedData["Accountable, no responsible"].push(currentData[j]);
            }else{
                graphsInfo[keys[i]].counts["Responsible and accountable"]++;
                graphsInfo[keys[i]].sortedData["Responsible and accountable"].push(currentData[j]);
            }

            
        }
    }

    let centered = {textAlign: "center"};
    
    let bothGraphsCSS = {width: "100%", overflow: "hidden"};
    let leftGraphCSS = {width: "600px", float: "left"};
    let rightGraphCSS = {marginLeft: "620px"};

    var ret = [];
    for (let i = 0; i < keys.length; i+=2) {
        //ret.push(<div style={bothGraphsCSS}>)

        let graphs = [];
        //graphs[0] is the left graph, graphs[1] is the right graph
        for (let j = 0; j < 2; j++) {
            if (filteredData[keys[i+j]].length === 0) {
                graphs[j] = <div style={centered}><h2>{keys[i+j]}</h2><p>No Factsheets</p></div>;
            }else{
                let graphData = graphFormat(graphsInfo[keys[i+j]].counts);
                //let options = buildPieChartOptions(title, types[i+j], filteredData[types[i+j]]);
                let options = pieChartOptions(keys[i+j], graphData, graphsInfo[keys[i+j]].sortedData)
                graphs[j] = <ReactHighCharts config={options} />;
            }
        }

        ret.push(
            <div key={uuid.v1()} style={bothGraphsCSS}>
                <div style={leftGraphCSS}>
                    {graphs[0]}
                </div>
                <div style={rightGraphCSS}>
                    {graphs[1]}
                </div>
            </div>
        );

    }

    var totalCount = 0;
    for (let i = 0; i < keys.length; i++) {
        totalCount += graphsInfo[keys[i]].counts["No responsible, no accountable"];
    }

    return [ret, totalCount];
}

function qualitySealGraphs(data) {
    let filteredData = {
        Domain: data.filter(fs => {return (fs.type === "BusinessCapability")}),
        "Use Case": data.filter(fs => {return (fs.type === "Process")}),
        Persona: data.filter(fs => {return (fs.type === "UserGroup")}),
        Epic: data.filter(fs => {return (fs.type === "Project")}),
        "Bounded Context": data.filter(fs => {return (fs.type === "Application")}),
        Behavior: data.filter(fs => {return (fs.type === "Interface")}),
        "Data Object": data.filter(fs => {return (fs.type === "DataObject")}),
        "IT Component": data.filter(fs => {return (fs.type === "ITComponent")}),
        Provider: data.filter(fs => {return (fs.type === "Provider")}),
        "Technical Stack": data.filter(fs => {return (fs.type === "TechnicalStack")})
    }


    let graphsInfo = {
        Domain: {},
        "Use Case": {},
        Persona: {},
        Epic: {},
        "Bounded Context": {},
        Behavior: {},
        "Data Object": {},
        "IT Component": {},
        Provider: {},
        "Technical Stack": {}
    }
    //let graphsInfo = [{}, {}, {}, {}, {}, {}, {}, {}, {} ,{}];

    var keys = Object.keys(graphsInfo);

    for (let i = 0; i < keys.length; i++) {
        graphsInfo[keys[i]].counts = {
            BROKEN: 0,
            DISABLED: 0,
            APPROVED: 0
        }
        graphsInfo[keys[i]].sortedData = {
            BROKEN: [],
            DISABLED: [],
            APPROVED: []
        }

        let currentData = filteredData[keys[i]];
        for (let j = 0; j < currentData.length; j++) {
            graphsInfo[keys[i]].counts[currentData[j]["qualitySeal"]]++;
            graphsInfo[keys[i]].sortedData[currentData[j]["qualitySeal"]].push(currentData[j]);
        }
    }

    let centered = {textAlign: "center"};
    
    let bothGraphsCSS = {width: "100%", overflow: "hidden"};
    let leftGraphCSS = {width: "600px", float: "left"};
    let rightGraphCSS = {marginLeft: "620px"};

    var ret = [];
    for (let i = 0; i < keys.length; i+=2) {
        //ret.push(<div style={bothGraphsCSS}>)

        let graphs = [];
        //graphs[0] is the left graph, graphs[1] is the right graph
        for (let j = 0; j < 2; j++) {
            if (filteredData[keys[i+j]].length === 0) {
                graphs[j] = <div style={centered}><h2>{keys[i+j]}</h2><p>No Factsheets</p></div>;
            }else{
                let graphData = graphFormat(graphsInfo[keys[i+j]].counts);
                //let options = buildPieChartOptions(title, types[i+j], filteredData[types[i+j]]);
                let options = pieChartOptions(keys[i+j], graphData, graphsInfo[keys[i+j]].sortedData)
                graphs[j] = <ReactHighCharts config={options} />;
            }
        }

        ret.push(
            <div key={uuid.v1()} style={bothGraphsCSS}>
                <div style={leftGraphCSS}>
                    {graphs[0]}
                </div>
                <div style={rightGraphCSS}>
                    {graphs[1]}
                </div>
            </div>
        );

    }

    var totalCount = 0;
    for (let i = 0; i < keys.length; i++) {
        totalCount += graphsInfo[keys[i]].counts["BROKEN"];
    }

    return [ret, totalCount];

}

function modelCompletionGraphs(data) {
    let filteredData = {
        Domain: data.filter(fs => {return (fs.type === "BusinessCapability")}),
        "Use Case": data.filter(fs => {return (fs.type === "Process")}),
        Persona: data.filter(fs => {return (fs.type === "UserGroup")}),
        Epic: data.filter(fs => {return (fs.type === "Project")}),
        "Bounded Context": data.filter(fs => {return (fs.type === "Application")}),
        Behavior: data.filter(fs => {return (fs.type === "Interface")}),
        "Data Object": data.filter(fs => {return (fs.type === "DataObject")}),
        "IT Component": data.filter(fs => {return (fs.type === "ITComponent")}),
        Provider: data.filter(fs => {return (fs.type === "Provider")}),
        "Technical Stack": data.filter(fs => {return (fs.type === "TechnicalStack")})
    }


    let graphsInfo = {
        Domain: {},
        "Use Case": {},
        Persona: {},
        Epic: {},
        "Bounded Context": {},
        Behavior: {},
        "Data Object": {},
        "IT Component": {},
        Provider: {},
        "Technical Stack": {}
    }
    //let graphsInfo = [{}, {}, {}, {}, {}, {}, {}, {}, {} ,{}];

    var keys = Object.keys(graphsInfo);

    for (let i = 0; i < keys.length; i++) {
        graphsInfo[keys[i]].counts = {
            backlog: 0,
            analysis: 0,
            review: 0,
            ready: 0,
            "no status": 0
        }
        graphsInfo[keys[i]].sortedData = {
            backlog: [],
            analysis: [],
            review: [],
            ready: [],
            "no status": []
        }

        let currentData = filteredData[keys[i]];
        let anyData = false;
        for (let j = 0; j < currentData.length; j++) {
            anyData = false;
            for (let k = 0; k < currentData[j]["tags"].length; k++){
                if (currentData[j]["tags"][k]["tagGroup"]["name"] === "State of Model Completeness"){
                    let key = currentData[j]["tags"][k]["name"];
                    graphsInfo[keys[i]].counts[key]++;
                    graphsInfo[keys[i]].sortedData[key].push(currentData[j]);
                    anyData = true;
                }
            }
            //if model completion status hasn't been found
            if (anyData === false){
                graphsInfo[keys[i]].counts["no status"]++;
                graphsInfo[keys[i]].sortedData["no status"].push(currentData[j]);
            }
        }
    }

    let centered = {textAlign: "center"};
    
    let bothGraphsCSS = {width: "100%", overflow: "hidden"};
    let leftGraphCSS = {width: "600px", float: "left"};
    let rightGraphCSS = {marginLeft: "620px"};

    var ret = [];
    for (let i = 0; i < keys.length; i+=2) {
        //ret.push(<div style={bothGraphsCSS}>)

        let graphs = [];
        //graphs[0] is the left graph, graphs[1] is the right graph
        for (let j = 0; j < 2; j++) {
            if (filteredData[keys[i+j]].length === 0) {
                graphs[j] = <div style={centered}><h2>{keys[i+j]}</h2><p>No Factsheets</p></div>;
            }else{
                let graphData = graphFormat(graphsInfo[keys[i+j]].counts);
                //let options = buildPieChartOptions(title, types[i+j], filteredData[types[i+j]]);
                let options = pieChartOptions(keys[i+j], graphData, graphsInfo[keys[i+j]].sortedData)
                graphs[j] = <ReactHighCharts config={options} />;
            }
        }

        ret.push(
            <div key={uuid.v1()} style={bothGraphsCSS}>
                <div style={leftGraphCSS}>
                    {graphs[0]}
                </div>
                <div style={rightGraphCSS}>
                    {graphs[1]}
                </div>
            </div>
        );

    }

    var totalCount = 0;
    for (let i = 0; i < keys.length; i++) {
        totalCount += (graphsInfo[keys[i]].counts["backlog"] + graphsInfo[keys[i]].counts["review"] + graphsInfo[keys[i]].counts["analysis"]
            + graphsInfo[keys[i]].counts["no status"]);
    }

    return [ret, totalCount];
}

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
    return [<ReactHighCharts config={options} />, counts["No lifecycle"]];
    
}

function documentsGraph(data) {
    let counts = {
        "No documents": 0,
        "Has documents": 0
    }
    let sortedData = {
        "No documents": [],
        "Has documents": []
    }
    for (let i = 0; i < data.length; i++){
        if (data[i]["documents"]["totalCount"] === 0){
            counts["No documents"]++;
            sortedData["No documents"].push(data[i]);
          }else{
            counts["Has documents"]++;
            sortedData["Has documents"].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions("Documents", graphData, sortedData);
    return [<ReactHighCharts config={options} />, sortedData["No documents"].length];
    
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

function technicalFitGraph(data) {
    let counts = {
        "No Technical Fit": 0,
        "No Technical Fit Description": 0,
        "No Technical Fit and No Description": 0,
        "Has Technical Fit and Description": 0
    }
    let sortedData = {
        "No Technical Fit": [],
        "No Technical Fit Description": [],
        "No Technical Fit and No Description": [],
        "Has Technical Fit and Description": []
    }
    for (let i = 0; i < data.length; i++){
        if ((data[i]["technicalSuitability"] === null) && (data[i]["technicalSuitabilityDescription"] === null || data[i]["technicalSuitabilityDescription"] === "")){
            counts["No Technical Fit and No Description"]++;
            sortedData["No Technical Fit and No Description"].push(data[i]);
          }else if ((data[i]["technicalSuitability"] === null) && !(data[i]["technicalSuitabilityDescription"] === null || data[i]["technicalSuitabilityDescription"] === "")){
            counts["No Technical Fit"]++;
            sortedData["Technical Fit"].push(data[i]);
          }else if (!(data[i]["technicalSuitability"] === null) && (data[i]["technicalSuitabilityDescription"] === null || data[i]["technicalSuitabilityDescription"] === "")){
            counts["No Technical Fit Description"]++;
            sortedData["No Technical Fit Description"].push(data[i]);
          }else{
            counts["Has Technical Fit and Description"]++;
            sortedData["Has Technical Fit and Description"].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions("Technical Fit", graphData, sortedData);
    return [<ReactHighCharts config={options} />, (counts["No Technical Fit and No Description"] + counts["No Technical Fit"] + counts["No Technical Fit Description"])];
}

function relationGraph(data, relation) {
    let leanixToEbsco = {'BusinessCapability': 'Domain', 'Process': 'Use Case', 'UserGroup': 'Persona',
    'Project': 'Epic', 'Application': 'Bounded Context', 'Interface': 'Behavior', 'DataObject': 'Data Object',
    'ITComponent': 'IT Component', 'Provider': 'Provider', 'TechnicalStack': 'Technical Stack', 
    'ProviderApplication': 'Provider Application'};
    //relation is expected to be one of the following
    /*"Application" to search for bounded contexts
    *"Process" to search for use cases
    *"BusinessCapability" to search for domains
    *"DataObject" to search for data objects
    *"Provider" to search for providers
    *"Interface" to seach for behaviors
    *"ProviderApplication" to search for providers when the type is Behavior/Interface
    *"ITComponent" to search for IT components
    */
    let searchKey = "";
    if (data.length > 0){
        searchKey = "rel" + data[0]["type"] + "To" + relation;
    }else{
        return <h2>No Results</h2>
    }

    let noConnection = "No " + leanixToEbsco[relation];
    let hasConnection = "Has " + leanixToEbsco[relation];

    let counts = {}
    counts[noConnection] = 0;
    counts[hasConnection] = 0;

    let sortedData = {};
    sortedData[noConnection] = [];
    sortedData[hasConnection] = [];

    for (let i = 0; i < data.length; i++){
        if (data[i][searchKey]["totalCount"] === 0){
            counts[noConnection]++;
            sortedData[noConnection].push(data[i]);
          }else{
            counts[hasConnection]++;
            sortedData[hasConnection].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions(leanixToEbsco[relation], graphData, sortedData);
    return [<ReactHighCharts config={options} />, counts[noConnection]];
    
}

function providedBehaviorsGraph(data) {
    //relation is expected to be one of the following
    /*"Application" to search for bounded contexts
    *"Process" to search for use cases
    *"BusinessCapability" to search for domains
    *"DataObject" to search for data objects
    *"Provider" to search for providers
    *"Interface" to seach for behaviors
    *"ProviderApplication" to search for providers when the type is Behavior/Interface
    *"ITComponent" to search for IT components
    */
    let searchKey = "";
    if (data.length > 0){
        searchKey = "relProvider" + data[0]["type"] + "ToInterface";
    }else{
        return <h2>No Results</h2>
    }

    let noConnection = "No Provided Behaviors";
    let hasConnection = "Has Provided Behavior";

    let counts = {}
    counts[noConnection] = 0;
    counts[hasConnection] = 0;

    let sortedData = {};
    sortedData[noConnection] = [];
    sortedData[hasConnection] = [];

    for (let i = 0; i < data.length; i++){
        if (data[i][searchKey]["totalCount"] === 0){
            counts[noConnection]++;
            sortedData[noConnection].push(data[i]);
          }else{
            counts[hasConnection]++;
            sortedData[hasConnection].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions("Provided Behaviors", graphData, sortedData);
    return [<ReactHighCharts config={options} />, counts[noConnection]];
    
}

function softwareITComponentGraph(data) {
    let searchKey = "";
    if (data.length > 0){
        searchKey = "rel" + data[0]["type"] + "ToITComponent";
    }else{
        return <h2>No Results</h2>
    }

    let noConnection = 'No "Software" IT Components';
    let hasConnection = 'Has "Software" IT Components';

    let counts = {}
    counts[noConnection] = 0;
    counts[hasConnection] = 0;

    let sortedData = {};
    sortedData[noConnection] = [];
    sortedData[hasConnection] = [];

    let found = false;

    for (let i = 0; i < data.length; i++){
        found = false;
        for (let j = 0; j < data[i][searchKey]["edges"].length; j++){
            if (data[i][searchKey]["edges"][j]["node"]["factSheet"]["category"] === "software") {
                found = true;
              }
        }
        if (found){
            counts[hasConnection]++;
            sortedData[hasConnection].push(data[i]);
          }else{
            counts[noConnection]++;
            sortedData[noConnection].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions('"Software" IT Components', graphData, sortedData);
    return [<ReactHighCharts config={options} />, counts[noConnection]];
    
}

function ownerPersonaGraph(data) {
    let counts = {
        'No "Owner" Persona': 0,
        'One "Owner" Persona': 0,
        'Multiple "Owner" Persona': 0
    }
    let sortedData = {
        'No "Owner" Persona': [],
        'One "Owner" Persona': [],
        'Multiple "Owner" Persona': []
    }

    var ownerCount = 0;

    for (let i = 0; i < data.length; i++){
        ownerCount = 0;
        for (let j = 0; j < data[i]["rel" + data[i]["type"] + "ToUserGroup"]["edges"].length; j++) {
            if (data[i]["rel" + data[i]["type"] + "ToUserGroup"]["edges"][j]["node"]["usageType"] === "owner"){
                ownerCount++;
              }
        }

        if (ownerCount === 0) {
            counts['No "Owner" Persona']++;
            sortedData['No "Owner" Persona'].push(data[i]);
        }else if (ownerCount === 1) {
            counts['One "Owner" Persona']++;
            sortedData['One "Owner" Persona'].push(data[i]);
        }else{
            counts['Multiple "Owner" Persona']++;
            sortedData['Multiple "Owner" Persona'].push(data[i]);
        }
        
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions('"Owner" Persona', graphData, sortedData);
    return [<ReactHighCharts config={options} />, sortedData['No "Owner" Persona'].length];
}

function EISownerPersonaGraph(data) {
    let counts = {
        'No "Owner" Persona': 0,
        'One "Owner" Persona': 0,
        'Multiple "Owner" Persona': 0
    }
    let sortedData = {
        'No "Owner" Persona': [],
        'One "Owner" Persona': [],
        'Multiple "Owner" Persona': []
    }

    var ownerCount = 0;
    var EISProvider = false;
    var searchKey = "";

    for (let i = 0; i < data.length; i++){
        searchKey = "rel" + data[i]["type"] + "ToProvider";
        ownerCount = 0;
        EISProvider = false;
        for (let j = 0; j < data[i]["rel" + data[i]["type"] + "ToUserGroup"]["edges"].length; j++) {
            if (data[i]["rel" + data[i]["type"] + "ToUserGroup"]["edges"][j]["node"]["usageType"] === "owner"){
                ownerCount++;
              }
        }

        
        for (let j = 0; j < data[i][searchKey]["edges"].length; j++) {
            if (data[i][searchKey]["edges"][j]["node"]["factSheet"]["displayName"] === "EIS"){
                EISProvider = true;
            }
        }

        if (EISProvider) {
            if (ownerCount === 0) {
                counts['No "Owner" Persona']++;
                sortedData['No "Owner" Persona'].push(data[i]);
            }else if (ownerCount === 1) {
                counts['One "Owner" Persona']++;
                sortedData['One "Owner" Persona'].push(data[i]);
            }else{
                counts['Multiple "Owner" Persona']++;
                sortedData['Multiple "Owner" Persona'].push(data[i]);
            }
        }
        
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions('"Owner" Persona When Provider is EIS', graphData, sortedData);
    return [<ReactHighCharts config={options} />, sortedData['No "Owner" Persona'].length];

}

function boundedContextBehaviorGraph(data) {
    let searchKey1 = "";
    let searchKey2 = "";
    if (data.length > 0){
        searchKey1 = "rel" + data[0]["type"] + "ToApplication";
        searchKey2 = "rel" + data[0]["type"] + "ToInterface";
    }else{
        return <h2>No Results</h2>
    }

    let counts = {
        "No Bounded Context": 0,
        "No Behavior": 0,
        "No Bounded Context and No Behavior": 0,
        "Has Bounded Context and Behavior": 0
    }
    let sortedData = {
        "No Bounded Context": [],
        "No Behavior": [],
        "No Bounded Context and No Behavior": [],
        "Has Bounded Context and Behavior": []
    }
    for (let i = 0; i < data.length; i++){
        if ((data[i][searchKey1]["totalCount"] === 0) && (data[i][searchKey2]["totalCount"] === 0)){
            counts["No Bounded Context and No Behavior"]++;
            sortedData["No Bounded Context and No Behavior"].push(data[i]);
          }else if ((data[i][searchKey1]["totalCount"] === 0) && !(data[i][searchKey2]["totalCount"] === 0)){
            counts["No Bounded Context"]++;
            sortedData["No Bounded Context"].push(data[i]);
          }else if (!(data[i][searchKey1]["totalCount"] === 0) && (data[i][searchKey2]["totalCount"] === 0)){
            counts["No Behavior"]++;
            sortedData["No Behavior"].push(data[i]);
          }else{
            counts["Has Bounded Context and Behavior"]++;
            sortedData["Has Bounded Context and Behavior"].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions("Bounded Context and Behavior", graphData, sortedData);
    return [<ReactHighCharts config={options} />, (counts["No Bounded Context and No Behavior"])];
}

function businessValueRiskGraph(data) {
    let counts = {
        "No Value": 0,
        "No Risk": 0,
        "No Value and No Risk": 0,
        "Has Value and Risk": 0
    }
    let sortedData = {
        "No Value": [],
        "No Risk": [],
        "No Value and No Risk": [],
        "Has Value and Risk": []
    }
    for (let i = 0; i < data.length; i++){
        if ((data[i]["businessValue"] === null) && (data[i]["projectRisk"] === null)){
            counts["No Value and No Risk"]++;
            sortedData["No Value and No Risk"].push(data[i]);
          }else if ((data[i]["businessValue"] === null) && !(data[i]["projectRisk"] === null)){
            counts["No Value"]++;
            sortedData["No Value"].push(data[i]);
          }else if (!(data[i]["businessValue"] === null) && (data[i]["projectRisk"] === null)){
            counts["No Risk"]++;
            sortedData["No Risk"].push(data[i]);
          }else{
            counts["Has Value and Risk"]++;
            sortedData["Has Value and Risk"].push(data[i]);
          }
    }

    let graphData = graphFormat(counts);
    let options = pieChartOptions("Business Value and Risk", graphData, sortedData);
    return [<ReactHighCharts config={options} />, (counts["No Value and No Risk"])];
}

function createHistogram(data, fsType, threshold) {
    var x = ["< 10%", "10% - 20%", "20% - 30%", "30% - 40%", "40% - 50%", "50% - 60%", "60% - 70%", "70% - 80%", "80% - 90%", "90% - 100%", "Complete"];
    var y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var filteredData = [[], [], [], [], [], [], [], [], [], [], []];

    for (let i = 0; i < data.length; i++) {
        if (data[i].completion.completion < .10) {
            filteredData[0].push(data[i]);
            y[0] = y[0] + 1;
        } else if (data[i].completion.completion < .20) {
            filteredData[1].push(data[i]);
            y[1] = y[1] + 1;
        } else if (data[i].completion.completion < .30) {
            filteredData[2].push(data[i]);
            y[2] = y[2] + 1;
        } else if (data[i].completion.completion < .40) {
            filteredData[3].push(data[i]);
            y[3] = y[3] + 1;
        } else if (data[i].completion.completion < .50) {
            filteredData[4].push(data[i]);
            y[4] = y[4] + 1;
        } else if (data[i].completion.completion < .60) {
            filteredData[5].push(data[i]);
            y[5] = y[5] + 1;
        } else if (data[i].completion.completion < .70) {
            filteredData[6].push(data[i]);
            y[6] = y[6] + 1;
        } else if (data[i].completion.completion < .80) {
            filteredData[7].push(data[i]);
            y[7] = y[7] + 1;
        } else if (data[i].completion.completion < .90) {
            filteredData[8].push(data[i]);
            y[8] = y[8] + 1;
        } else if (data[i].completion.completion < 1) {
            filteredData[9].push(data[i]);
            y[9] = y[9] + 1;
        } else {
            filteredData[10].push(data[i]);
            y[10] = y[10] + 1;
        }
    }

    var colorsChoice = genColorChoices(threshold);
    var options = buildHistogramOptions(fsType, colorsChoice, x, y, data);

    var filter = data.filter(fs => (fs["completion"]["completion"] < (threshold * .01)));
    var count = filter.length;

    return [<ReactHighCharts config={options} />, count];
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
    accountableResponsibleGraphs: accountableResponsibleGraphs,
    qualitySealGraphs: qualitySealGraphs,
    modelCompletionGraphs: modelCompletionGraphs,
    lifecycleGraph: lifecycleGraph,
    documentsGraph: documentsGraph,
    businessCriticalityGraph: businessCriticalityGraph,
    functionalFitGraph: functionalFitGraph,
    technicalFitGraph: technicalFitGraph,
    relationGraph: relationGraph,
    providedBehaviorsGraph: providedBehaviorsGraph,
    softwareITComponentGraph: softwareITComponentGraph,
    ownerPersonaGraph: ownerPersonaGraph,
    EISownerPersonaGraph: EISownerPersonaGraph,
    boundedContextBehaviorGraph: boundedContextBehaviorGraph,
    businessValueRiskGraph: businessValueRiskGraph,
    createHistogram: createHistogram

}