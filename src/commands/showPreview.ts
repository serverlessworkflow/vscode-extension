import * as vscode from 'vscode';

import { Command } from '../commandManager';
import { SvgWebviewManager } from '../features/svgWebviewManager';
import { Configuration } from '../configuration';
import { SvgDocumentContentProvider } from '../svgProvider';
import { posix } from 'path';
const http = require('http');
const fs = require('fs');

var resSvg = '';

async function showPreview(
    webviewManager: SvgWebviewManager,
    uri: vscode.Uri
) {
    let resource = uri;
    if (!(resource instanceof vscode.Uri)) {
        if (vscode.window.activeTextEditor) {
            resource = vscode.window.activeTextEditor.document.uri;
        }
        if (!(resource instanceof vscode.Uri)) { return; }
    }
    const textDocument = await vscode.workspace.openTextDocument(resource);

    const workflowUri = resource;
    var svgPath;

    if (workflowUri.path.endsWith(".json")) {
        svgPath = posix.join(workflowUri.path, '..', posix.basename(workflowUri.path, '.json') + '.svg');

        getSvgData(Configuration.diagramserviceurl(), textDocument.getText().length, textDocument.getText(), "application/json");
        await new Promise(resolve => setTimeout(resolve, 3000));
    

    } else {
        // assume its .yml...need to fix at some point
        svgPath = posix.join(workflowUri.path, '..', posix.basename(workflowUri.path, '.yml') + '.svg');

        getSvgData(Configuration.diagramserviceurl(), textDocument.getText().length, textDocument.getText(), "text/x-yaml");
        await new Promise(resolve => setTimeout(resolve, 3000));

    }

    const svgUri = workflowUri.with({ path: svgPath });
    const writeData = Buffer.from(resSvg, 'utf8');
   
    fs.writeFile(svgUri.path, writeData, function (err,data) {
        if (err) {
            vscode.window.showErrorMessage("Unable to write to SVG file: " + err);
        }
        vscode.window.showInformationMessage("Successfully wrote SVG diagram to file.");
      });


    const resourceColumn = (vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One;

    webviewManager.view(svgUri, {
        resourceColumn: resourceColumn,
        viewColumn: Configuration.viewColumn()
    });
}

function getSvgData(url = '', datalength = 0, data = '', ctype = '') {
    resSvg = '';
    const options = {
        hostname: url,
        path: '/swdiagram',
        method: 'POST',
        headers: {
            'Content-Type': ctype,
            'Content-Length': datalength
        }
    };

    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            resSvg += d;
        });
    });

    req.on('error', error => {
        vscode.window.showErrorMessage("ERROR: " + error);
    });

    req.write(data);
    req.end();

}

export class ShowPreviewCommand implements Command {
    public readonly id = 'swdiagram.open';

    public constructor(
        private readonly webviewManager: SvgWebviewManager
    ) {

        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (Configuration.enableAutoPreview()
                && editor && !SvgDocumentContentProvider.checkNoSvg(editor.document, false)) {
                vscode.commands.executeCommand(this.id, editor.document.uri);
            }
        });
    }

    public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]) {
        for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
            showPreview(this.webviewManager, uri);
        }
    }
}