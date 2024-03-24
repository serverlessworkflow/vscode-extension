'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { DiagramPanel, DiagramPanelMode } from './diagram-panel';

const supportedExtensions = [ '.json', '.yml', '.yaml' ];
let diagramPanels: Array<DiagramPanel> = [];

/**
 * Creates and registers a diagram panel
 * @param context The current @see vscode.ExtensionContext
 * @param mode The @see DiagramPanelMode
 * @param target The target @see vscode.TextDocument
 */
async function registerDiagramPanel(context: vscode.ExtensionContext, mode: DiagramPanelMode, target: vscode.TextDocument): Promise<void> {
	let diagramPanel: DiagramPanel | undefined = diagramPanels.find(panel => panel.mode === mode && panel.target === target);
	if (diagramPanel) {
		await diagramPanel.focus();
		return;
	}
	diagramPanel = new DiagramPanel(context, { mode });
	diagramPanels.push(diagramPanel);
	diagramPanel.onDidDispose((_) => {
		diagramPanels = diagramPanels.filter(panel => panel !== diagramPanel);
	}, null, context.subscriptions);
	await diagramPanel.render(target!);
}

/**
 * Handles a command used to open/export a diagram
 * @param context The current @see vscode.ExtensionContext
 * @param mode The @see DiagramPanelMode
 * @param selectionSource The explorer menu item the action has been made on
 * @param selectedItems The selected items in the explorer menu
 */
async function handleDiagramCommand(context: vscode.ExtensionContext, mode: DiagramPanelMode, selectionSource?: vscode.Uri, selectedItems?: vscode.Uri[]): Promise<void> {
	let title: string = 'Loading';
	switch (mode) {
		case 'preview':
			title = 'Generating diagram...';
			break;
		case 'svg':
			title = 'Generating SVG...';
			break;
		case 'png':
			title = 'Generating PNG...';
			break;
	}
	vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Window,
			cancellable: false,
			title
		}, 
		async() => {
			if (selectionSource && selectedItems) {
				for (let item of selectedItems) {
					const ext = path.extname(item.fsPath);
					if (supportedExtensions.includes(ext)) {
						const target = await vscode.workspace.openTextDocument(item);
						if (target) {
							registerDiagramPanel(context, mode, target);
						}
					}
				}
				return;
			}
			const target = vscode.window.activeTextEditor?.document;
			if (target) {
				registerDiagramPanel(context, mode, target);
			}
		}
	);
}

/**
 * Activate the extension.
 * @param context The context of the extension.
 */
export function activate(context: vscode.ExtensionContext) {
	// Detects when a file is focused
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if ((editor?.document?.languageId === 'json' || editor?.document?.languageId === 'yaml')
			&& editor?.document?.fileName.includes('.sw.')
		) {
			registerDiagramPanel(context, 'preview', editor?.document /* === vscode.window.activeTextEditor?.document*/);
		}
	}, null, context.subscriptions);
	//Detect when a file is closed
	vscode.workspace.onDidCloseTextDocument(document => {
		diagramPanels.filter(panel => panel.target === document).forEach(panel => panel.dispose());
	}, null, context.subscriptions);
	// Handles commands (palette/right click/keybinding, see package.json for more info)
  context.subscriptions.push(
    vscode.commands.registerCommand('serverlessWorkflow.diagram.preview', handleDiagramCommand.bind(null, context, 'preview'))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('serverlessWorkflow.diagram.svg', handleDiagramCommand.bind(null, context, 'svg'))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('serverlessWorkflow.diagram.png', handleDiagramCommand.bind(null, context, 'png'))
  );
}