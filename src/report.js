import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';

import FilterTools from './FilterTools';
import Queries from './Queries';
import Utilities from './Utilities';

import AccordianReport from './AccordianReport';
import ReportGroup from './ReportGroup';

export class Report {

  constructor(setup) {
    this.setup = setup;
    this._createConfig();
  }

  _createConfigOld() {
    this.config = {
      // TODO: Use lx.executeGraphQL to get all data. This way the top bar with
      // default filters will be gone and relevant filters can be implemented
      // nicely the exact way we want using custom dropdowns.
      facets: [{
        key: 'main',
        attributes: [Queries.main],
        callback: function (data) {
          this.extraData = {};
          lx.executeGraphQL(Queries.useCaseExtraData).then((info) => {
            this.extraData["useCaseExtra"] = info["allFactSheets"]["edges"].map(fs => fs["node"]);
            lx.executeGraphQL(Queries.epicExtraData).then((info) => {
              this.extraData["epicExtra"] = info["allFactSheets"]["edges"].map(fs => fs["node"]);
              lx.executeGraphQL(Queries.boundedContextExtraData).then((info) => {
                this.extraData["boundedContextExtra"] = info["allFactSheets"]["edges"].map(fs => fs["node"]);
                lx.executeGraphQL(Queries.ITComponentExtraData).then((info) => {
                  this.extraData["ITComponentExtra"] = info["allFactSheets"]["edges"].map(fs => fs["node"]);
                  this.data = data;
                  this._handleData();
                });
              });
            });
          });
        }.bind(this)
      }]
    };
  }

  _createConfig() {
    this.factSheetTypes = [{type: 'All'}];
    this.factSheetTypes = this.factSheetTypes.concat(Utilities.getFactsheetTypesObjects(this.setup.settings.dataModel.factSheets));

    const dropdownEntries = [];

    this.factSheetTypes.forEach(((value) => {
      const key = value.type;
      // No audit data for Provider and TechnicalStack
      if (key !== 'Provider' && key !== 'TechnicalStack') {
        dropdownEntries.push({
          id: key,
          name: Utilities.leanIXToEbscoTypes(key),
          callback: ((currentEntry) => {
            this._update(currentEntry.id);
          }).bind(this)
        });
      }
    }).bind(this));

    this.config = {
      allowEditing: false
    };

    if (dropdownEntries.length !== 0) {
      this.config.menuActions = {
        customDropdowns: [{
          id: 'FACTSHEET_TYPE_DROPDOWN',
          name: 'Fact Sheet Type',
          entries: dropdownEntries
        }]
      };
    }
  }

	init() {
		if (_.size(this.factSheetTypes) > 0) {
			// init the report with the first factsheet type
			this._update(this.factSheetTypes[0].type);
		} else {
			console.log('No fact sheet types');
		}
	}

	_update(factSheetType) {
		if (this.currentFactSheetType === factSheetType) {
			// nothing to do
			return;
    }
    // Make relevant queries
		lx.executeGraphQL(Queries.getQuery(factSheetType)).then(((data) => {
      // Check if type has extra data to get
      if (Queries.getExtraQuery(factSheetType)) {
        lx.executeGraphQL(Queries.getExtraQuery(factSheetType)).then((extraData) => {
          this.currentExtraData = extraData.allFactSheets.edges.map(fs => fs.node).filter(node => FilterTools.leafNodes(node));
          this._updateData(factSheetType, data);
        });
      } else {
        this._updateData(factSheetType, data);
      }
    }).bind(this));
  }

  _updateData(factSheetType, data) {
    this.currentFactSheetType = factSheetType;
    this.currentData = data.allFactSheets.edges.map(fs => fs.node);
    this._updateReport();
  }

