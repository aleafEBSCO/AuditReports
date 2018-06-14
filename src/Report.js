import React from 'react';
import ReactDOM from 'react-dom';
import uuid from 'uuid';

import FilterTools from './FilterTools';
import Queries from './Queries';
import Utilities from './Utilities';

import SelectField from './SelectField';
import ReportView from './ReportView';

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
    'Missing Technical Fit or Technical Fit Description',
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
  'UserGroup': [
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
    this.leafNodes = null;
    this.audits = null;

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
        value={auditTypeOptions[0]} onChange={this._handleAuditTypeSelect} />
      </span>
    );
  }

  _handleFactSheetTypeSelect(selectedOption) {
    this._update(selectedOption.value);
  }

  _handleAuditTypeSelect(selectedOption) {
    this.reportState.selectedAuditType = selectedOption.value;
    this._renderReport();
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
    // Shorter, more readable name
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
    this.leafNodes = this.currentData.filter(fs => FilterTools.leafNodes(fs));
    this._updateAudits();
  }

  _updateAudits() {
    // Get only leaf nodes ie, no parents or children
    // NOTE: leafNodes will only be of the current fact sheet type due to separation of queries
    if (this.leafNodes) {
      switch (this.reportState.selectedFactSheetType) {
        case 'All':
          // All Fact Sheets
          let noAccountableAndResponsible = this.leafNodes.filter(fs => (FilterTools.noResponsible(fs)
          && FilterTools.noAccountable(fs)));
          let brokenSeal = this.leafNodes.filter(fs => (FilterTools.brokenSeal(fs)));
          let notReady = this.leafNodes.filter(fs => (FilterTools.notReady(fs)));

          this.audits = {
            "Lacking Accountable and Responsible": noAccountableAndResponsible,
            "Quality Seal is Broken": brokenSeal,
            "Model Completion Status is not 'Ready'": notReady
          };
          break;
        
        case 'Application':
          // Bounded Context
          let boundedContextsNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let boundedContextsNoBusinessCritic = this.leafNodes.filter(fs => (FilterTools.noBusinessCritic(fs)
          || FilterTools.noBusinessCriticDesc(fs)));
          let boundedContextsNoFunctionFit = this.leafNodes.filter(fs => (FilterTools.noFunctionFit(fs)
          || FilterTools.noFunctionFitDesc(fs)));
          let boundedContextsLackingDomain = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
          let boundedContextsLackingUseCases = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
          let boundedContextsNoOwnerPersona = this.leafNodes.filter(fs => (FilterTools.noOwnerPersona(fs)));
          let boundedContextsMultipleOwnerPersona = this.leafNodes.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
          let boundedContextsLackingDataObjects = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "DataObject")));
          let boundedContextsLackingProvidedBehaviors = this.leafNodes.filter(fs => (FilterTools.lackingProvidedBehaviors(fs)));
          let boundedContextsNoTechnicalFit = this.currentExtraData.filter(fs => FilterTools.noTechnicalFit(fs));
          let boundedContextsNoSoftwareITComponent = this.leafNodes.filter(fs => (FilterTools.lackingSoftwareITComponent(fs)));
          let boundedContextsNoDocumentLinks = this.leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          let boundedContextsScore = this.leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .70)))

          this.audits = {
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
          };
          break;
        
        case 'BusinessCapability':
          // Domain
          let domainLackingBoundedContext = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
          let domainLackingUseCases = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
          let domainScore = this.leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

          this.audits = {
            "Lacking Bounded Context": domainLackingBoundedContext,
            "Lacking Use Cases": domainLackingUseCases,
            "Overall Score < 60%": domainScore
          };
          break;

        case 'DataObject':
          // Data Object
          let dataObjectsNoBoundedContextOrBehavor = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Interface")
          && FilterTools.lackingRelation(fs, "Application")));
          let dataObjectsScore = this.leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

          this.audits = {
            "No Bounded Context or Behavior": dataObjectsNoBoundedContextOrBehavor,
            "Overall Score < 50%": dataObjectsScore
          };
          break;
        
        case 'ITComponent':
          // IT Component
          let itComponentsMissingProvider = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Provider")));
          let itComponentsNoDocumentLinks = this.leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          let itComponentsNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let itComponentsNoTechnicalFit = this.currentExtraData.filter(fs => (FilterTools.noTechnicalFit(fs) || FilterTools.noTechnicalFitDesc(fs)));
          let itComponentsMissingBehaviors = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Interface")));
          let itComponentsNoOwnerPersona = this.leafNodes.filter(fs => (FilterTools.noOwnerPersona(fs) && FilterTools.EISProvider(fs)));
          let itComponentsMultipleOwnerPersona = this.leafNodes.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
          let itComponentsScore = this.leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .70)));

          this.audits = {
            "Missing Provider": itComponentsMissingProvider,
            "No Document Links": itComponentsNoDocumentLinks,
            "No Lifecycle": itComponentsNoLifecycle,
            "Missing Technical Fit or Technical Fit Description": itComponentsNoTechnicalFit,
            "Missing Behaviors": itComponentsMissingBehaviors,
            "Missing Persona of Type Owner (when provider is EIS)": itComponentsNoOwnerPersona,
            "Multiple Persona of Type Owner": itComponentsMultipleOwnerPersona,
            "Overall Score < 70%": itComponentsScore
          };
          break;

        case 'Interface':
          // Behavior
          let behaviorsLackingProvider = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "ProviderApplication")));
          let behaviorsLackingITComponent = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "ITComponent")));
          let behaviorsScore = this.leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));
    
          this.audits = {
            "No Provider": behaviorsLackingProvider,
            "No IT Components": behaviorsLackingITComponent,
            "Overall Score < 60%": behaviorsScore
          };
          break;

        case 'Process':
          // Use Case
          let useCaseLackingDomain = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
          let useCaseNoDocumentLinks = this.leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          let useCaseNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let useCaseLackingBoundedContext = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
          let useCaseScore = this.leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));
    
          this.audits = {
            "Lacking Domain": useCaseLackingDomain,
            "No Document Links": useCaseNoDocumentLinks,
            "No Lifecycle": useCaseNoLifecycle,
            "Lacking Bounded Context": useCaseLackingBoundedContext,
            "Overall Score < 60%": useCaseScore
          };
          break;

        case 'Project':
          // Epic
          let epicNoDocumentLinks = this.leafNodes.filter(fs => (FilterTools.noDocumentLinks(fs)));
          let epicNoLifecycle = this.currentExtraData.filter(fs => FilterTools.noLifecycle(fs));
          let epicNoBusinessValueRisk = this.leafNodes.filter(fs => (FilterTools.noBusinessValueRisk(fs)));
          let epicNoAffectedDomains = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
          let epicNoAffectedUseCases = this.leafNodes.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
          let epicScore = this.leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));
    
          this.audits = {
            "No Document Links": epicNoDocumentLinks,
            "No Lifecycle": epicNoLifecycle,
            "No Business Value & Risk": epicNoBusinessValueRisk,
            "No Affected Domains": epicNoAffectedDomains,
            "No Affected Use Cases": epicNoAffectedUseCases,
            "Overall Score < 50%": epicScore
          };
          break;

        case 'UserGroup':
          // Persona
          let personaScore = this.leafNodes.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));
    
          this.audits = {
            "Overall Score < 50%": personaScore
          };
          break;
      }
    }
    this._renderReport();
  }

  _renderReport() {
    ReactDOM.render(<ReportView title={this.reportState.selectedFactSheetType} subtitle={this.reportState.selectedAuditType}
      categoryData={this.audits[this.reportState.selectedAuditType]} typeData={this.leafNodes} />, document.getElementById('report'));
  }
}
