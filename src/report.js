import React from 'react';
import ReactDOM from 'react-dom';
import FilterTools from './FilterTools';
import Queries from './Queries';
import AccordianReport from './AccordianReport';

export class Report {

  constructor(setup) {
    this.setup = setup;
  }

  createConfig() {
    return {
      facets: [{
        key: 'main',
        attributes: [Queries.main],
        callback: function (data) {
          this.extraData = {};
          lx.executeGraphQL(Queries.useCaseExtraData).then((info) => {
            this.extraData["useCaseExtra"] = info["allFactSheets"]["edges"].map(fs => {return fs["node"];});
            lx.executeGraphQL(Queries.epicExtraData).then((info) => {
              this.extraData["epicExtra"] = info["allFactSheets"]["edges"].map(fs => {return fs["node"];});
              lx.executeGraphQL(Queries.boundedContextExtraData).then((info) => {
                this.extraData["boundedContextExtra"] = info["allFactSheets"]["edges"].map(fs => {return fs["node"];});
                lx.executeGraphQL(Queries.ITComponentExtraData).then((info) => {
                  this.extraData["ITComponentExtra"] = info["allFactSheets"]["edges"].map(fs => {return fs["node"];});

                  this.data = data;
                  this.groups = _.groupBy(data, 'type');
                  this.render();

                });
              });
            });
          });
        }.bind(this)
      }]
    };
  }

