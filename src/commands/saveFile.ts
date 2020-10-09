import * as vscode from 'vscode';
import { Command } from '../commandManager';
import tmp = require('tmp');
import svgexport = require('svgexport');
import fs = require('pn/fs');
import cp = require('copy-paste');
import { SvgDocumentContentProvider } from '../svgProvider';
import { posix } from 'path';

async function saveFileAs(uri: vscode.Uri) {
    let resource = uri;
    const textDocument = await loadTextDocument(resource);
    if (SvgDocumentContentProvider.checkNoSvg(textDocument)) {
        return;
    }
    const text = SvgDocumentContentProvider.addNamespace(textDocument.getText());
    const tmpobj = tmp.fileSync({ 'postfix': '.svg' });
    const pngpath = textDocument.fileName.replace('.svg', '.png');
    exportPng(tmpobj, text, pngpath);
}

async function saveFileAsSize(uri: vscode.Uri) {
    let resource = uri;
    const textDocument = await loadTextDocument(resource);
    if (SvgDocumentContentProvider.checkNoSvg(textDocument)) {
        return;
    }
    const text = SvgDocumentContentProvider.addNamespace(textDocument.getText());
    const tmpobj = tmp.fileSync({ 'postfix': '.svg' });
    const pngpath = textDocument.fileName.replace('.svg', '.png');
    creatInputBox('width')
        .then(width => {
            if (width) {
                creatInputBox('height')
                    .then(height => {
                        if (height) {
                            exportPng(tmpobj, text, pngpath, Number(width), Number(height));
                        }
                    });
            }
        });
}

async function loadTextDocument(resource: vscode.Uri): Promise<vscode.TextDocument> {
    if (!(resource instanceof vscode.Uri)) {
        if (vscode.window.activeTextEditor) {
            resource = vscode.window.activeTextEditor.document.uri;
        }
        if (!(resource instanceof vscode.Uri)) {
            return null;
        }
    }
    return await vscode.workspace.openTextDocument(resource);
}

async function copyDataUri(uri: vscode.Uri) {
    let resource = uri;
    const textDocument = await loadTextDocument(resource);
    if (SvgDocumentContentProvider.checkNoSvg(textDocument)) {
        return;
    }
    const text = textDocument.getText();
    cp.copy('data:image/svg+xml,' + encodeURIComponent(text));
}

export class SaveAsCommand implements Command {
    public readonly id = 'swdiagram.saveas';

    public constructor(
    ) { }

    public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]) {
        for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
            
            var svgPath, svgUri;
            if (uri.path.endsWith(".json")) {
                svgPath = posix.join(uri.path, '..', posix.basename(uri.path, '.json') + '.svg');
            } else {
                // assume its .yml...need to fix at some point
                svgPath = posix.join(uri.path, '..', posix.basename(uri.path, '.yml') + '.svg');
            }

            svgUri = uri.with({ path: svgPath }); 
            saveFileAs(svgUri);
        }
    }
}
export class SaveAsSizeCommand implements Command {
    public readonly id = 'swdiagram.saveassize';

    public constructor(
    ) { }

    public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]) {
        for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
            saveFileAsSize(uri);
        }
    }
}

export class CopyDataUriCommand implements Command {
    public readonly id = 'swdiagram.copydui';

    public constructor(
    ) { }

    public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[]) {
        copyDataUri(mainUri);
    }
}


function exportPng(tmpobj: any, text: string, pngpath: string, w?: number, h?: number) {
    console.log(`export width:${w} height:${h}`);
    fs.writeFile(tmpobj.name, text, 'utf-8')
        .then((_: any) => {
            svgexport.render(
                {
                    'input': tmpobj.name,
                    'output': `${pngpath} pad ${w || ''}${w == null && h == null ? '' : ':'}${h || ''}`
                },
                function (err) {
                    if (!err) {
                        vscode.window.showInformationMessage('export done. ' + pngpath);
                    } else { 
                        vscode.window.showErrorMessage(err);
                    }
                });
        })
        .catch((e: any) => vscode.window.showErrorMessage(e.message));
}

function creatInputBox(param: string): Thenable<string | undefined> {
    return vscode.window.showInputBox({
        prompt: `Set ${param} of the png.`,
        placeHolder: `${param}`,
        validateInput: checkSizeInput
    });
}

function checkSizeInput(value: string): string | null {
    return value !== '' && !isNaN(Number(value)) && Number(value) > 0
        ? null : 'Please set number.';
}