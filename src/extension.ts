'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import { DiagramPanel, DiagramPanelMode } from './diagram-panel';

const supportedExtensions = [ '.json', '.yml', '.yaml' ];

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
	vscode.window.withProgress({
    location: vscode.ProgressLocation.Window,
    cancellable: false,
    title
	}, async() => {
	if (selectionSource && selectedItems) {
		for (let item of selectedItems) {
			const ext = path.extname(item.fsPath);
			if (supportedExtensions.includes(ext)) {
				const target = await vscode.workspace.openTextDocument(item);
				const diagramPanel = new DiagramPanel(context, { mode });
				await diagramPanel.render(target!);
			}
		}
		return;
	}
	else {
		const target = vscode.window.activeTextEditor?.document;
		if (target) {
			const diagramPanel = new DiagramPanel(context, { mode });
			await diagramPanel.render(target);
		}
		return;
	}
});
}

export function activate(context: vscode.ExtensionContext) {

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