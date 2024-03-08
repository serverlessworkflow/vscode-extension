import * as vscode from 'vscode';
import * as path from 'path';

import { MermaidDiagram, Specification } from '@severlessworkflow/sdk-typescript';

export const diagramViewPanelType = 'serverlessWorkflowDiagramPanel';
export const diagramViewPanelTitle = 'Diagram Preview';
export type DiagramPanelMode = 'preview' | 'svg' | 'png';
export type DiagramPanelOptions = {
  mode?: DiagramPanelMode
};

let panelContent: string | undefined;

export class DiagramPanel {
  #context: vscode.ExtensionContext;
  #panel: vscode.WebviewPanel | undefined;
  #subscriptions: vscode.Disposable[] = [];
  #target: vscode.TextDocument | undefined;
  #disposeEventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  #mode: DiagramPanelMode;

  constructor(context: vscode.ExtensionContext, options?: DiagramPanelOptions) {
    this.#context = context;
    this.#mode = options?.mode || 'preview';
    this.#panel = vscode.window.createWebviewPanel(
      diagramViewPanelType,
      diagramViewPanelTitle,
      {
        viewColumn: vscode.ViewColumn.Two,
        preserveFocus: true
      },
      {
        enableScripts: true
      }
    );
    this.#panel.onDidDispose(
      () => {
        this.#subscriptions.forEach(subscription => subscription.dispose());
        this.#panel = undefined;
        this.#disposeEventEmitter.fire();
      },
      undefined,
      context.subscriptions
    );
    this.#panel.webview.onDidReceiveMessage(
      this.#onPanelReceiveMessage.bind(this),
      undefined,
      this.#subscriptions
    );
    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (event.document === this.#target) {
          this.#updateDiagram();
        }
      },
      undefined,
      this.#subscriptions
    );
  }

  public get onDidDispose(): vscode.Event<void> {
    return this.#disposeEventEmitter.event;
  }
  
  async render(target: vscode.TextDocument): Promise<void> {
    if (!this.#panel) {
      console.warn('No active diagram panel.');
      return;
    }
    this.#target = target;
    const fileName = path.basename(target.uri.fsPath);
    this.#panel.title = `${diagramViewPanelTitle}: ${fileName}`;
    await this.#initPanel();
    this.#panel.reveal(undefined, true);
    if (!panelContent) {
      console.warn('Unable to initialize the panel content.');
      return;
    }
    this.#panel.webview.html = panelContent;
    await this.#updateDiagram();
  }

  dispose() {
    this.#panel?.dispose();
  }

  async #initPanel(): Promise<void> {
    if (panelContent) {
      return;
    }
    const panelFileUri = vscode.Uri.file(path.join(this.#context.extensionPath, 'resources', 'diagram-panel.html'));
    const panelSourceContent = await vscode.workspace.fs.readFile(panelFileUri);
    const decoder = new TextDecoder('utf-8');
    panelContent = decoder.decode(panelSourceContent);
  }

  #getFileDestination(): vscode.Uri | undefined {
    if (!this.#target) {
      return;
    }
    const targetPath = this.#target.uri.fsPath || this.#target.uri.path;
    const targetDirectory = targetPath.includes(path.sep) ? path.dirname(targetPath) : vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!targetDirectory) {
      return;
    }
    const targetFile = path.basename(targetPath);
    const targetExt = path.extname(targetFile);
    const destinationExt = '.' + this.#mode;
    const destinationFile = !targetExt ? targetFile + destinationExt : targetFile.replace(targetExt, destinationExt);
    const destination = vscode.Uri.file(path.join(
      targetDirectory,
      destinationFile
    ));
    return destination;
  }

  async #saveToFile(buffer: Buffer): Promise<void> {
    try {
      let destination = this.#getFileDestination();
      if (!destination) {
        destination = await vscode.window.showSaveDialog({ filters: { ['.' + this.#mode] : [this.#mode] }});
        if (!destination) {
          await vscode.window.showWarningMessage('Cannot determine the destination, skipping export.');
          this.dispose();
          return;
        }
      }
      await vscode.workspace.fs.writeFile(destination, buffer);
    }
    catch (ex) {
      await vscode.window.showErrorMessage(`Unable to save diagram to file: ${JSON.stringify(ex)}`);
    }
    this.dispose();
  }

  async #onPanelReceiveMessage(message: any): Promise<void> {    
    const { command, ...args } = message;
    switch (command) {
      case 'diagram-rendered': {
        if (this.#mode === 'png') {
          await this.#panel?.webview.postMessage({
            command: 'generate-png'
          });
          return;
        }
        else if (this.#mode === 'svg') {
          const { svg } = args;
          const buffer = Buffer.from(svg, 'utf8');
          await this.#saveToFile(buffer);
        }
        break;
      }
      case 'png-generated': {
        const { png } = args;        
        const buffer = Buffer.from(png, 'base64');
        await this.#saveToFile(buffer);
        break;
      }
      case 'rendering-exception':
      case 'general-exception':
      {
        const { ex } = args;
        await vscode.window.showErrorMessage(`An error occured while processing the workflow: ${JSON.stringify(ex)}`)
      }
    }
  }

  async #updateDiagram(): Promise<void> {
    if (!this.#panel) {
      console.warn('No active diagram panel.');
      return;
    }
    if (!this.#target) {
      console.warn('Cannot update diagram of an unknown target.');
      return;
    }
    const content = this.#target.getText();
    if (!content) {
      console.warn('Cannot update diagram of an empty target.');
      return;
    }
    let graphDefinition: string | undefined;
    try {
      const workflow: Specification.Workflow = Specification.Workflow.fromSource(content);
      graphDefinition = new MermaidDiagram(workflow).sourceCode();
    }
    catch (ex) {
      console.warn('An exception occured while parsing the workflow or generating its diagram.', ex);
      await vscode.window.showErrorMessage(`The ServerlessWorkflow SDK couldn't process the workflow: ${ex}`);
      return;
    }
    if (!graphDefinition) {
      console.warn('Failed to build graph definition');
      await vscode.window.showErrorMessage(`The ServerlessWorkflow SDK generated an empty diagram.`);
      return;
    }
    if (!this.#panel.visible) {
      this.#panel.reveal(undefined, true);
    }
    await this.#panel.webview.postMessage({
      command: 'update-diagram',
      graphDefinition
    });
  }

}