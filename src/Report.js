import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';

import FilterTools from './FilterTools';
import Queries from './Queries';
import Utilities from './Utilities';

import SelectField from './SelectField';
import ReportData from './ReportData';

const SELECT_FIELD_STYLE = {
	width: '250px',
	display: 'inline-block',
	verticalAlign: 'top',
	marginRight: '1em'
};

const AUDIT_TYPES = {
  'All': [
    'Lacking Accountable and Responsible',
    'Quality Seal is Broken',
    "Model Completion Status is not 'Ready'"
  ],
  'Application': [
    'No Lifecycle',
    'Missing Business Criticality or Business Criticality without Description',
    'Missing Functional Fit or Functional Fit without a Description',
    'No Domain',
    'No Use Cases',
    "No Persona with Usage Type 'Owner'",
    "Multiple Persona with Usage Type 'Owner'",
    'No Data Objects',
    'No Provided Behaviors',
    'No Technical Fit',
    "No IT Component of Type 'Software'",
    'No Document Links',
    'Overall Score < 70%'
  ],
  'BusinessCapability': [
    'Lacking Bounded Context',
    'Lacking Use Cases',
    'Overall Score < 60%'
  ],
  'DataObject': [
    'No Bounded Context or Behavior',
    'Overall Score < 50%'
  ],
  'ITComponent': [
    'Missing Provider',
    'No Document Links',
    'No Lifecycle',
    'Missing Technical Fit or Technical Fit Desicription',
    'Missing Behaviors',
    "Missing Persona of Type 'Owner' (when provider is EIS)",
    "Multiple Persona of Type 'Owner'",
    'Overall Score < 70%'
  ],
  'Interface': [
    'No Provider',
    'No IT Components',
    'Overall Score < 60%'
  ],
  'Process': [
    'Lacking Domain',
    'No Document Links',
    'No Lifecycle',
    'Lacking Bounded Context',
    'Overall Score < 60%'
  ],
  'Project': [
    'No Document Links',
    'No Lifecycle',
    'No Business Value & Risk',
    'No Affected Domains',
    'No Affected Use Cases',
    'Overall Score < 50%'
  ],
  'Persona': [
    'Overall Score < 50%'
  ]
}

export class Report {

  constructor(setup) {
    this.setup = setup;
    this.factSheetTypes = [{type: 'All'}].concat(Utilities.getFactsheetTypesObjects(this.setup.settings.dataModel.factSheets));
    this.reportState = {
      selectedFactSheetType: null,
      selectedAuditType: null
    }

    this._handleFactSheetTypeSelect = this._handleFactSheetTypeSelect.bind(this);
    this._handleAuditTypeSelect = this._handleAuditTypeSelect.bind(this);

    this._createConfig();
  }

  _createConfig() {
    this.config = {
      allowTableView: false,
      allowEditing: false
    };
  }

  _getFactSheetTypeOptions() {
    let factSheetTypeOptions = [];

    this.factSheetTypes.forEach(((value) => {
      const key = value.type;
      // No audit data for Provider and TechnicalStack
      if (key !== 'Provider' && key !== 'TechnicalStack') {
        factSheetTypeOptions.push({
          value: key,
          label: Utilities.leanIXToEbscoTypes(key)
        });
      }
    }).bind(this));

    return factSheetTypeOptions;
  }

  _getAuditTypeOptions(factSheetType) {
    return AUDIT_TYPES[factSheetType].map(type => {
      return { value: type, label: type };
    });
  }

  _renderFactSheetSelect() {
    let factSheetTypeOptions = this._getFactSheetTypeOptions();

    return (
      <span style={SELECT_FIELD_STYLE}>
        <SelectField id='factsheettype' label='Fact Sheet Type' options={factSheetTypeOptions}
        value={factSheetTypeOptions[0]} onChange={this._handleFactSheetTypeSelect} />
      </span>
    );
  }

  _renderAuditSelect(factSheetType) {
    let auditTypeOptions = this._getAuditTypeOptions(factSheetType);

    return (
      <span style={SELECT_FIELD_STYLE}>
        <SelectField id='audittype' label='Audit Type' options={auditTypeOptions}
        value={auditTypeOptions[0]} onChange={this._handleAuditTypeSelect} forceValueUpdate />
      </span>
    );
  }

  _handleFactSheetTypeSelect(selectedOption) {
    this._update(selectedOption.value);
  }

