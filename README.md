# Serverless Workflow Specification - VSCode Extension

Provides code hints and snippets for the [CNCF Serverless Workflow Specification](https://github.com/serverlessworkflow/specification)

## Features

- [Code Hints](#Code-Hints)
- [Code Snippets](#Code-Snippets)
- [Diagram Generation](#Diagram-Generation)
- [Exporting Diagram to PNG](#Exporting-Diagram-to-PNG)

### Code Hints

This extension provides Code Hints for JSON and YAML files in your project against the
Serverless Workflow specification schema.
This includes:

- Prompting correct attribute names as you type.
- Displaying of mismatched types or missing required properties
- Allows use of Ctrl+Space to show available properties
- Code completion for enum types

Note that to enable the YAML code completion support, you must 
install the [VSCode YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) first.

### Code Snippets

This extension also provides Code Snippets for the serverless workflow specification markup:

- swj: Create a new JSON workflow definition
- swy: Create a new YAML workflow definition
- adding more in next version

### Diagram Generation

  You can generate the workflow diagram SVG (and preview it). While working on a workflow Json or Yaml files you can 
  preview it by:

  - Open the Command Pallelte (⇧⌘P)
  - Select: "Serverless Workflow: Generate Diagram"
  
  This will generate the workflow diagram SVG and present it side-by-side to your workflow source file.
  In addition it will generate a `myworkflow.svg` file in the same directory as your workflow model where `myworkflow` here is 
  the name of your workflow model file (json or yaml).

### Exporting Diagram to PNG
    
    Once you have generated the workflow diagram (see section above) you can right-click on your workflow model (json or yaml) 
    file and select from the menu "Serverless Workflow: Export Diagram to PNG".
    
    This will convert the workflow diagram to PNG and also create a `myworkflow.png` file in the same directory as your workflow model where `myworkflow` here is the name of your workflow model file (json or yaml).


## Building from source

If you do not want to get this extension from the Marketplace or would like to build and test
the latest changes/updates locally follow these steps:

1. Clone the extension git repository

``` text
git clone https://github.com/serverlessworkflow/vscode-extension.git
cd vscode-extension
```

2. Build the necessary modules

``` text
npm install
```

3. Build and package the extension with vsce:

``` text
vsce package
```

To install vsce run:

``` text
npm install -g vsce
```

4. vsce will create a serverless-workflow-vscode-extension-$VERSION$.vsix file which you have to install to your ide, for this run:

``` text
code --install-extension serverless-workflow-vscode-extension-$VERSION$.vsix
```

to uninstall the extension run:

``` text
code --uninstall-extension serverless-workflow-vscode-extension-$VERSION$.vsix
```
