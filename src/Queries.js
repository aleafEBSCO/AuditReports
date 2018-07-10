let relToChild = `
relToChild {
  totalCount
}`;

let main = `
type
id
displayName
completion {
  completion
  percentage
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
}`;

function getQuery(factSheetType) {
  let queries = {
    // Domain
    'BusinessCapability': `
    ${main}
    ... on BusinessCapability {
      relBusinessCapabilityToApplication {
        totalCount
      }
      relBusinessCapabilityToProcess {
        totalCount
      }
      ${relToChild}
    }`,
    // Use Case
    'Process': `
    ${main}
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
      ${relToChild}
    }`,
    // Persona
    'UserGroup': `
    ${main}
    ... on UserGroup {
      ${relToChild}
    }`,
    // Epic
    'Project': `
    ${main}
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
      ${relToChild}
    }`,
    // Bounded Context
    'Application': `
    ${main}
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
      ${relToChild}
    }`,
    // Behavior
    'Interface': `
    ${main}
    ... on Interface {
      relInterfaceToProviderApplication {
        totalCount
      }
      relInterfaceToITComponent {
        totalCount
      }
      ${relToChild}
    }`,
    // Data Object
    'DataObject': `
    ${main}
    ... on DataObject {
      relDataObjectToApplication {
        totalCount
      }
      relDataObjectToInterface {
        totalCount
      }
      ${relToChild}
    }`,
    // IT Component
    'ITComponent': `
    ${main}
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
      ${relToChild}
    }`,
    // Provider
    'Provider': `
    ${main}
    ... on Provider {
      ${relToChild}
    }`,
    // Technical Stack
    'TechnicalStack': `
    ${main}
    ... on TechnicalStack {
      ${relToChild}
    }`
  };
  return queries[factSheetType];
}

export default {
  getQuery: getQuery,
}