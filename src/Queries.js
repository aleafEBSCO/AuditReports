var main = `
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
    }`;

var useCaseExtraData = `{
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

var epicExtraData = `{
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

var boundedContextExtraData = `{
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

var ITComponentExtraData = `{
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
    main: main,
    useCaseExtraData: useCaseExtraData,
    epicExtraData: epicExtraData,
    boundedContextExtraData: boundedContextExtraData,
    ITComponentExtraData: ITComponentExtraData
}