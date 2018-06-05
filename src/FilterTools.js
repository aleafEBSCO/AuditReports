import uuid from 'uuid';

function leafNodes(fs){
  if (fs["relToChild"]["totalCount"] === 0 && fs["relToParent"]["totalCount"] === 0){
    return true;
  }else{
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

//=================================================

function lackingRelation(fs, relation) {
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
  var searchKey = "rel" + fs["type"] + "To" + relation;
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }

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

function lackingProvidedBehaviors(fs) {
  //EBSCOs Behaviors == LeanIXs Interface
  //use this function when type is BoundedContext/Application
  var searchKey = "relProvider" + fs["type"] + "ToInterface";
  if (fs[searchKey]["totalCount"] === 0){
    return true;
  }else{
    return false;
  }
}
 
//=========================================

function getScoreLessThan(fs, num) {
  if (fs["completion"]["completion"] < num){
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

//===============================================

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

  lackingRelation: lackingRelation,
  lackingProvidedBehaviors: lackingProvidedBehaviors,
  lackingSoftwareITComponent: lackingSoftwareITComponent,

  getScoreLessThan: getScoreLessThan,
  noDocumentLinks: noDocumentLinks,

  noBusinessValueRisk: noBusinessValueRisk,
  noBusinessCritic: noBusinessCritic,
  noBusinessCriticDesc: noBusinessCriticDesc,
  noFunctionFit: noFunctionFit,
  noFunctionFitDesc: noFunctionFitDesc,
  noTechnicalFit: noTechnicalFit,
  noTechnicalFitDesc: noTechnicalFitDesc,
  
  noOwnerPersona: noOwnerPersona,
  multipleOwnerPersona: multipleOwnerPersona,

  EISProvider: EISProvider,

  noLifecycle: noLifecycle
};