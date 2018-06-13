import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';

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
      this._updateData(factSheetType, data);
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
    let leafNodes = this.currentData.filter(fs => {
      if (fs["relToChild"]["totalCount"] === 0 && fs["relToParent"]["totalCount"] === 0){
        return true;
      }else{
        return false;
      }});
    let reportData = {
      title: '',
      data: {}
    };

    if (leafNodes) {
      switch (this.currentFactSheetType) {
        case 'All':
          // All Fact Sheets
          let noAccountableAndResponsible = GraphFilterTools.accountableResponsibleGraphs(leafNodes);
          let brokenSeal = GraphFilterTools.qualitySealGraphs(leafNodes);
          let notReady = GraphFilterTools.modelCompletionGraphs(leafNodes);

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
          let boundedContextsNoLifecycle = GraphFilterTools.lifecycleGraph(leafNodes);
          let boundedContextsNoBusinessCritic = GraphFilterTools.businessCriticalityGraph(leafNodes);
          let boundedContextsNoFunctionFit = GraphFilterTools.functionalFitGraph(leafNodes);
          let boundedContextsLackingDomain = GraphFilterTools.relationGraph(leafNodes, "BusinessCapability");
          let boundedContextsLackingUseCases = GraphFilterTools.relationGraph(leafNodes, "Process");
          let boundedContextsNoOwnerPersona = GraphFilterTools.ownerPersonaGraph(leafNodes);
          let boundedContextsLackingDataObjects = GraphFilterTools.relationGraph(leafNodes, "DataObject");
          let boundedContextsLackingProvidedBehaviors = GraphFilterTools.providedBehaviorsGraph(leafNodes);
          let boundedContextsNoTechnicalFit = GraphFilterTools.technicalFitGraph(leafNodes);
          let boundedContextsNoSoftwareITComponent = GraphFilterTools.softwareITComponentGraph(leafNodes);
          let boundedContextsNoDocumentLinks = GraphFilterTools.documentsGraph(leafNodes);
          let boundedContextsScore = GraphFilterTools.createHistogram(leafNodes, "Bounded Context", 70);

          reportData = {
            title: "Bounded Context",
            data: {
              "No Lifecycle": boundedContextsNoLifecycle,
              "Missing Business Criticality or Business Criticality without Description": boundedContextsNoBusinessCritic,
              "Missing Functional Fit or Functional Fit without a Description": boundedContextsNoFunctionFit,
              "No Domain": boundedContextsLackingDomain,
              "No Use Cases": boundedContextsLackingUseCases,
              "No Persona with Usage Type 'Owner'": boundedContextsNoOwnerPersona,
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
          let domainLackingBoundedContext = GraphFilterTools.relationGraph(leafNodes, "Application");
          let domainLackingUseCases = GraphFilterTools.relationGraph(leafNodes, "Process");
          let domainScore = GraphFilterTools.createHistogram(leafNodes, "Domain", 60);

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
          let dataObjectsNoBoundedContextOrBehavor = GraphFilterTools.boundedContextBehaviorGraph(leafNodes);
          let dataObjectsScore = GraphFilterTools.createHistogram(leafNodes, "Data Object", 50);

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
          let itComponentsMissingProvider = GraphFilterTools.relationGraph(leafNodes, "Provider");
          let itComponentsNoDocumentLinks = GraphFilterTools.documentsGraph(leafNodes);
          let itComponentsNoLifecycle = GraphFilterTools.lifecycleGraph(leafNodes);
          let itComponentsNoTechnicalFit = GraphFilterTools.technicalFitGraph(leafNodes);
          let itComponentsMissingBehaviors = GraphFilterTools.relationGraph(leafNodes, "Interface");
          let itComponentsNoOwnerPersonaEIS = GraphFilterTools.EISownerPersonaGraph(leafNodes);
          let itComponentsNoOwnerPersona = GraphFilterTools.ownerPersonaGraph(leafNodes);
          let itComponentsScore = GraphFilterTools.createHistogram(leafNodes, "IT Component", 70);

          reportData = {
            title: "IT Component",
            data: {
              "Missing Provider": itComponentsMissingProvider,
              "No Document Links": itComponentsNoDocumentLinks,
              "No Lifecycle": itComponentsNoLifecycle,
              "Missing Technical Fit or Technical Fit Description": itComponentsNoTechnicalFit,
              "Missing Behaviors": itComponentsMissingBehaviors,
              "Missing Persona of Type 'Owner' (when provider is EIS)": itComponentsNoOwnerPersonaEIS,
              "No Persona of Type 'Owner'": itComponentsNoOwnerPersona,
              "Overall Score < 70%": itComponentsScore
            }
          };
          break;

        case 'Interface':
          // Behavior
          let behaviorsLackingProvider = GraphFilterTools.relationGraph(leafNodes, "ProviderApplication");
          let behaviorsLackingITComponent = GraphFilterTools.relationGraph(leafNodes, "ITComponent");
          let behaviorsScore = GraphFilterTools.createHistogram(leafNodes, "Behavior", 60);
    
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
          let useCaseLackingDomain = GraphFilterTools.relationGraph(leafNodes, "BusinessCapability");
          let useCaseNoDocumentLinks = GraphFilterTools.documentsGraph(leafNodes)
          let useCaseNoLifecycle = GraphFilterTools.lifecycleGraph(leafNodes);
          let useCaseLackingBoundedContext = GraphFilterTools.relationGraph(leafNodes, "Application");
          let useCaseScore = GraphFilterTools.createHistogram(leafNodes, "Use Case", 60);
    
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
          let epicNoDocumentLinks = GraphFilterTools.documentsGraph(leafNodes);
          let epicNoLifecycle = GraphFilterTools.lifecycleGraph(leafNodes);
          let epicNoBusinessValueRisk = GraphFilterTools.businessValueRiskGraph(leafNodes);
          let epicNoAffectedDomains = GraphFilterTools.relationGraph(leafNodes, "BusinessCapability");
          let epicNoAffectedUseCases = GraphFilterTools.relationGraph(leafNodes, "Process");
          let epicScore = GraphFilterTools.createHistogram(leafNodes, "Epic", 50);
    
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
          let personaScore = GraphFilterTools.createHistogram(leafNodes, "Persona", 50);
    
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
