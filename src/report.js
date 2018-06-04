import $ from 'jquery';
import factSheetMapper from './fact-sheet-mapper';
import FilterTools from './FilterTools';

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
        attributes: [`
        type
        id
        displayName
        subscriptions {
          edges {
            node {
              type
            }
          }
        }
        qualitySeal
        tags {
          tagGroup {
            name
          }
          name
        }
        ... on BusinessCapability {
          relBusinessCapabilityToApplication {
            totalCount
          }
          relBusinessCapabilityToProcess {
            totalCount
          }
          completion {
            completion
          }
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
        ... on Process {
          relProcessToBusinessCapability {
            totalCount
          }
          documents {
            totalCount
          }
          relProcessToApplication {
            totalCount
          }
          completion {
            completion
          }
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
        ... on UserGroup {
          completion {
            completion
          }
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
        ... on Project {
          documents {
            totalCount
          }
          businessValue
          projectRisk
          relProjectToBusinessCapability {
            totalCount
          }
          relProjectToProcess {
            totalCount
          }
          completion {
            completion
          }
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
        ... on Application {
          businessCriticality
          businessCriticalityDescription
          functionalSuitability
          functionalSuitabilityDescription
          relApplicationToBusinessCapability {
            totalCount
          }
          relApplicationToProcess {
            totalCount
          }
          relApplicationToUserGroup {
            edges {
              node {
                usageType
              }
            }
          }
          relApplicationToDataObject {
            totalCount
          }
          relProviderApplicationToInterface {
            totalCount
          }
          relApplicationToITComponent {
            edges {
              node {
                factSheet {
                  ... on ITComponent {
                    category
                  }
                }
              }
            }
          }
          documents {
            totalCount
          }
          completion {
            completion
          }
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
        ... on Interface {
          relInterfaceToProviderApplication {
            totalCount
          }
          relInterfaceToITComponent {
            totalCount
          }
          completion {
            completion
          }
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
        ... on DataObject {
          completion {
            completion
          }
          relDataObjectToApplication {
            totalCount
          }
          relDataObjectToInterface {
            totalCount
          }
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
        ... on ITComponent {
          relITComponentToProvider {
            edges {
              node {
                factSheet {
                  displayName
                }
              }
            }
          }
          documents {
            totalCount
          }
          technicalSuitabilityDescription
          relITComponentToInterface {
            totalCount
          }
          relITComponentToUserGroup {
            edges {
              node {
                usageType
              }
            }
          }
          completion {
            completion
          }
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
        ... on Provider {
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
        ... on TechnicalStack {
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
`],
        callback: function (data) {
          this.data = data;
          this.groups = _.groupBy(data, 'type');
          this.render();
        }.bind(this)
      }]
    };
  }

  render() {
    //console.log(this.data);

    //get only leaf nodes ie, no parents or children
    var leafNodes = this.data.filter(fs => FilterTools.leafNodes(fs));

    console.log(leafNodes);

    //console.log(lx);

    //All FactSheets
    var noAccountableAndResponsible = leafNodes.filter(fs => (FilterTools.noResponsible(fs) && FilterTools.noAccountable(fs)));
    //console.log(noAccountableAndResponsible);

    //var out = FilterTools.prepareForOutput(noAccountableAndResponsible);
    //document.getElementById('noAccountableAndResponsible').innerHTML = out;

    var brokenSeal = leafNodes.filter(fs => (FilterTools.brokenSeal(fs)));
    //var out = FilterTools.prepareForOutput(brokenSeal);
    //document.getElementById('brokenQualitySeal').innerHTML = out;

    var notReady = leafNodes.filter(fs => (FilterTools.notReady(fs)));
    //var out = FilterTools.prepareForOutput(notReady);
    //document.getElementById('notReady').innerHTML = out;

    var out = FilterTools.getOutput("All Fact Sheets", ["Lacking Accountable and Responsible", "Quality Seal is Broken",
            'Model Completion Status is not "Ready"'], [noAccountableAndResponsible, brokenSeal, notReady]);


    



    //Domain == BusinessCapability

    var domains = leafNodes.filter(fs => {return (fs["type"] === "BusinessCapability")});

    //console.log(domains);

    var domainLackingBoundedContext = domains.filter(fs => (FilterTools.lackingBoundedContext(fs)));
    var domainLackingUseCases = domains.filter(fs => (FilterTools.lackingUseCases(fs)));
    var domainScore = domains.filter(fs => (FilterTools.getScoreLessThan(fs, .60)));

    out += FilterTools.getOutput("Domains", ["Lacking Bounded Context", "Lacking Use Cases", "Overall Score < 60%"], [domainLackingBoundedContext,
      domainLackingUseCases, domainScore]);



    //Use Cases == Process

    var useCases = leafNodes.filter(fs => {return (fs["type"] === "Process")});
    //console.log(useCases);

    var useCaseLackingDomain = useCases.filter(fs => (FilterTools.lackingDomain(fs)));
    var useCaseNoDocumentLinks = useCases.filter(fs => (FilterTools.noDocumentLinks(fs)));
    //var lifecycle
    var useCaseLackingBoundedContext = useCases.filter(fs => (FilterTools.lackingBoundedContext(fs)));
    var useCaseScore = useCases.filter(fs => (FilterTools.getScoreLessThan(fs, .65)));

    out += FilterTools.getOutput("Use Cases", ["Lacking Domain", "No Document Links", "Lacking Bounded Context", "Overall Score < 65%"], 
                    [useCaseLackingDomain, useCaseNoDocumentLinks, useCaseLackingBoundedContext, useCaseScore]);





    //Persona == UserGroup
    var personas = leafNodes.filter(fs => {return (fs["type"] === "UserGroup")});
    //console.log(personas);
    var personaScore = personas.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));
    out += FilterTools.getOutput("Personas", ["Overall Score < 50%"], [personaScore]);


    //Epic == Projects
    var epics = leafNodes.filter(fs => {return (fs["type"] === "Project")});
    //console.log(epics);
    var epicNoDocumentLinks = epics.filter(fs => (FilterTools.noDocumentLinks(fs)));
    //var lifecycle
    var epicNoBusinessValueRisk = epics.filter(fs => (FilterTools.noBusinessValueRisk(fs)));
    var epicNoAffectedDomains = epics.filter(fs => (FilterTools.lackingDomain(fs)));
    var epicNoAffectedUseCases = epics.filter(fs => (FilterTools.lackingUseCases(fs)));
    var epicScore = epics.filter(fs => (FilterTools.getScoreLessThan(fs, .50)));
    out += FilterTools.getOutput("Epics", ["No Document Links", "No Business Value & Risk", "No Affected Domains", 
                        "No Affected Use Cases", "Overall Score < 50%"], [epicNoDocumentLinks, epicNoBusinessValueRisk,
                          epicNoAffectedDomains, epicNoAffectedUseCases, epicScore]);


    //Bounded Context == Application
    var boundedContexts = leafNodes.filter(fs => {return (fs["type"] === "Application")});
    console.log(boundedContexts);
    //var lifecycle
    var boundedContextsNoBusinessCritic = boundedContexts.filter(fs => (FilterTools.noBusinessCritic(fs) || FilterTools.noBusinessCriticDesc(fs)));
    var boundedContextsNoFunctionFit = boundedContexts.filter(fs => (FilterTools.noFunctionFit(fs) || FilterTools.noFunctionFitDesc(fs)));
    var boundedContextsLackingDomain = boundedContexts.filter(fs => (FilterTools.lackingDomain(fs)));
    var boundedContextsLackingUseCases = boundedContexts.filter(fs => (FilterTools.lackingUseCases(fs)));
    var boundedContextsNoOwnerPersona = boundedContexts.filter(fs => (FilterTools.noOwnerPersona(fs)));
    var boundedContextsMultipleOwnerPersona = boundedContexts.filter(fs => (FilterTools.multipleOwnerPersona(fs)));
    var boundedContextsLackingDataObjects = boundedContexts.filter(fs => (FilterTools.lackingDataObjects(fs)));
    var boundedContextsLackingProvidedBehaviors = boundedContexts.filter(fs => (FilterTools.lackingProvidedBehaviors(fs)));
    var boundedContextsNoTechnicalFit = boundedContexts.filter(fs => (FilterTools.noTechnicalFit(fs)));
    var boundedContextsNoSoftwareITComponent = boundedContexts.filter(fs => (FilterTools.lackingSoftwareITComponent(fs)));
    var boundedContextsNoDocumentLinks = boundedContexts.filter(fs => (FilterTools.noDocumentLinks(fs)));
    var boundedContextsScore = boundedContexts.filter(fs => (FilterTools.getScoreLessThan(fs, .70)))

    document.getElementById('accordianReport').innerHTML = out;
    //console.log(document.getElementsByTagName("html"));

    //console.log(noAccountableAndResponsible);
    //console.log(brokenSeal);
    //console.log(notReady);

    //total = 1650
    //leafnodes = 1412
    //noAccountable/Responsible = 1115
    //brokenseal = 1357
    //notReady = 1402

    //FilterTools.getOutput("", "", "");

    //document.getElementById('report').innerHTML = out;
    /*
    var fsTypes = _.keys(this.groups).sort(this.getSortComparer());
    var html = '<table>';
    for (var i = 0; i < fsTypes.length; i++) {
      html += this.getHtmlForFsTypeBar(fsTypes[i])
    }
    html += '</table>';
    html += '<div id="clickOutput"></div>';

    document.getElementById('report').innerHTML = html;
    */
  }


}


/*
, `
... on Application {
  technicalSuitability
}
`, `
... on ITComponent {
  technicalSuitability
}
`
*/