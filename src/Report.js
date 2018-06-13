import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';

import FilterTools from './FilterTools';
import Queries from './Queries';
import Utilities from './Utilities';

import ReportGroup from './ReportGroup';
import GraphFilterTools from './GraphFilterTools';

export class Report {

  constructor(setup) {
    this.setup = setup;
    this._createConfig();
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
      allowTableView: false,
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
      /*
      if (Queries.getExtraQuery(factSheetType)) {
        lx.executeGraphQL(Queries.getExtraQuery(factSheetType)).then((extraData) => {
          this.currentExtraData = extraData.allFactSheets.edges.map(fs => fs.node).filter(node => FilterTools.leafNodes(node));
          this._updateData(factSheetType, data);
        });
      } else {
        */
        this._updateData(factSheetType, data);
      //}
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
          //let boundedContextsNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let boundedContextsNoLifecycle = GraphFilterTools.lifecycleGraph(leafNodes);
          //let boundedContextsNoBusinessCritic = leafNodes.filter(fs => (FilterTools.noBusinessCritic(fs)
          //|| FilterTools.noBusinessCriticDesc(fs)));
          let boundedContextsNoBusinessCritic = GraphFilterTools.businessCriticalityGraph(leafNodes);
          //let boundedContextsNoFunctionFit = leafNodes.filter(fs => (FilterTools.noFunctionFit(fs)
          //|| FilterTools.noFunctionFitDesc(fs)));
          let boundedContextsNoFunctionFit = GraphFilterTools.functionalFitGraph(leafNodes);
          //let boundedContextsLackingDomain = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
          let boundedContextsLackingDomain = GraphFilterTools.relationGraph(leafNodes, "BusinessCapability");
          //let boundedContextsLackingUseCases = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
          let boundedContextsLackingUseCases = GraphFilterTools.relationGraph(leafNodes, "Process");
          //let boundedContextsNoOwnerPersona = leafNodes.filter(fs => (FilterTools.noOwnerPersona(fs)));
          //let boundedContextsMultipleOwnerPersona = leafNodes.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
          let boundedContextsNoOwnerPersona = GraphFilterTools.ownerPersonaGraph(leafNodes);
          //let boundedContextsLackingDataObjects = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "DataObject")));
          let boundedContextsLackingDataObjects = GraphFilterTools.relationGraph(leafNodes, "DataObject");
          //let boundedContextsLackingProvidedBehaviors = leafNodes.filter(fs => (FilterTools.lackingProvidedBehaviors(fs)));
          let boundedContextsLackingProvidedBehaviors = GraphFilterTools.providedBehaviorsGraph(leafNodes);
          //let boundedContextsNoTechnicalFit = this.currentExtraData.filter(fs => FilterTools.noTechnicalFit(fs));
          //let boundedContextsNoTechnicalFit = leafNodes.filter(fs => FilterTools.noTechnicalFit(fs));
          let boundedContextsNoTechnicalFit = GraphFilterTools.technicalFitGraph(leafNodes);
          //let boundedContextsNoSoftwareITComponent = leafNodes.filter(fs => (FilterTools.lackingSoftwareITComponent(fs)));
          let boundedContextsNoSoftwareITComponent = GraphFilterTools.softwareITComponentGraph(leafNodes);
          //let boundedContextsNoDocumentLinks = leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          let boundedContextsNoDocumentLinks = GraphFilterTools.documentsGraph(leafNodes);
          let boundedContextsScore = leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .70)))

          reportData = {
            title: "Bounded Context",
            data: {
              "No Lifecycle": boundedContextsNoLifecycle,
              "Missing Business Criticality or Business Criticality without Description": boundedContextsNoBusinessCritic,
              "Missing Functional Fit or Functional Fit without a Description": boundedContextsNoFunctionFit,
              "No Domain": boundedContextsLackingDomain,
              "No Use Cases": boundedContextsLackingUseCases,
              "No Persona with Usage Type 'Owner'": boundedContextsNoOwnerPersona,
              //"Multiple Persona with Usage Type 'Owner'": boundedContextsMultipleOwnerPersona,
              "No Data Objects": boundedContextsLackingDataObjects,
              "No Provided Behaviors": boundedContextsLackingProvidedBehaviors,
              "No Technical Fit": boundedContextsNoTechnicalFit,
              "No IT Component of Type 'Software'": boundedContextsNoSoftwareITComponent,
              "No Document Links": boundedContextsNoDocumentLinks,
              "Overall Score < 70%": boundedContextsScore
            }
          };
          break;
        
        case 'BusinessCapability':
          // Domain
          //let domainLackingBoundedContext = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
          let domainLackingBoundedContext = GraphFilterTools.relationGraph(leafNodes, "Application");
          //let domainLackingUseCases = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
          let domainLackingUseCases = GraphFilterTools.relationGraph(leafNodes, "Process");
          let domainScore = leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

          reportData = {
            title: "Domain",
            data: {
              "Lacking Bounded Context": domainLackingBoundedContext,
              "Lacking Use Cases": domainLackingUseCases,
              "Overall Score < 60%": domainScore
            }
          };
          break;

        case 'DataObject':
          // Data Object
          //let dataObjectsNoBoundedContextOrBehavor = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Interface")
          //&& FilterTools.lackingRelation(fs, "Application")));
          let dataObjectsNoBoundedContextOrBehavor = GraphFilterTools.boundedContextBehaviorGraph(leafNodes);
          let dataObjectsScore = leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

          reportData = {
            title: "Data Object",
            data: {
              "No Bounded Context or Behavior": dataObjectsNoBoundedContextOrBehavor,
              "Overall Score < 50%": dataObjectsScore
            }
          };
          break;
        
        case 'ITComponent':
          // IT Component
          //let itComponentsMissingProvider = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Provider")));
          let itComponentsMissingProvider = GraphFilterTools.relationGraph(leafNodes, "Provider");
          //let itComponentsNoDocumentLinks = leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          let itComponentsNoDocumentLinks = GraphFilterTools.documentsGraph(leafNodes);
          //let itComponentsNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let itComponentsNoLifecycle = GraphFilterTools.lifecycleGraph(leafNodes);
          //let itComponentsNoTechnicalFit = this.currentExtraData.filter(fs => (FilterTools.noTechnicalFit(fs) || FilterTools.noTechnicalFitDesc(fs)));
          //let itComponentsNoTechnicalFit = leafNodes.filter(fs => (FilterTools.noTechnicalFit(fs) || FilterTools.noTechnicalFitDesc(fs)));
          let itComponentsNoTechnicalFit = GraphFilterTools.technicalFitGraph(leafNodes);
          //let itComponentsMissingBehaviors = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Interface")));
          let itComponentsMissingBehaviors = GraphFilterTools.relationGraph(leafNodes, "Interface");
          //let itComponentsNoOwnerPersona = leafNodes.filter(fs => (FilterTools.noOwnerPersona(fs) && FilterTools.EISProvider(fs)));
          let itComponentsNoOwnerPersona = GraphFilterTools.EISownerPersonaGraph(leafNodes);
          //let itComponentsMultipleOwnerPersona = leafNodes.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
          let itComponentsMultipleOwnerPersona = GraphFilterTools.ownerPersonaGraph(leafNodes);
          let itComponentsScore = leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .70)));

          reportData = {
            title: "IT Component",
            data: {
              "Missing Provider": itComponentsMissingProvider,
              "No Document Links": itComponentsNoDocumentLinks,
              "No Lifecycle": itComponentsNoLifecycle,
              "Missing Technical Fit or Technical Fit Description": itComponentsNoTechnicalFit,
              "Missing Behaviors": itComponentsMissingBehaviors,
              "Missing Persona of Type 'Owner' (when provider is EIS)": itComponentsNoOwnerPersona,
              //"Multiple Persona of Type Owner": itComponentsMultipleOwnerPersona,
              "No Persona of Type 'Owner'": itComponentsMultipleOwnerPersona,
              "Overall Score < 70%": itComponentsScore
            }
          };
          break;

        case 'Interface':
          // Behavior
          //let behaviorsLackingProvider = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "ProviderApplication")));
          let behaviorsLackingProvider = GraphFilterTools.relationGraph(leafNodes, "ProviderApplication");
          //let behaviorsLackingITComponent = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "ITComponent")));
          let behaviorsLackingITComponent = GraphFilterTools.relationGraph(leafNodes, "ITComponent");
          let behaviorsScore = leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));
    
          reportData = {
            title: "Behavior",
            data: {
              "No Provider": behaviorsLackingProvider,
              "No IT Components": behaviorsLackingITComponent,
              "Overall Score < 60%": behaviorsScore
            }
          };
          break;

        case 'Process':
          // Use Case
          //let useCaseLackingDomain = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
          let useCaseLackingDomain = GraphFilterTools.relationGraph(leafNodes, "BusinessCapability");
          //let useCaseNoDocumentLinks = leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          let useCaseNoDocumentLinks = GraphFilterTools.documentsGraph(leafNodes)
          //let useCaseNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let useCaseNoLifecycle = GraphFilterTools.lifecycleGraph(leafNodes);
          //let useCaseLackingBoundedContext = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
          let useCaseLackingBoundedContext = GraphFilterTools.relationGraph(leafNodes, "Application");
          let useCaseScore = leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));
    
          reportData = {
            title: "Use Case",
            data: {
              "Lacking Domain": useCaseLackingDomain,
              "No Document Links": useCaseNoDocumentLinks,
              "No Lifecycle": useCaseNoLifecycle,
              "Lacking Bounded Context": useCaseLackingBoundedContext,
              "Overall Score < 60%": useCaseScore
            }
          };
          break;

        case 'Project':
          // Epic
          let epicNoDocumentLinks = leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          //let epicNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let epicNoLifecycle = GraphFilterTools.lifecycleGraph(leafNodes);
          let epicNoBusinessValueRisk = leafNodes.filter(fs => (FilterTools.noBusinessValueRisk(fs)));
          let epicNoAffectedDomains = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
          let epicNoAffectedUseCases = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
          let epicScore = leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));
    
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
          break;

        case 'UserGroup':
          // Persona
          let personaScore = leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));
    
          reportData = {
            title: "Persona",
            data: {
              "Overall Score < 50%": personaScore
            }
          };
          break;
      }
    }
    // TODO: Investigate whether it would be better to have a specific render function
    ReactDOM.render(<ReportGroup title={reportData.title} data={reportData.data} overallID={uuid.v1()} typeData={leafNodes} />, document.getElementById('report'));
  }
}
