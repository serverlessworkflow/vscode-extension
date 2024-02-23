# Serverless Workflow Specification - VSCode Extension

Provides code hints and snippets for the [CNCF Serverless Workflow Specification](https://github.com/serverlessworkflow/specification)

## Conformance

This plugin conforms to the latest [Serverless Workflow specification](https://serverlessworkflow.io/schemas/latest/workflow.json).

## Features

- [Code Hints](#Code-Hints)
- [Code Snippets](#Code-Snippets)
- [Preview Workflow Diagram](#Preview-Workflow-Diagram)
- [Exporting Diagram to SVG or PNG](#Exporting-Diagram-to-PNG)

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

### Preview Workflow Diagram

You can preview the workflow diagram while working on a workflow:

- Opening the Command Palette (⇧⌘P or Ctrl + Shift + P)
- Selecting: "Serverless Workflow: Preview Diagram"

Or by using the hotkey `alt+shift+s p`

You can also generate a preview for multiple files by selecting them in the explorer, right-click and select from the menu "Serverless Workflow: Preview Diagram"

### Exporting Diagram to SVG or PNG

Similarly to the preview, you can output the diagram to either SVG or PNG format.

The commands are "Serverless Workflow: Export Diagram to SVG" (`alt+shift+s v`) or "Serverless Workflow: Export Diagram to PNG" (`alt+shift+s i`), available in the command palette or by right clicking the files.


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
