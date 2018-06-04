import uuid from 'uuid';

function leafNodes(fs){
  if (fs["relToChild"]["totalCount"] === 0 && fs["relToParent"]["totalCount"] === 0){
    return true;
  }else{
    /*
    if (fs["type"] === "Project"){
      console.log("Project not leaf");
    }
    */
    return false;
  }
}

function noAccountable(fs){
  let temp = fs["subscriptions"]["edges"];
  for (let i = 0; i < temp.length; i++){
      if (temp[i]["node"]["type"] === "ACCOUNTABLE"){
      return false;
      }
  }
  return true;
}

function noResponsible(fs){
  let temp = fs["subscriptions"]["edges"];
  for (let i = 0; i < temp.length; i++){
      if (temp[i]["node"]["type"] === "RESPONSIBLE"){
      return false;
      }
  }
  return true;
}

function brokenSeal(fs){
  if (fs["qualitySeal"] === "BROKEN"){
    return true;
  }else{
    return false;
  }
}

function notReady(fs) {
  for (let i = 0; i < fs["tags"].length; i++) {
    if (fs["tags"][i]["tagGroup"]["name"] === "State of Model Completeness"){
      if (fs["tags"][i]["name"] !== "ready"){
        return true
      }else{
        return false;
      }
    }
  }
  return false;
}

function lackingBoundedContext(fs) {
  //EBSCOs bounded context == LeanIXs Application
  var searchKey = "rel" + fs["type"] + "ToApplication";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }

}

function lackingUseCases(fs) {
  //EBSCOs Uses Cases == LeanIXs Processes
  var searchKey = "rel" + fs["type"] + "ToProcess";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }

}
  
function getScoreLessThan(fs, num) {
  if (fs["completion"]["completion"] < num){
    return true;
  }else{
    return false;
  }
}

function lackingDomain(fs) {
  //EBSCOs domain == LeanIXs business capability
  var searchKey = "rel" + fs["type"] + "ToBusinessCapability";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }
}

function noDocumentLinks(fs) {
  if (fs["documents"]["totalCount"] === 0) {
    return true;
  }else{
    return false;
  }
}

function noBusinessValueRisk(fs) {
  if (fs["businessValue"] == null && fs["projectRisk"] == null){
    return true;
  }else{
    return false;
  }
}
//=====================
function noBusinessCritic(fs) {
  if (fs["businessCriticality"] == null) {
    return true;
  }else{
    return false;
  }
}

function noBusinessCriticDesc(fs) {
  if (fs["businessCriticalityDescription"] == null || fs["businessCriticalityDescription"] === ""){
    return true;
  }else{
    return false;
  }
}

function noFunctionFit(fs) {
  if (fs["functionalSuitability"] == null){
    return true;
  }else{
    return false;
  }
}

function noFunctionFitDesc(fs) {
  if (fs["functionalSuitabilityDescription"] == null || fs["functionalSuitabilityDescription"] === ""){
    return true;
  }else{
    return false;
  }
}

function noOwnerPersona(fs) {
  for (let i = 0; i < fs["rel" + fs["type"] + "ToUserGroup"]["edges"].length; i++){
    if (fs["rel" + fs["type"] + "ToUserGroup"]["edges"][i] === "owner") {
      return false;
    }
  }
  return true;
}

function multipleOwnerPersona(fs) {
  var count = 0;
  for (let i = 0; i < fs["rel" + fs["type"] + "ToUserGroup"]["edges"].length; i++){
    if (fs["rel" + fs["type"] + "ToUserGroup"]["edges"][i] === "owner") {
      count++;
    }
  }
  if (count > 1) {
    return true;
  }else{
    return false;
  }
}

function lackingDataObjects(fs) {
  //EBSCOS Data Objects == LeanIXs DataObject
  var searchKey = "rel" + fs["type"] + "ToDataObject";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }

}

function lackingProvidedBehaviors(fs) {
  //EBSCOs Behaviors == LeanIXs Interface
  var searchKey = "relProvider" + fs["type"] + "ToInterface";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }
}

function lackingProviders(fs) {
  // EBSCO Provider == LeanIX Provider
  var searchKey = "rel" + fs["type"] + "ToProvider";
  if (fs[searchKey]["totalCount"] === 0) {
    return true;
  } else {
    return false;
  }
}