  render() {
    // Get only leaf nodes ie, no parents or children
    var leafNodes = this.data.filter(fs => FilterTools.leafNodes(fs));

    // All Fact Sheets
    var noAccountableAndResponsible = leafNodes.filter(fs => (FilterTools.noResponsible(fs) && FilterTools.noAccountable(fs)));
    var brokenSeal = leafNodes.filter(fs => (FilterTools.brokenSeal(fs)));
    var notReady = leafNodes.filter(fs => (FilterTools.notReady(fs)));

    var allFactSheetsData = {
      title: "All Fact Sheets",
      data: {
        "Lacking Accountable and Responsible": noAccountableAndResponsible,
        "Quality Seal is Broken": brokenSeal,
        "Model Completion Status is not 'Ready'": notReady
      }
    };

    // Domain == BusinessCapability
    var domains = leafNodes.filter(fs => {return (fs.type === "BusinessCapability")});

    var domainLackingBoundedContext = domains.filter(fs => (FilterTools.lackingBoundedContext(fs)));
    var domainLackingUseCases = domains.filter(fs => (FilterTools.lackingUseCases(fs)));
    var domainScore = domains.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

    var domainData = {
      title: "Domain",
      data: {
        "Lacking Bounded Context": domainLackingBoundedContext,
        "Lacking Use Cases": domainLackingUseCases,
        "Overall Score < 60%": domainScore
      }
    };

    // Use Cases == Process
    var useCases = leafNodes.filter(fs => {return (fs["type"] === "Process")});

    var useCaseLackingDomain = useCases.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
    var useCaseNoDocumentLinks = useCases.filter(fs => (FilterTools.noDocumentLinks(fs)));
    var useCaseNoLifecycle = this.extraData["useCaseExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => FilterTools.noLifecycle(fs));
    var useCaseLackingBoundedContext = useCases.filter(fs => (FilterTools.lackingBoundedContext(fs)));
    var useCaseScore = useCases.filter(fs => (FilterTools.getScoreLessThan(fs, .65)));

    var useCaseData = {
      title: "Use Case",
      data: {
        "Lacking Domain": useCaseLackingDomain,
        "No Document Links": useCaseNoDocumentLinks,
        "No Lifecycle": useCaseNoLifecycle,
        "Lacking Bounded Context": useCaseLackingBoundedContext,
        "Overall Score < 65%": useCaseScore
      }
    };
    
    // Persona == UserGroup
    var personas = leafNodes.filter(fs => {return (fs["type"] === "UserGroup")});
    
    var personaScore = personas.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

    var personaData = {
      title: "Persona",
      data: {
        "Overall Score < 50%": personaScore
      }
    };

    // Epic == Projects
    var epics = leafNodes.filter(fs => {return (fs["type"] === "Project")});

    var epicNoDocumentLinks = epics.filter(fs => (FilterTools.noDocumentLinks(fs)));
    var epicNoLifecycle = this.extraData["epicExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => FilterTools.noLifecycle(fs));
    var epicNoBusinessValueRisk = epics.filter(fs => (FilterTools.noBusinessValueRisk(fs)));
    var epicNoAffectedDomains = epics.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
    var epicNoAffectedUseCases = epics.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
    var epicScore = epics.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

    var epicData = {
      title: "Epic",
      data: {
        "No Document Links": epicNoDocumentLinks,
        "No Lifecycle": epicNoLifecycle,
        "No Business Value & Risk": epicNoBusinessValueRisk,
        "No Affected Domains": epicNoAffectedDomains,
        "No Affected Use Cases": epicNoAffectedUseCases,
        "Overall Score < 50%": epicScore
      }
    };

    // Bounded Context == Application
    var boundedContexts = leafNodes.filter(fs => {return (fs["type"] === "Application")});

    var boundedContextsNoLifecycle = this.extraData["boundedContextExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => FilterTools.noLifecycle(fs));
    var boundedContextsNoBusinessCritic = boundedContexts.filter(fs => (FilterTools.noBusinessCritic(fs) || FilterTools.noBusinessCriticDesc(fs)));
    var boundedContextsNoFunctionFit = boundedContexts.filter(fs => (FilterTools.noFunctionFit(fs) || FilterTools.noFunctionFitDesc(fs)));
    var boundedContextsLackingDomain = boundedContexts.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
    var boundedContextsLackingUseCases = boundedContexts.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
    var boundedContextsNoOwnerPersona = boundedContexts.filter(fs => (FilterTools.noOwnerPersona(fs)));
    var boundedContextsMultipleOwnerPersona = boundedContexts.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
    var boundedContextsLackingDataObjects = boundedContexts.filter(fs => (FilterTools.lackingRelation(fs, "DataObject")));
    var boundedContextsLackingProvidedBehaviors = boundedContexts.filter(fs => (FilterTools.lackingProvidedBehaviors(fs)));
    var boundedContextsNoTechnicalFit = this.extraData["boundedContextExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => FilterTools.noTechnicalFit(fs));
    var boundedContextsNoSoftwareITComponent = boundedContexts.filter(fs => (FilterTools.lackingSoftwareITComponent(fs)));
    var boundedContextsNoDocumentLinks = boundedContexts.filter(fs => (FilterTools.noDocumentLinks(fs)));
    var boundedContextsScore = boundedContexts.filter(fs => (FilterTools.getScoreLessThan(fs, .70)))

    var boundedContextData = {
      title: "Bounded Context",
      data: {
        "No Lifecycle": boundedContextsNoLifecycle,
        "Missing Business Criticality or Business Criticality without Description": boundedContextsNoBusinessCritic,
        "Missing Functional Fit or Functional Fit without a Description": boundedContextsNoFunctionFit,
        "No Domain": boundedContextsLackingDomain,
        "No Use Cases": boundedContextsLackingUseCases,
        "No Persona with Usage Type 'Owner'": boundedContextsNoOwnerPersona,
        "Multiple Persona with Usage Type 'Owner'": boundedContextsMultipleOwnerPersona,
        "No Data Objects": boundedContextsLackingDataObjects,
        "No Provided Behaviors": boundedContextsLackingProvidedBehaviors,
        "No Technical Fit": boundedContextsNoTechnicalFit,
        "No IT Component of Type 'Software'": boundedContextsNoSoftwareITComponent,
        "No Document Links": boundedContextsNoDocumentLinks,
        "Overall Score < 70%": boundedContextsScore
      }
    };

    // Behavior == Interface
    var behaviors = leafNodes.filter(fs => {return (fs["type"] === "Interface")});

    var behaviorsLackingProvider = behaviors.filter(fs => (FilterTools.lackingProviderApplication(fs)));
    var behaviorsLackingITComponent = behaviors.filter(fs => (FilterTools.lackingITComponents(fs)));
    var behaviorsScore = behaviors.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

    var behaviorData = {
      title: "Behavior",
      data: {
        "No Provider": behaviorsLackingProvider,
        "No IT Components": behaviorsLackingITComponent,
        "Overall Score < 60%": behaviorsScore
      }
    };

    // Data Object == DataObject
    var dataObjects = leafNodes.filter(fs => {return (fs["type"] === "DataObject")});

    var dataObjectsNoBoundedContextOrBehavor = dataObjects.filter(fs => (FilterTools.lackingBehaviors(fs) || FilterTools.lackingBoundedContext(fs)));
    var dataObjectsScore = dataObjects.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

    var dataObjectData = {
      title: "Data Object",
      data: {
        "No Bounded Context or Behavior": dataObjectsNoBoundedContextOrBehavor,
        "Overall Score < 50%": dataObjectsScore
      }
    }

    // IT Component
    var itComponents = leafNodes.filter(fs => {return (fs["type"] === "ITComponent")});

    var itComponentsMissingProvider = itComponents.filter(fs => (FilterTools.lackingProviders(fs)));
    var itComponentsNoDocumentLinks = itComponents.filter(fs => (FilterTools.noDocumentLinks(fs)));
    var itComponentsNoLifecycle = this.extraData["ITComponentExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => FilterTools.noLifecycle(fs));
    var itComponentsNoTechnicalFit = this.extraData["ITComponentExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => (FilterTools.noTechnicalFit(fs) || FilterTools.noTechnicalFitDesc(fs)));
    var itComponentsMissingBehaviors = itComponents.filter(fs => (FilterTools.lackingBehaviors(fs)));
    var itComponentsNoOwnerPersona = itComponents.filter(fs => (FilterTools.noOwnerPersona(fs) && FilterTools.EISProvider(fs)));
    var itComponentsMultipleOwnerPersona = itComponents.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
    var itComponentsScore = itComponents.filter(fs => (FilterTools.getScoreLessThan(fs, .70)));

    var itComponentData = {
      title: "IT Component",
      data: {
        "Missing Provider": itComponentsMissingProvider,
        "No Document Links": itComponentsNoDocumentLinks,
        "No Lifecycle": itComponentsNoLifecycle,
        "Missing Technical Fit or Technical Fit Description": itComponentsNoTechnicalFit,
        "Missing Behaviors": itComponentsMissingBehaviors,
        "Missing Persona of Type Owner (when provider is EIS)": itComponentsNoOwnerPersona,
        "Multiple Persona of Type Owner": itComponentsMultipleOwnerPersona,
        "Overall Score < 70%": itComponentsScore
      }
    };
                
    ReactDOM.render(<AccordianReport data={[allFactSheetsData, domainData, useCaseData, personaData, epicData,
      boundedContextData, behaviorData, dataObjectData, itComponentData]} />,
      document.getElementById("report"));
  }
}
