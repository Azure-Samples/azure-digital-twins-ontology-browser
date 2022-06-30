# Azure Digital Twins Ontology Index

This repository contains a web API which attempts to suggest DTMI models and ontologies for the Azure Digital Twins platform.

## Getting Started

In order to run this application locally you will need to populate the following properties in the appsettings.json or appsetttings.Development.json file:

  "GitHubToken":"[A GITHUB PAT TOKEN]",
  "SearchToken":"[A SEARCH TOKEN FROM YOUR AZURE COGNITIVE SEARCH]",
  "SearchEndpoint":"[THE URL FOR YOUR AZURE COGNITIVE SEARCH]",

## Deployment

To Deploy the API to Azure you must first follow the steps in the [deployment](../../deployment/README.md) directory.

Once this is done you can deploy the API Container to Azure using the steps below.

1. Login to your azure container registry

    ```cmd
    docker login yourregistry.azurecr.io
    ```

2. Build the API Container

    ```cmd
    docker build -t yourregistry.azurecr.io/ontology-browser-api:latest .
    ```

3. Push the image to the container registry

    ```cmd
    docker push yourregistry.azurecr.io/ontology-browser-api:latest
    ```

4. Restart the API App Service in the Azure Portal



5. To access the API, navigate to the following URL:

    ```cmd
    https://your-api.azurewebsites.net/swagger
    ```

Once deployed the API initiates an ontology index and indexes all ontologies found on Github in the Azure Cognitive Search. This may take a minute or two - you can see the state of the indexes by navigating to the following URL:

    ```cmd
    https://your-api.azurewebsites.net/indexStatus
    ```