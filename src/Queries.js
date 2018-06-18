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
    // All fact sheets
    'All': all,
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
      ${relToChildParent}
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
      ${relToChildParent}
    }`,
    // Persona
    'UserGroup': `
    ${main}
    ... on UserGroup {
      ${relToChildParent}
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
      ${relToChildParent}
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
      ${relToChildParent}
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
      ${relToChildParent}
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
      ${relToChildParent}
    }`,
    // Provider
    'Provider': `
    ${main}
    ... on Provider {
      ${relToChildParent}
    }`,
    // Technical Stack
    'TechnicalStack': `
    ${main}
    ... on TechnicalStack {
      ${relToChildParent}
    }`
  };
  return queries[factSheetType];
}

export default {
  getQuery: getQuery,
  all
}