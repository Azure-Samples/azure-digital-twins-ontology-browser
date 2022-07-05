# Deployment

This directory contains a Bicep deployment script to deploy the Azure resources required for the sample.

## Prerequisites

Tge following prerequisites must be installed before running the deployment script:

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
- [Bicep](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/install)
- [PowerShell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-windows?view=powershell-core)

## Deployment

To deploy the sample infrastructure you must follow the steps below.

1. In the Visual Studio Code window, open the Bicep folder and run the following command:

  ```powershell
  Connect-AzAccount
  ```
  a browser will open and you will be prompted to login to your Azure account.

2. After you've signed in to Azure, the terminal displays a list of the subscriptions associated with this account.

3. Set the default subscription for all of the Azure PowerShell commands that you run in this session.

```powershell
$context = Get-AzSubscription -SubscriptionName '[your-subscription-name]'
Set-AzContext $context
```
4. Get the subscription ID. Running the following command lists your subscriptions and their IDs.

  ```powershell
  Get-AzSubscription
  ```

5. Set your active subscription to the one you want to deploy the Sample into
  
  ```powershell
  Set-AzContext -SubscriptionId '<subscription-id>'
  ```

6. Create a resource group to deploy the sample into

```powershell
  New-AzResourceGroup -Name '<resource-group-name>' -Location '<location>'
```

7. Set the new resource group to be the active one
  
  ```powershell
  Set-AzDefault -ResourceGroupName '<resource-group-name>'
  ```

7. Deploy the sample

```powershell
  New-AzResourceGroupDeployment -TemplateFile ./deployment.bicep
```

You can verify the deployment by navigating to the resource group in the Azure portal and looking in the "Deployments Blade".

Once you have completed this you will need to deploy the API and UI Container to Azure using the steps below.

[API Deployment](../src/api/README.md#deployment)

[UI Deployment](../src/ui/README.md#deployment)