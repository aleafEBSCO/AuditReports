function getQuery(factSheetType) {
  let all = `
  type
  id
  displayName
  subscriptions {
    edges {
      node {
        type
        user {
          displayName
        }
      }
    }
  }
  qualitySeal
  tags {
    tagGroup {
      name
    }
    name
  }`;

  let queries = {
    // All fact sheets
    'All': `
    {
      allFactSheets {
        edges {
          node {
            ${all}
          }
        }
      }
    }`,
    // Domain
    'BusinessCapability': `
    {
      allFactSheets(factSheetType: BusinessCapability) {
        edges {
          node {
            ${all}
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
        }
      }
    }`,
    // Use Case
    'Process': `
    {
      allFactSheets(factSheetType: Process) {
        edges {
          node {
            ${all}
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
        }
      }
    }`,
    // Persona
    'Persona': `
    {
      allFactSheets(factSheetType: UserGroup) {
        edges {
          node {
            ${all}
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
        }
      }
    }`,
    // Epic
    'Project': `
    {
      allFactSheets(factSheetType: Project) {
        edges {
          node {
            ${all}
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
        }
      }
    }`,
    // Bounded Context
    'Application': `
    {
      allFactSheets(factSheetType: Application) {
        edges {
          node {
            ${all}
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
        }
      }
    }`,
    // Behavior
    'Interface': `
    {
      allFactSheets(factSheetType: Interface) {
        edges {
          node {
            ${all}
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
        }
      }
    }`,
    // Data Object
    'DataObject': `
    {
      allFactSheets(factSheetType: DataObject) {
        edges {
          node {
            ${all}
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
        }
      }
    }`,
    // IT Component
    'ITComponent': `
    {
      allFactSheets(factSheetTypes: ITComponent) {
        edges {
          node {
            ${all}
            relITComponentToProvider {
              totalCount
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
        }
      }
    }`,
    // Provider
    'Provider': `
    {
      allFactSheets(factSheetType: Provider) {
        edges {
          node {
            ${all}
            relToChild {
              totalCount
            }
            relToParent {
              totalCount
            }
          }
        }
      }
    }`,
    // Technical Stack
    'TechnicalStack': `
    {
      allFactSheets(factSheetType: TechnicalStack) {
        edges {
          node {
            ${all}
            relToChild {
              totalCount
            }
            relToParent {
              totalCount
            }
          }
        }
      }
    }`
  };
  return queries[factSheetType];
}

var useCaseExtraData = `
{
  allFactSheets(factSheetType: Process) {
    edges {
      node {
        type
        id
        displayName
        ... on Process {
          lifecycle {
            phases {
              phase
            }
          }
          relToChild {
            totalCount
          }
          relToParent {
            totalCount
          }
        }
      }
    }
  }
}`;

var epicExtraData = `
{
  allFactSheets(factSheetType: Project) {
    edges {
      node {
        type
        id
        displayName
        ... on Project {
          lifecycle {
            phases {
              phase
            }
          }
          relToChild {
              totalCount
            }
            relToParent {
              totalCount
            }
        }
      }
    }
  }
}`;

var boundedContextExtraData = `
{
  allFactSheets(factSheetType: Application) {
    edges {
      node {
        type
        id
        displayName
        ... on Application {
          lifecycle {
            phases {
              phase
            }
          }
          technicalSuitability
          technicalSuitabilityDescription
          relToChild {
              totalCount
            }
            relToParent {
              totalCount
            }
        }
      }
    }
  }
}`;

var ITComponentExtraData = `
{
  allFactSheets(factSheetType: ITComponent) {
    edges {
      node {
        type
        id
        displayName
        ... on ITComponent {
          lifecycle {
            phases {
              phase
            }
          }
          technicalSuitability
          technicalSuitabilityDescription
          relToChild {
              totalCount
            }
            relToParent {
              totalCount
            }
        }
      }
    }
  }
}`;

export default {
  getQuery: getQuery,
  useCaseExtraData: useCaseExtraData,
  epicExtraData: epicExtraData,
  boundedContextExtraData: boundedContextExtraData,
  ITComponentExtraData: ITComponentExtraData
}