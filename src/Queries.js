function getQuery(factSheetType) {
  let relToChildParent = `
  relToChild {
    totalCount
  }
  relToParent {
    totalCount
  }`;

  // TODO: Get rid of horrendous relToChildParent hack
  let all = `
  type
  id
  displayName
  completion {
    completion
  }
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
  }
  ... on BusinessCapability {
    ${relToChildParent}
  }
  ... on Process {
    ${relToChildParent}
  }
  ... on UserGroup {
    ${relToChildParent}
  }
  ... on Project {
    ${relToChildParent}
  }
  ... on Application {
    ${relToChildParent}
  }
  ... on Interface {
    ${relToChildParent}
  }
  ... on DataObject {
    ${relToChildParent}
  }
  ... on ITComponent {
    ${relToChildParent}
  }
  ... on Provider {
    ${relToChildParent}
  }
  ... on TechnicalStack {
    ${relToChildParent}
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
            ... on BusinessCapability {
              relBusinessCapabilityToApplication {
                totalCount
              }
              relBusinessCapabilityToProcess {
                totalCount
              }
              ${relToChildParent}
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
            ... on Process {
              lifecycle {
                phases {
                  phase
                }
              }
              relProcessToBusinessCapability {
                totalCount
              }
              documents {
                totalCount
              }
              relProcessToApplication {
                totalCount
              }
              ${relToChildParent}
            }
          }
        }
      }
    }`,
    // Persona
    'UserGroup': `
    {
      allFactSheets(factSheetType: UserGroup) {
        edges {
          node {
            ${all}
            ... on UserGroup {
              ${relToChildParent}
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
            ... on Project {
              lifecycle {
                phases {
                  phase
                }
              }
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
              ${relToChildParent}
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
            ... on Application {
              lifecycle {
                phases {
                  phase
                }
              }
              technicalSuitability
              technicalSuitabilityDescription
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
              ${relToChildParent}
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
            ... on Interface {
              relInterfaceToProviderApplication {
                totalCount
              }
              relInterfaceToITComponent {
                totalCount
              }
              ${relToChildParent}
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
            ... on DataObject {
              relDataObjectToApplication {
                totalCount
              }
              relDataObjectToInterface {
                totalCount
              }
              ${relToChildParent}
            }
          }
        }
      }
    }`,
    // IT Component
    'ITComponent': `
    {
      allFactSheets(factSheetType: ITComponent) {
        edges {
          node {
            ${all}
            ... on ITComponent {
              lifecycle {
                phases {
                  phase
                }
              }
              technicalSuitability
              technicalSuitabilityDescription
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
              ${relToChildParent}
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
            ... on Provider {
              ${relToChildParent}
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
            ... on TechnicalStack {
              ${relToChildParent}
            }
          }
        }
      }
    }`
  };
  return queries[factSheetType];
}

export default {
  getQuery: getQuery,
}