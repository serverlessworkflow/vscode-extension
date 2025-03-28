import * as vscode from 'vscode';
import * as path from 'path';

import {
  MermaidDiagram,
  Specification,
  Classes
} from '@serverlessworkflow/sdk';

export const diagramViewPanelType = 'serverlessWorkflowDiagramPanel';
export const diagramViewPanelTitle = 'Diagram Preview';
/**
 * Type representing the mode of the diagram panel.
 * - preview: opens a panel and displays the diagram
 * - svg: generates a SVG from the diagram
 * - png: generates a PNG from the diagram
 */
export type DiagramPanelMode = 'preview' | 'svg' | 'png';
/**
 * Options for the diagram panel.
 */
export type DiagramPanelOptions = {
  mode?: DiagramPanelMode
};

let panelContent: string | undefined;

/**
 * Class representing a diagram panel.
 */
export class DiagramPanel {
  #context: vscode.ExtensionContext;
  #panel: vscode.WebviewPanel | undefined;
  #subscriptions: vscode.Disposable[] = [];
  #target: vscode.TextDocument | undefined;
  #disposeEventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  #mode: DiagramPanelMode;
  /** Gets the current @see vscode.TextDocument target */
  get target(): vscode.TextDocument | undefined {
    return this.#target;
  }
  /** Gets the current @see DiagramPanelMode */
  get mode(): DiagramPanelMode {
    return this.#mode;
  }

  /**
   * Instanciates a new @see DiagramPanel
   * @param context The @see vscode.ExtensionContext
   * @param options The @see DiagramPanelOptions to instanciate the panel with
   */
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
        console.log('onDidChangeTextDocument -- diagram');
        if (event.document === this.#target) {
          this.#updateDiagram();
        }
      },
      undefined,
      this.#subscriptions
    );
  }

  /**
   * Event that fires when the panel is disposed.
   */
  public get onDidDispose(): vscode.Event<void> {
    return this.#disposeEventEmitter.event;
  }

  /**
   * Renders the panel with the specified target text document.
   * @param target The target text document.
   */
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
  }

  /**
   * Shows the diagram
   * @returns 
   */
  async focus(): Promise<void> {
    if (!this.#panel) {
      console.warn('No active diagram panel.');
      return;
    }
    this.#panel.reveal(undefined, true);
  }

  /**
   * Disposes the panel.
   */
  dispose() {
    this.#panel?.dispose();
  }

  /**
   * Initializes the panel.
   */
  async #initPanel(): Promise<void> {
    if (panelContent) {
      return;
    }
    const panelFileUri = vscode.Uri.file(path.join(this.#context.extensionPath, 'resources', 'diagram-panel.html'));
    const panelSourceContent = await vscode.workspace.fs.readFile(panelFileUri);
    const decoder = new TextDecoder('utf-8');
    panelContent = decoder.decode(panelSourceContent);
  }

  /**
   * Gets the destination file URI when generating an image.
   * @returns The destination file URI.
   */
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

  /**
   * Saves the diagram to a file.
   * @param buffer The buffer to save.
   */
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

  /**
   * Handles receiving message from the panel.
   * @param message The message received.
   */
  async #onPanelReceiveMessage(message: any): Promise<void> {    
    const { command, ...args } = message;
    switch (command) {
      case 'panel-content-loaded':
        await this.#updateDiagram();
        break;
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
        await vscode.window.showErrorMessage(`An error occured while processing the workflow: ${JSON.stringify(ex)}`);
      }
    }
  }
  
  /**
   * Updates the diagram.
   */
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
      const workflow: Specification.Workflow = Classes.Workflow.deserialize(content);
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