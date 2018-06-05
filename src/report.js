import $ from 'jquery';
import factSheetMapper from './fact-sheet-mapper';
import FilterTools from './FilterTools';
import Queries from './Queries'

const ID_SORTING_DROPDOWN = 'SORTING_DROPDOWN';
const ID_SORTING_BY_NAME = 'SORTING_BY_NAME';
const ID_SORTING_BY_COUNT = 'SORTING_BY_COUNT';

/**
 * The logic for our report is contained in this class.
 * We have create several functions to split up the logic, which increases maintainability.
 */
export class Report {

  constructor(setup) {
    this.setup = setup;
    this.sorting = ID_SORTING_BY_NAME;
  }

  /**
   * Creates a configuration object according to the reporting frameworks specification (see: TODO).
   */
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

    //get only leaf nodes ie, no parents or children
    var leafNodes = this.data.filter(fs => FilterTools.leafNodes(fs));

    //All FactSheets
    var noAccountableAndResponsible = leafNodes.filter(fs => (FilterTools.noResponsible(fs) && FilterTools.noAccountable(fs)));
    var brokenSeal = leafNodes.filter(fs => (FilterTools.brokenSeal(fs)));
    var notReady = leafNodes.filter(fs => (FilterTools.notReady(fs)));

    var out = FilterTools.getOutput("All Fact Sheets", ["Lacking Accountable and Responsible", "Quality Seal is Broken",
            'Model Completion Status is not "Ready"'], [noAccountableAndResponsible, brokenSeal, notReady]);


    



    //Domain == BusinessCapability
    var domains = leafNodes.filter(fs => {return (fs["type"] === "BusinessCapability")});

    var domainLackingBoundedContext = domains.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
    var domainLackingUseCases = domains.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
    var domainScore = domains.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

    out += FilterTools.getOutput("Domains", ["Lacking Bounded Context", "Lacking Use Cases", "Overall Score < 60%"], [domainLackingBoundedContext,
      domainLackingUseCases, domainScore]);



    //Use Cases == Process
    var useCases = leafNodes.filter(fs => {return (fs["type"] === "Process")});

    var useCaseLackingDomain = useCases.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
    var useCaseNoDocumentLinks = useCases.filter(fs => (FilterTools.noDocumentLinks(fs)));
    var useCaseNoLifecycle = this.extraData["useCaseExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => FilterTools.noLifecycle(fs));
    var useCaseLackingBoundedContext = useCases.filter(fs => (FilterTools.lackingRelation(fs, "Application")));
    var useCaseScore = useCases.filter(fs => (FilterTools.getScoreLessThan(fs, .65)));

    out += FilterTools.getOutput("Use Cases", ["Lacking Domain", "No Document Links", "No Lifecycle", "Lacking Bounded Context", "Overall Score < 65%"], 
                    [useCaseLackingDomain, useCaseNoDocumentLinks, useCaseNoLifecycle, useCaseLackingBoundedContext, useCaseScore]);


    //Persona == UserGroup
    var personas = leafNodes.filter(fs => {return (fs["type"] === "UserGroup")});

    var personaScore = personas.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

    out += FilterTools.getOutput("Personas", ["Overall Score < 50%"], [personaScore]);


    //Epic == Projects
    var epics = leafNodes.filter(fs => {return (fs["type"] === "Project")});

    var epicNoDocumentLinks = epics.filter(fs => (FilterTools.noDocumentLinks(fs)));
    var epicNoLifecycle = this.extraData["epicExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => FilterTools.noLifecycle(fs));
    var epicNoBusinessValueRisk = epics.filter(fs => (FilterTools.noBusinessValueRisk(fs)));
    var epicNoAffectedDomains = epics.filter(fs => (FilterTools.lackingRelation(fs, "BusinessCapability")));
    var epicNoAffectedUseCases = epics.filter(fs => (FilterTools.lackingRelation(fs, "Process")));
    var epicScore = epics.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

    out += FilterTools.getOutput("Epics", ["No Document Links", "No Lifecycle", "No Business Value & Risk", "No Affected Domains", 
                        "No Affected Use Cases", "Overall Score < 50%"], [epicNoDocumentLinks, epicNoLifecycle, epicNoBusinessValueRisk,
                          epicNoAffectedDomains, epicNoAffectedUseCases, epicScore]);


    //Bounded Context == Application
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

    out += FilterTools.getOutput("Bounded Context", ["No Lifecycle", "Missing Business Criticality or Business Criticality without Description",
                                  "Missing Functional Fit or Functional Fit without a Description", "No Domain", "No Use Cases",
                                `No Persona with Usage Type "owner"`, `Multiple Persona with Usage Type "owner"`, "No Data Objects",
                              "No Provided Behaviors", "No Technical Fit", `No IT Component of type "software"`, "No Document Links", "Overall Score < 70%"],
                            [boundedContextsNoLifecycle, boundedContextsNoBusinessCritic, boundedContextsNoFunctionFit, boundedContextsLackingDomain,
                              boundedContextsLackingUseCases, boundedContextsNoOwnerPersona, boundedContextsMultipleOwnerPersona,
                              boundedContextsLackingDataObjects, boundedContextsLackingProvidedBehaviors, boundedContextsNoTechnicalFit,
                              boundedContextsNoSoftwareITComponent,boundedContextsNoDocumentLinks, boundedContextsScore]);


    //Behavior == Interface
    var behaviors = leafNodes.filter(fs => {return (fs["type"] === "Interface")});

    var behaviorsLackingProvider = behaviors.filter(fs => (FilterTools.lackingRelation(fs, "ProviderApplication")));
    var behaviorsLackingITComponent = behaviors.filter(fs => (FilterTools.lackingRelation(fs, "ITComponent")));
    var behaviorsScore = behaviors.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

    out += FilterTools.getOutput("Behaviors", ["No Provider", "No IT Components", "Overall Score < 60%"], [behaviorsLackingProvider,
                                  behaviorsLackingITComponent, behaviorsScore]);
                

    //Data Object == DataObject
    var dataObjects = leafNodes.filter(fs => {return (fs["type"] === "DataObject")});

    var dataObjectsNoBoundedContextOrBehavor = dataObjects.filter(fs => (FilterTools.lackingRelation(fs, "Interface") || FilterTools.lackingRelation(fs, "Application")));
    var dataObjectsScore = dataObjects.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));