  _handleAuditTypeSelect(selectedOption) {
    this.reportState.selectedAuditType = selectedOption.value;
    this._executeQueries();
  }

	init() {
		if (_.size(this.factSheetTypes) > 0) {
			// init the report with the first factsheet type
			this._update(this.factSheetTypes[0].type);
		} else {
			console.log('No fact sheet types');
    }
    ReactDOM.render(this._renderFactSheetSelect(), document.getElementById('factsheet-select'));
  }

	_update(factSheetType) {
    if (this.reportState.selectedFactSheetType === factSheetType) {
			// nothing to do
			return;
    }

    // Update to new fact sheet type
    this.reportState.selectedFactSheetType = factSheetType;

    // Render audit select
    ReactDOM.render(this._renderAuditSelect(factSheetType), document.getElementById('audit-select'));

    // Audit type will be the first option right after rendering
    this.reportState.selectedAuditType = this._getAuditTypeOptions(factSheetType)[0].value;

    this._executeQueries();
  }

  _executeQueries() {
    // Shorter names
    let factSheetType = this.reportState.selectedFactSheetType;

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
    this.currentData = data.allFactSheets.edges.map(fs => fs.node);
    this._updateReport();
  }

  _updateReport() {
    // Get only leaf nodes ie, no parents or children
    // NOTE: leafNodes will only be of the current fact sheet type due to separation of queries
    let leafNodes = this.currentData.filter(fs => FilterTools.leafNodes(fs));
    let reportData = {
      title: '',
      data: {}
    };

    if (leafNodes) {
      switch (this.reportState.selectedFactSheetType) {
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
          let boundedContextsNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let boundedContextsNoBusinessCritic = leafNodes.filter(fs => (FilterTools.noBusinessCritic(fs)
          || FilterTools.noBusinessCriticDesc(fs)));
          let boundedContextsNoFunctionFit = leafNodes.filter(fs => (FilterTools.noFunctionFit(fs)
          || FilterTools.noFunctionFitDesc(fs)));
          let boundedContextsLackingDomain = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
          let boundedContextsLackingUseCases = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
          let boundedContextsNoOwnerPersona = leafNodes.filter(fs => (FilterTools.noOwnerPersona(fs)));
          let boundedContextsMultipleOwnerPersona = leafNodes.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
          let boundedContextsLackingDataObjects = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "DataObject")));
          let boundedContextsLackingProvidedBehaviors = leafNodes.filter(fs => (FilterTools.lackingProvidedBehaviors(fs)));
          let boundedContextsNoTechnicalFit = this.currentExtraData.filter(fs => FilterTools.noTechnicalFit(fs));
          let boundedContextsNoSoftwareITComponent = leafNodes.filter(fs => (FilterTools.lackingSoftwareITComponent(fs)));
          let boundedContextsNoDocumentLinks = leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
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
              "Multiple Persona with Usage Type 'Owner'": boundedContextsMultipleOwnerPersona,
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
          let domainLackingBoundedContext = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
          let domainLackingUseCases = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
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
          let dataObjectsNoBoundedContextOrBehavor = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Interface")
          && FilterTools.lackingRelation(fs, "Application")));
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
          let itComponentsMissingProvider = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Provider")));
          let itComponentsNoDocumentLinks = leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          let itComponentsNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let itComponentsNoTechnicalFit = this.currentExtraData.filter(fs => (FilterTools.noTechnicalFit(fs) || FilterTools.noTechnicalFitDesc(fs)));
          let itComponentsMissingBehaviors = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Interface")));
          let itComponentsNoOwnerPersona = leafNodes.filter(fs => (FilterTools.noOwnerPersona(fs) && FilterTools.EISProvider(fs)));
          let itComponentsMultipleOwnerPersona = leafNodes.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
          let itComponentsScore = leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .70)));

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
          break;

        case 'Interface':
          // Behavior
          let behaviorsLackingProvider = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "ProviderApplication")));
          let behaviorsLackingITComponent = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "ITComponent")));
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
          let useCaseLackingDomain = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
          let useCaseNoDocumentLinks = leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          let useCaseNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let useCaseLackingBoundedContext = leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
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
          let epicNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
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
    ReactDOM.render(<ReportData title={this.reportState.selectedFactSheetType} subtitle={this.reportState.selectedAuditType}
      categoryData={reportData.data[this.reportState.selectedAuditType]} typeData={leafNodes} />, document.getElementById('report'));
  }
}
