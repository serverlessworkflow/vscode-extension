# Serverless Workflow Specification - VSCode Extension

Provides code hints and snippets for the [CNCF Serverless Workflow Specification](https://github.com/serverlessworkflow/specification)

## Conformance

This plugin conforms to the latest Serverless Workflow specification 
release v0.6

## Features

- [Code Hints](#Code-Hints)
- [Code Snippets](#Code-Snippets)
- [Diagram Generation](#Diagram-Generation)
- [Exporting Diagram to PNG](#Exporting-Diagram-to-PNG)

### Code Hints

This extension provides Code Hints, Snippets, and Diagram generation for Serverless Workflow definitions
(JSON and YAML).

Code hints include:

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
- adding more in the next version

## Requirements

To generate the SVG diagram from the YAML file, you need to have the following tools installed:
- https://www.graphviz.org/download/source/

### Diagram Generation

You can generate the workflow diagram image in SVG format. While working on a workflow, you can preview it by:

- Opening the Command Palette (⇧⌘P or Ctrl + Shift + P)
- Selecting: "Serverless Workflow: Generate Diagram"

It will generate the workflow diagram SVG and present it side-by-side to your workflow source file. It will also create a `myworkflow.svg` file in the same directory as your workflow model. `myworkflow` is the name of your workflow model file (JSON or YAML).

### Exporting Diagram to PNG

Once you have generated the workflow diagram (see the section above), you can right-click on your workflow model file and select from the menu "Serverless Workflow: Export Diagram to PNG”.

Doing this will convert the workflow diagram to PNG and create a `myworkflow.png` file in the same directory as your workflow model.

## Building from source

If you do not want to get this extension from the Marketplace or would like to build and test the latest changes/updates locally, follow these steps:

1. Clone the extension git repository

``` text
git clone https://github.com/serverlessworkflow/vscode-extension.git
cd vscode-extension
```

2. Build the necessary modules

``` text
npm install
```

3. Build and package the extension with `vsce`:

```shell
vsce package
```

To install `vsce` run:

```shell
npm install -g vsce
```

4. `vsce` will create a `serverless-workflow-vscode-extension-$VERSION$.vsix` file which you have to install to your ide, for this run:

```shell
code --install-extension serverless-workflow-vscode-extension-$VERSION$.vsix
```

To uninstall the extension run:

```shell
code --uninstall-extension serverless-workflow-vscode-extension-$VERSION$.vsix
```
