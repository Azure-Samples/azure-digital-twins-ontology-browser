param resource_location string = resourceGroup().location
param resource_suffix string = resourceGroup().name

var deployment_suffix = uniqueString(resource_suffix)

@description('Azure Cognitive Search Service for Indexing and Searching DTDL ontologies from GitHub')
resource ontologySearch 'Microsoft.Search/searchServices@2021-04-01-preview' = {
  name: 'ontology-search-${deployment_suffix}'
  location: resource_location
  tags: {
    'hidden-title': 'DTDL Ontology Search -${deployment_suffix}'
    'created-by': 'Azure Digital Twins - Ontology Browser Sample'
    'github-repository': 'https://github.com/Azure-Samples/azure-digital-twins-ontology-browser'
  }
  properties: {
    replicaCount: 1
    partitionCount: 1
    hostingMode: 'default'
    publicNetworkAccess: 'enabled'
    networkRuleSet: {
      ipRules: []
      bypass: 'None'
    }
    encryptionWithCmk: {
      enforcement: 'Unspecified'
    }
    disableLocalAuth: false
    authOptions: {
      apiKeyOnly: {
      }
    }
    disabledDataExfiltrationOptions: []
    semanticSearch: 'disabled'
  }
  sku: {
    name: 'standard'
  }
}

@description('Azure App Service Plan for Hosting UI and API App Services')
resource ontologySearchHost 'Microsoft.Web/serverfarms@2021-03-01' = {
  name: 'ontology-search-host-${deployment_suffix}'
  kind: 'linux'
  location: resource_location
  tags: {
    'hidden-title': '${deployment_suffix} DTDL Ontology Search Host'
    'created-by': 'Azure Digital Twins - Ontology Browser Sample'
    'github-repository': 'https://github.com/Azure-Samples/azure-digital-twins-ontology-browser'
  }
  properties: {
    perSiteScaling: false
    elasticScaleEnabled: false
    maximumElasticWorkerCount: 1
    isSpot: false
    reserved: true
    isXenon: false
    hyperV: false
    targetWorkerCount: 0
    targetWorkerSizeId: 0
    zoneRedundant: false
  }
  sku: {
    name: 'B2'
    tier: 'Basic'
    size: 'B2'
    family: 'B'
    capacity: 1
  }
}

@description('Container Registry For the Sample API and UI Applications')
resource ontologySearchContainerRepository 'Microsoft.ContainerRegistry/registries@2022-02-01-preview' = {
  sku: {
    name: 'Basic'
  }
  name: 'ontologyacr${deployment_suffix}'
  location: resource_location
  tags: {
  }
  properties: {
    adminUserEnabled: true
    policies: {
      quarantinePolicy: {
        status: 'disabled'
      }
      trustPolicy: {
        type: 'Notary'
        status: 'disabled'
      }
      retentionPolicy: {
        days: 7
        status: 'disabled'
      }
      exportPolicy: {
        status: 'enabled'
      }
      azureADAuthenticationAsArmPolicy: {
        status: 'enabled'
      }
      softDeletePolicy: {
        retentionDays: 7
        status: 'disabled'
      }
    }
    encryption: {
      status: 'disabled'
    }
    dataEndpointEnabled: false
    publicNetworkAccess: 'Enabled'
    networkRuleBypassOptions: 'AzureServices'
    zoneRedundancy: 'Disabled'
    anonymousPullEnabled: false
  }
}