  _updateReport() {
    // Get only leaf nodes ie, no parents or children
    // NOTE: leafNodes will only be of this.currentFactSheetType due to separation of queries
    let leafNodes = this.currentData.filter(fs => FilterTools.leafNodes(fs));
    let reportData = {
      title: '',
      data: {}
    };

    if (leafNodes) {
      switch (this.currentFactSheetType) {
        case 'All':
          // All Fact Sheets
          let noAccountableAndResponsible = leafNodes.filter(fs => (FilterTools.noResponsible(fs)
          && FilterTools.noAccountable(fs)));
          let brokenSeal = leafNodes.filter(fs => (FilterTools.brokenSeal(fs)));
          let notReady = leafNodes.filter(fs => (FilterTools.notReady(fs)));

          reportData = {
            title: "All Fact Sheets",
            data: {
              "Lacking Accountable and Responsible": noAccountableAndResponsible,
              "Quality Seal is Broken": brokenSeal,
              "Model Completion Status is not 'Ready'": notReady
            }
          };
          break;
        
        case 'Application':
          // Bounded Context
          // TODO: Remove redundant fact sheet type definitions
          let boundedContexts = leafNodes.filter(fs => {return (fs["type"] === "Application")});

          if (boundedContexts) {
            let boundedContextsNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
            let boundedContextsNoBusinessCritic = boundedContexts.filter(fs => (FilterTools.noBusinessCritic(fs)
            || FilterTools.noBusinessCriticDesc(fs)));
            let boundedContextsNoFunctionFit = boundedContexts.filter(fs => (FilterTools.noFunctionFit(fs)
            || FilterTools.noFunctionFitDesc(fs)));
            let boundedContextsLackingDomain = boundedContexts.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
            let boundedContextsLackingUseCases = boundedContexts.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
            let boundedContextsNoOwnerPersona = boundedContexts.filter(fs => (FilterTools.noOwnerPersona(fs)));
            let boundedContextsMultipleOwnerPersona = boundedContexts.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
            let boundedContextsLackingDataObjects = boundedContexts.filter(fs => (FilterTools.lackingRelation(fs, "DataObject")));
            let boundedContextsLackingProvidedBehaviors = boundedContexts.filter(fs => (FilterTools.lackingProvidedBehaviors(fs)));
            let boundedContextsNoTechnicalFit = this.currentExtraData.filter(fs => FilterTools.noTechnicalFit(fs));
            let boundedContextsNoSoftwareITComponent = boundedContexts.filter(fs => (FilterTools.lackingSoftwareITComponent(fs)));
            let boundedContextsNoDocumentLinks = boundedContexts.filter(fs => (FilterTools.noDocumentLinks(fs)));
            let boundedContextsScore = boundedContexts.filter(fs => (FilterTools.getScoreLessThan(fs, .70)))

            reportData = {
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
          }
          break;
        
        case 'BusinessCapability':
          // Domain
          let domains = leafNodes.filter(fs => {return (fs.type === "BusinessCapability")});

          if (domains) {
            let domainLackingBoundedContext = domains.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
            let domainLackingUseCases = domains.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
            let domainScore = domains.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

            reportData = {
              title: "Domain",
              data: {
                "Lacking Bounded Context": domainLackingBoundedContext,
                "Lacking Use Cases": domainLackingUseCases,
                "Overall Score < 60%": domainScore
              }
            };
          }
          break;

        case 'DataObject':
          // Data Object
          var dataObjects = leafNodes.filter(fs => {return (fs["type"] === "DataObject")});

          if (dataObjects) {
            var dataObjectsNoBoundedContextOrBehavor = dataObjects.filter(fs => (FilterTools.lackingRelation(fs, "Interface")
            && FilterTools.lackingRelation(fs, "Application")));
            var dataObjectsScore = dataObjects.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

            reportData = {
              title: "Data Object",
              data: {
                "No Bounded Context or Behavior": dataObjectsNoBoundedContextOrBehavor,
                "Overall Score < 50%": dataObjectsScore
              }
            };
          }
          break;
        
        case 'ITComponent':
          // IT Component
          var itComponents = leafNodes.filter(fs => {return (fs["type"] === "ITComponent")});

          if (itComponents) {
            var itComponentsMissingProvider = itComponents.filter(fs => (FilterTools.lackingRelation(fs, "Provider")));
            var itComponentsNoDocumentLinks = itComponents.filter(fs => (FilterTools.noDocumentLinks(fs)));
            var itComponentsNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
            var itComponentsNoTechnicalFit = this.currentExtraData.filter(fs => (FilterTools.noTechnicalFit(fs) || FilterTools.noTechnicalFitDesc(fs)));
            var itComponentsMissingBehaviors = itComponents.filter(fs => (FilterTools.lackingRelation(fs, "Interface")));
            var itComponentsNoOwnerPersona = itComponents.filter(fs => (FilterTools.noOwnerPersona(fs) && FilterTools.EISProvider(fs)));
            var itComponentsMultipleOwnerPersona = itComponents.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
            var itComponentsScore = itComponents.filter(fs => (FilterTools.getScoreLessThan(fs, .70)));

            reportData = {
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
          }
          break;

        case 'Interface':
          // Behavior
          var behaviors = leafNodes.filter(fs => {return (fs["type"] === "Interface")});

          if (behaviors) {
            var behaviorsLackingProvider = behaviors.filter(fs => (FilterTools.lackingRelation(fs, "ProviderApplication")));
            var behaviorsLackingITComponent = behaviors.filter(fs => (FilterTools.lackingRelation(fs, "ITComponent")));
            var behaviorsScore = behaviors.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));
      
            reportData = {
              title: "Behavior",
              data: {
                "No Provider": behaviorsLackingProvider,
                "No IT Components": behaviorsLackingITComponent,
                "Overall Score < 60%": behaviorsScore
              }
            };
          }
          break;

        case 'Process':
          // Use Case
          var useCases = leafNodes.filter(fs => {return (fs["type"] === "Process")});

          if (useCases) {
            var useCaseLackingDomain = useCases.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
            var useCaseNoDocumentLinks = useCases.filter(fs => (FilterTools.noDocumentLinks(fs)));
            var useCaseNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
            var useCaseLackingBoundedContext = useCases.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
            var useCaseScore = useCases.filter(fs => (FilterTools.getScoreLessThan(fs, .65)));
      
            reportData = {
              title: "Use Case",
              data: {
                "Lacking Domain": useCaseLackingDomain,
                "No Document Links": useCaseNoDocumentLinks,
                "No Lifecycle": useCaseNoLifecycle,
                "Lacking Bounded Context": useCaseLackingBoundedContext,
                "Overall Score < 65%": useCaseScore
              }
            };
          }
          break;

        case 'Project':
          // Epic
          var epics = leafNodes.filter(fs => {return (fs["type"] === "Project")});

          if (epics) {
            var epicNoDocumentLinks = epics.filter(fs => (FilterTools.noDocumentLinks(fs)));
            var epicNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
            var epicNoBusinessValueRisk = epics.filter(fs => (FilterTools.noBusinessValueRisk(fs)));
            var epicNoAffectedDomains = epics.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
            var epicNoAffectedUseCases = epics.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
            var epicScore = epics.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));
      
            reportData = {
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
          }
          break;

        case 'UserGroup':
          // Persona
          var personas = leafNodes.filter(fs => {return (fs["type"] === "UserGroup")});
      
          if (personas) {
            var personaScore = personas.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));
      
            reportData = {
              title: "Persona",
              data: {
                "Overall Score < 50%": personaScore
              }
            };
          }
          break;
      }
    }
    ReactDOM.render(<ReportGroup title={reportData.title} data={reportData.data} overallID={uuid.v1()} typeData={this.currentData} />, document.getElementById('report'));
  }

  _handleData() {
    this.reportData = [];

    // Get only leaf nodes ie, no parents or children
    this.leafNodes = this.data.filter(fs => FilterTools.leafNodes(fs));

    // All Fact Sheets
    var noAccountableAndResponsible = this.leafNodes.filter(fs => (FilterTools.noResponsible(fs)
    && FilterTools.noAccountable(fs)));
    var brokenSeal = this.leafNodes.filter(fs => (FilterTools.brokenSeal(fs)));
    var notReady = this.leafNodes.filter(fs => (FilterTools.notReady(fs)));

    this.reportData.push({
      title: "All Fact Sheets",
      data: {
        "Lacking Accountable and Responsible": noAccountableAndResponsible,
        "Quality Seal is Broken": brokenSeal,
        "Model Completion Status is not 'Ready'": notReady
      }
    });

    // Domain == BusinessCapability
    var domains = this.leafNodes.filter(fs => {return (fs.type === "BusinessCapability")});

    if (domains) {
      var domainLackingBoundedContext = domains.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
      var domainLackingUseCases = domains.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
      var domainScore = domains.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

      this.reportData.push({
        title: "Domain",
        data: {
          "Lacking Bounded Context": domainLackingBoundedContext,
          "Lacking Use Cases": domainLackingUseCases,
          "Overall Score < 60%": domainScore
        }
      });
    }

    // Use Cases == Process
    var useCases = this.leafNodes.filter(fs => {return (fs["type"] === "Process")});

    if (useCases) {
      var useCaseLackingDomain = useCases.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
      var useCaseNoDocumentLinks = useCases.filter(fs => (FilterTools.noDocumentLinks(fs)));
      var useCaseNoLifecycle = this.extraData["useCaseExtra"].filter(fs => (FilterTools.leafNodes(fs)))
      .filter(fs => FilterTools.noLifecycle(fs));
      var useCaseLackingBoundedContext = useCases.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
      var useCaseScore = useCases.filter(fs => (FilterTools.getScoreLessThan(fs, .65)));

      this.reportData.push({
        title: "Use Case",
        data: {
          "Lacking Domain": useCaseLackingDomain,
          "No Document Links": useCaseNoDocumentLinks,
          "No Lifecycle": useCaseNoLifecycle,
          "Lacking Bounded Context": useCaseLackingBoundedContext,
          "Overall Score < 65%": useCaseScore
        }
      });
    }
    
    // Persona == UserGroup
    var personas = this.leafNodes.filter(fs => {return (fs["type"] === "UserGroup")});
    
    if (personas) {
      var personaScore = personas.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

      this.reportData.push({
        title: "Persona",
        data: {
          "Overall Score < 50%": personaScore
        }
      });
    }

    // Epic == Projects
    var epics = this.leafNodes.filter(fs => {return (fs["type"] === "Project")});

    if (epics) {
      var epicNoDocumentLinks = epics.filter(fs => (FilterTools.noDocumentLinks(fs)));
      var epicNoLifecycle = this.extraData["epicExtra"].filter(fs => (FilterTools.leafNodes(fs)))
      .filter(fs => FilterTools.noLifecycle(fs));
      var epicNoBusinessValueRisk = epics.filter(fs => (FilterTools.noBusinessValueRisk(fs)));
      var epicNoAffectedDomains = epics.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
      var epicNoAffectedUseCases = epics.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
      var epicScore = epics.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

      this.reportData.push({
        title: "Epic",
        data: {
          "No Document Links": epicNoDocumentLinks,
          "No Lifecycle": epicNoLifecycle,
          "No Business Value & Risk": epicNoBusinessValueRisk,
          "No Affected Domains": epicNoAffectedDomains,
          "No Affected Use Cases": epicNoAffectedUseCases,
          "Overall Score < 50%": epicScore
        }
      });
    }

    // Bounded Context == Application
    var boundedContexts = this.leafNodes.filter(fs => {return (fs["type"] === "Application")});

    if (boundedContexts) {
      var boundedContextsNoLifecycle = this.extraData["boundedContextExtra"].filter(fs => (FilterTools.leafNodes(fs)))
      .filter(fs => FilterTools.noLifecycle(fs));
      var boundedContextsNoBusinessCritic = boundedContexts.filter(fs => (FilterTools.noBusinessCritic(fs)
      || FilterTools.noBusinessCriticDesc(fs)));
      var boundedContextsNoFunctionFit = boundedContexts.filter(fs => (FilterTools.noFunctionFit(fs)
      || FilterTools.noFunctionFitDesc(fs)));
      var boundedContextsLackingDomain = boundedContexts.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
      var boundedContextsLackingUseCases = boundedContexts.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
      var boundedContextsNoOwnerPersona = boundedContexts.filter(fs => (FilterTools.noOwnerPersona(fs)));
      var boundedContextsMultipleOwnerPersona = boundedContexts.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
      var boundedContextsLackingDataObjects = boundedContexts.filter(fs => (FilterTools.lackingRelation(fs, "DataObject")));
      var boundedContextsLackingProvidedBehaviors = boundedContexts.filter(fs => (FilterTools.lackingProvidedBehaviors(fs)));
      var boundedContextsNoTechnicalFit = this.extraData["boundedContextExtra"].filter(fs => (FilterTools.leafNodes(fs)))
      .filter(fs => FilterTools.noTechnicalFit(fs));
      var boundedContextsNoSoftwareITComponent = boundedContexts.filter(fs => (FilterTools.lackingSoftwareITComponent(fs)));
      var boundedContextsNoDocumentLinks = boundedContexts.filter(fs => (FilterTools.noDocumentLinks(fs)));
      var boundedContextsScore = boundedContexts.filter(fs => (FilterTools.getScoreLessThan(fs, .70)))

      this.reportData.push({
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
      });
    }

    // Behavior == Interface
    var behaviors = this.leafNodes.filter(fs => {return (fs["type"] === "Interface")});

    if (behaviors) {
      var behaviorsLackingProvider = behaviors.filter(fs => (FilterTools.lackingRelation(fs, "ProviderApplication")));
      var behaviorsLackingITComponent = behaviors.filter(fs => (FilterTools.lackingRelation(fs, "ITComponent")));
      var behaviorsScore = behaviors.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

      this.reportData.push({
        title: "Behavior",
        data: {
          "No Provider": behaviorsLackingProvider,
          "No IT Components": behaviorsLackingITComponent,
          "Overall Score < 60%": behaviorsScore
        }
      });
    }

    // Data Object == DataObject
    var dataObjects = this.leafNodes.filter(fs => {return (fs["type"] === "DataObject")});

    if (dataObjects) {
      var dataObjectsNoBoundedContextOrBehavor = dataObjects.filter(fs => (FilterTools.lackingRelation(fs, "Interface")
      && FilterTools.lackingRelation(fs, "Application")));
      var dataObjectsScore = dataObjects.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

      this.reportData.push({
        title: "Data Object",
        data: {
          "No Bounded Context or Behavior": dataObjectsNoBoundedContextOrBehavor,
          "Overall Score < 50%": dataObjectsScore
        }
      });
    }

    // IT Component
    var itComponents = this.leafNodes.filter(fs => {return (fs["type"] === "ITComponent")});

    if (itComponents) {
      var itComponentsMissingProvider = itComponents.filter(fs => (FilterTools.lackingRelation(fs, "Provider")));
      var itComponentsNoDocumentLinks = itComponents.filter(fs => (FilterTools.noDocumentLinks(fs)));
      var itComponentsNoLifecycle = this.extraData["ITComponentExtra"].filter(fs => (FilterTools.leafNodes(fs)))
      .filter(fs => FilterTools.noLifecycle(fs));
      var itComponentsNoTechnicalFit = this.extraData["ITComponentExtra"].filter(fs => (FilterTools.leafNodes(fs)))
      .filter(fs => (FilterTools.noTechnicalFit(fs) || FilterTools.noTechnicalFitDesc(fs)));
      var itComponentsMissingBehaviors = itComponents.filter(fs => (FilterTools.lackingRelation(fs, "Interface")));
      var itComponentsNoOwnerPersona = itComponents.filter(fs => (FilterTools.noOwnerPersona(fs) && FilterTools.EISProvider(fs)));
      var itComponentsMultipleOwnerPersona = itComponents.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
      var itComponentsScore = itComponents.filter(fs => (FilterTools.getScoreLessThan(fs, .70)));

      this.reportData.push({
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
      });
    }
    
    this.render();
  }

  render() {
    ReactDOM.render(<AccordianReport data={this.reportData} all={this.leafNodes} />,
      document.getElementById("report"));
  }
}
