# Serverless Workflow Specification - VSCode Extension

Provides code hints and snippets for the [CNCF Serverless Workflow Specification](https://github.com/serverlessworkflow/specification)

## Features

### Code Hints

This extension provides Code Hints for JSON and YAML files in your project against the
Serverless Workflow specification schema.
This includes:

- Prompting correct attribute names as you type.
- Displaying of mismatched types or missing required properties
- Allows use of Ctrl+Space to show available properties
- Code completion even for enum types

Note that to enable the YAML code completion support, you must 
install the [VSCode YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) first.

### Code Snippets

This extension also provides Code Snippets for the serverless workflow specification markup:

- swn: Create a new workflow definition
- adding more in next version

## Building from source

If you do not want to get this extension from the Marketplace or would like to build and test
the latest changes/updates locally follow these steps:

1. Clone the extension git repository

```
git clone https://github.com/serverless-workflow/workflow-schema-vscode.git
cd workflow-schema-vscode
```

2. Build the necessary modules

```
npm install
```

3. Build and package the extension with vsce:

```
vsce package
```

To install vsce run:

```
npm install -g vsce
```

4. vsce will create a workflow-schema-vscode-$VERSION$.vsix file which you have to install to your ide, for this run:

```
code --install-extension workflow-schema-vscode-$VERSION$.vsix
```

to uninstall the extension run:

```
code --uninstall-extension workflow-schema-vscode-$VERSION$.vsix
```

## Contributing

This extension is open-source and free to use to anyone.
All/any contributions are very welcome and much needed in order to make this extension much better.
Best way to contribute is to create Pull Request(s) on the github project.