    out += FilterTools.getOutput("Data Objects", ["No Bounded Context or Bahavior", "Overall Score < 50%"], [dataObjectsNoBoundedContextOrBehavor,
                                  dataObjectsScore]);


    // IT Component
    var itComponents = leafNodes.filter(fs => {return (fs["type"] === "ITComponent")});

    var itComponentsMissingProvider = itComponents.filter(fs => (FilterTools.lackingRelation(fs, "Provider")));
    var itComponentsNoDocumentLinks = itComponents.filter(fs => (FilterTools.noDocumentLinks(fs)));
    var itComponentNoLifecycle = this.extraData["ITComponentExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => FilterTools.noLifecycle(fs));
    var itComponentsNoTechnicalFit = this.extraData["ITComponentExtra"].filter(fs => (FilterTools.leafNodes(fs))).filter(fs => (FilterTools.noTechnicalFit(fs) || FilterTools.noTechnicalFitDesc(fs)));
    var itComponentsMissingBehaviors = itComponents.filter(fs => (FilterTools.lackingRelation(fs, "Interface")));
    var itComponentsNoOwnerPersona = itComponents.filter(fs => (FilterTools.noOwnerPersona(fs) && FilterTools.EISProvider(fs)));
    var itComponentsMultipleOwnerPersona = itComponents.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
    var itComponentsScore = itComponents.filter(fs => (FilterTools.getScoreLessThan(fs, .70)));

    out += FilterTools.getOutput("IT Components", ["Missing Provider", "No Document Links", "No Lifecycle",
                        "Missing Technical Fit or Technical Fit Description", "Missing Behaviors", "Missing Persona of Type Owner (when provider is EIS)",
                        "Multiple Persona of Type Owner", "Overall Score < 70%"], [itComponentsMissingProvider, itComponentsNoDocumentLinks,
                        itComponentNoLifecycle, itComponentsNoTechnicalFit, itComponentsMissingBehaviors, itComponentsNoOwnerPersona, 
                        itComponentsMultipleOwnerPersona, itComponentsScore]);
    


    document.getElementById('accordianReport').innerHTML = out;


  }

}
