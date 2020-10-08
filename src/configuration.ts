import * as vscode from 'vscode';
import { ViewColumn } from 'vscode';

export class Configuration {
    public static viewColumn(): vscode.ViewColumn {
        switch (vscode.workspace.getConfiguration('swdiagram').get('previewcolumn')) {
            case "Active": return ViewColumn.Active;
            case "Beside": return ViewColumn.Beside;
            default: return ViewColumn.Beside;
        }
    }

    public static diagramserviceurl() : string {
        return vscode.workspace.getConfiguration('swdiagram').get('diagramserviceurl'); 
    }

    public static showTransGrid(): boolean {
        return vscode.workspace.getConfiguration('swdiagram').get<boolean>('transparencygrid');
    }

    public static transparencyColor(): string {
        return vscode.workspace.getConfiguration('swdiagram').get('transparencycolor');
    }

    public static enableAutoPreview(): boolean {
        return vscode.workspace.getConfiguration('swdiagram').get<boolean>('enableautopreview');
    }

    public static enableAutoInsertNamespace(): boolean {
        return vscode.workspace.getConfiguration('swdiagram').get<boolean>('autoInsertNamespace');
    }
}