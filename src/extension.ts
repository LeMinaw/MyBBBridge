import * as vscode from 'vscode';

import { loadTemplateSetCommand, loadStyleCommand } from "./loadCommands";
import { createConfigCommand } from "./utilCommands";


export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.loadTemplateSet', loadTemplateSetCommand)
	);
	
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.loadStyle', loadStyleCommand)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.createConfig', createConfigCommand)
	);
}


export function deactivate() {}