function lackingBehaviors(fs) {
  // EBSCO Behavior == LeanIX Interface
  var searchKey = "rel" + fs["type"] + "ToInterface";
  if (fs[searchKey]["totalCount"] === 0) {
    return true;
  } else {
    return false;
  }
}

function noTechnicalFit(fs) {
  // TODO
}

function noTechnicalFitDesc(fs) {
  // TODO
}

function lackingSoftwareITComponent(fs) {
  //EBSCOs IT Component == LeanIXs ITComponent
  var searchKey = "rel" + fs["type"] + "ToITComponent";
  for (let i = 0; i < fs[searchKey]["edges"].length; i++){
    if (fs[searchKey]["edges"][i]["node"]["factSheet"]["category"] === "software") {
      return false;
    }
  }
  return true;
}
//=========


function lackingProvider(fs) {
  //EBSCOs Provider == LeanIXs Provider
  var searchKey = "rel" + fs["type"] + "ToProviderApplication";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }
}

function lackingITComponent(fs) {
  //EBSCOs IT Component == LeanIXs ITComponent
  var searchKey = "rel" + fs["type"] + "ToITComponent";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }
}




//======
function toHTML(total, addition){
  //https://us.leanix.net/EISEA/factsheet/ITComponent/c3fe9503-c9fc-415e-98ed-cc871e66c9c1
  return total + "<a href=https://us.leanix.net/EISEA/factsheet/" + addition["type"] + "/" + addition["id"] + ">" + addition["displayName"] + ": " + addition["id"] + "</a><br />";
}

function prepareForOutput(data){
  return data.reduce(toHTML, "");
}

function getOutput(title, subtitles, data){
  //console.log(uuid.v1());

  var html = "";
  var overallID = uuid.v1();
  var subID = uuid.v1();

  html += `
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class = "panel-title">
        <a data-toggle="collapse" data-parent="#accordianReport" href="#` + overallID + `">` + title + `</a>
      </h4>
    </div>

    <div id="` + overallID + `" class="panel-collapse collapse">
      <div class="panel-body">

        <!--sub accordians go here-->
        <div class="panel-group" id="` + subID + `">`;


        for (let i = 0; i < subtitles.length; i++){
          var innerID = uuid.v1();
          var insertData = this.prepareForOutput(data[i]);//data[i].reduce(toHTML, "");

          html += `<div class="panel panel-default">
          <div class="panel-heading">
              <h4 class="panel-title">
                  <a data-toggle="collapse" data-parent="#` + subID + `" href="#` + innerID + `">` + subtitles[i] + ` (` + data[i].length + `)</a>
              </h4>
          </div>
          <div id="` + innerID + `" class="panel-collapse collapse">
              <div class="panel-body">` + insertData + `</div>
          </div>
        </div>`


        }


        html += `</div>
              </div>
            </div>
          </div>`;

          //console.log(html);

          //console.log(html);

  return html;
}

export default {
  leafNodes: leafNodes,

  noAccountable: noAccountable,
  noResponsible: noResponsible,
  brokenSeal: brokenSeal,
  notReady: notReady,

  lackingBoundedContext: lackingBoundedContext,
  lackingUseCases: lackingUseCases,
  getScoreLessThan: getScoreLessThan,

  lackingDomain: lackingDomain,
  noDocumentLinks: noDocumentLinks,

  noBusinessValueRisk: noBusinessValueRisk,


  noBusinessCritic: noBusinessCritic,
  noBusinessCriticDesc: noBusinessCriticDesc,
  noFunctionFit: noFunctionFit,
  noFunctionFitDesc: noFunctionFitDesc,
  noOwnerPersona: noOwnerPersona,
  multipleOwnerPersona: multipleOwnerPersona,
  lackingDataObjects: lackingDataObjects,
  lackingProvidedBehaviors: lackingProvidedBehaviors,
  lackingProviders: lackingProviders,
  lackingBehaviors: lackingBehaviors,
  noTechnicalFit: noTechnicalFit,
  noTechnicalFitDesc: noTechnicalFitDesc,
  lackingSoftwareITComponent: lackingSoftwareITComponent,

  lackingProvider: lackingProvider,
  lackingITComponent: lackingITComponent,

  prepareForOutput: prepareForOutput,
  getOutput, getOutput
};