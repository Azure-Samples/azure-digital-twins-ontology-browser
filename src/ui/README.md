# Ontology Search

A React Application to Search Azure Digital Twin Ontologies

## Getting Started

Before running the application you will need to populate the [environment variables](#env-file-parameters) in the .env file.

To run this project in dev mode, run the following command:

```cmd
npm start
```
This will start the application in development mode (http://localhost:3000).

## Scripts

Inside this directory run using npm or yarn:

**start** - runs the app in the development mode. Open http://localhost:3000 to view it in the browser.  
**test** - launches the test runner in the interactive watch mode.  
**build** - builds the app for production to the [./server/build](./server/build) folder.  
**eject** - exposes content of react-script package  


## .env file parameters

| Parameter | Description |
|-----------|-------------|
| REACT_APP_ontology_url | The url for the ontology server including trailing / e.g. https://digitaltwins-ontologies.azurewebsites.net/ |
| REACT_APP_TITLE | The title of the application. |

## Deployment

Make sure the host of this application is included in the CORS settings for the ontology api server.

Then run the following commands to deploy the application to Azure:


1. Login to your azure container registry

    ```cmd
    docker login yourregistry.azurecr.io
    ```

2. Build the API Container

    Build The React Application First.

    ```cmd
    npm run build
    ```

    Then Containerize the application

    ```cmd
    docker build -t yourregistry.azurecr.io/ontology-browser-ui:latest .
    ```

3. Push the image to the container registry

    ```cmd
    docker push yourregistry.azurecr.io/ontology-browser-ui:latest
    ```

4. Restart the API App Service in the Azure Portal


5. To access the Application, navigate to the following URL:

    ```cmd
    https://your-api.azurewebsites.net/
    ```