@description('Azure App Service for Ontology Indexing and Searching API')
resource ontologybrowserapi 'Microsoft.Web/sites@2021-03-01' = {
  name: 'digitaltwin-ontology-browser-api-${deployment_suffix}'
  kind: 'app,linux,container'
  location: resource_location
  tags: {
    'hidden-title': 'Ontology Browser Api'
    'created-by': 'Azure Digital Twins - Ontology Browser Sample'
    'github-repository': 'https://github.com/Azure-Samples/azure-digital-twins-ontology-browser'
  }
  properties: {
    enabled: true
    hostNameSslStates: [
      {
        name: 'digitaltwin-ontology-browser-api-${deployment_suffix}.azurewebsites.net'
        sslState: 'Disabled'
        hostType: 'Standard'
      }
      {
        name: 'digitaltwin-ontology-browser-api-${deployment_suffix}.scm.azurewebsites.net'
        sslState: 'Disabled'
        hostType: 'Repository'
      }
    ]
    serverFarmId: ontologySearchHost.id
    reserved: true
    isXenon: false
    hyperV: false
    siteConfig: {
      numberOfWorkers: 1
      linuxFxVersion: 'DOCKER|${ontologySearchContainerRepository.name}.azurecr.io/ontology-browser-api:latest'
      acrUseManagedIdentityCreds: false
      alwaysOn: false
      http20Enabled: false
      functionAppScaleLimit: 0
      minimumElasticInstanceCount: 0
      appSettings: [
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${ontologySearchContainerRepository.name}.azurecr.io'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: ontologySearchContainerRepository.name
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: '[ACR-ADMIN-PASSWORD-HERE]'
        }
        {
          name: 'GitHubToken'
          value: '[YOUR-GITHUB-PAT-TOKEN]'
        }
        {
          name: 'SearchEndpoint'
          value: 'https://${ontologySearch.name}.search.windows.net'
        }
        {
          name: 'SearchToken'
          value: '[YOUR-SEARCH-SERVICE-TOKEN]'
        }
      ]
    }
    scmSiteAlsoStopped: false
    clientAffinityEnabled: false
    clientCertEnabled: false
    clientCertMode: 'Required'
    hostNamesDisabled: false
    containerSize: 0
    dailyMemoryTimeQuota: 0
    httpsOnly: true
    redundancyMode: 'None'
    storageAccountRequired: false
    keyVaultReferenceIdentity: 'SystemAssigned'
  }
}

@description('React Application for Ontology Browser UI')
resource ontologybrowserui 'Microsoft.Web/sites@2021-03-01' = {
  name: 'digitaltwin-ontology-browser-${deployment_suffix}'
  kind: 'app,linux,container'
  location: resource_location
  tags: {
    'hidden-title': 'Ontology Browser UI'
    'created-by': 'Azure Digital Twins - Ontology Browser Sample'
    'github-repository': 'https://github.com/Azure-Samples/azure-digital-twins-ontology-browser'
  }
  properties: {
    enabled: true
    hostNameSslStates: [
      {
        name: 'digitaltwin-ontology-browser-${deployment_suffix}.azurewebsites.net'
        sslState: 'Disabled'
        hostType: 'Standard'
      }
      {
        name: 'digitaltwin-ontology-browser-${deployment_suffix}.scm.azurewebsites.net'
        sslState: 'Disabled'
        hostType: 'Repository'
      }
    ]
    serverFarmId: ontologySearchHost.id
    reserved: true
    isXenon: false
    hyperV: false
    siteConfig: {
      numberOfWorkers: 1
      linuxFxVersion: 'DOCKER|${ontologySearchContainerRepository.name}.azurecr.io/ontology-browser-ui:latest'   
      acrUseManagedIdentityCreds: false
      alwaysOn: false
      http20Enabled: false
      functionAppScaleLimit: 0
      minimumElasticInstanceCount: 0
      appSettings: [
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${ontologySearchContainerRepository.name}.azurecr.io'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: ontologySearchContainerRepository.name
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: '[ACR-ADMIN-PASSWORD-HERE]'
        }
      ]
    }
    scmSiteAlsoStopped: false
    clientAffinityEnabled: false
    clientCertEnabled: false
    clientCertMode: 'Required'
    hostNamesDisabled: false
    containerSize: 0
    dailyMemoryTimeQuota: 0
    httpsOnly: true
    redundancyMode: 'None'
    storageAccountRequired: false
    keyVaultReferenceIdentity: 'SystemAssigned'
  }
}
