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
  // EBSCOs bounded context == LeanIXs Application
  var searchKey = "rel" + fs["type"] + "ToApplication";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }

}

function lackingUseCases(fs) {
  // EBSCOs Uses Cases == LeanIXs Processes
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
  // EBSCOs domain == LeanIXs business capability
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
    if (fs["rel" + fs["type"] + "ToUserGroup"]["edges"][i]["node"]["usageType"] === "owner") {
      return false;
    }
  }
  return true;
}

function multipleOwnerPersona(fs) {
  var count = 0;
  for (let i = 0; i < fs["rel" + fs["type"] + "ToUserGroup"]["edges"].length; i++){
    if (fs["rel" + fs["type"] + "ToUserGroup"]["edges"][i]["node"]["usageType"] === "owner") {
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
  // EBSCOS Data Objects == LeanIXs DataObject
  var searchKey = "rel" + fs["type"] + "ToDataObject";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }

}

function lackingProvidedBehaviors(fs) {
  // EBSCOs Behaviors == LeanIXs Interface
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
  if (fs["technicalSuitability"] == null) {
    return true;
  }else{
    return false;
  }
}

function noTechnicalFitDesc(fs) {
  if (fs["technicalSuitabilityDescription"] == null || fs["technicalSuitabilityDescription"] === ""){
    return true;
  }else{
    return false;
  }
}

function lackingSoftwareITComponent(fs) {
  // EBSCOs IT Component == LeanIXs ITComponent
  var searchKey = "rel" + fs["type"] + "ToITComponent";
  for (let i = 0; i < fs[searchKey]["edges"].length; i++){
    if (fs[searchKey]["edges"][i]["node"]["factSheet"]["category"] === "software") {
      return false;
    }
  }
  return true;
}
//=========

function lackingProviderApplication(fs) {
  // EBSCOs Provider == LeanIXs Provider
  var searchKey = "rel" + fs["type"] + "ToProviderApplication";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }
}

function lackingITComponents(fs) {
  //EBSCOs IT Component == LeanIXs ITComponent
  var searchKey = "rel" + fs["type"] + "ToITComponent";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }
}

function EISProvider(fs) {
  var searchKey = "rel" + fs["type"] + "ToProvider";
  for (let i = 0; i < fs[searchKey]["edges"].length; i++) {
    if (fs[searchKey]["edges"][i]["node"]["factSheet"]["displayName"] === "EIS"){
      return true;
    }
  }
  return false;
}

function noLifecycle(fs) {
  if (fs["lifecycle"] == null || fs["lifecycle"]["phases"].length === 0){
    return true;
  }else{
    return false;
  }
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

  EISProvider: EISProvider,

  lackingProviderApplication: lackingProviderApplication,
  lackingITComponents: lackingITComponents,

  noLifecycle: noLifecycle,
};