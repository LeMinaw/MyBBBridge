import * as vscode from 'vscode';
import path = require('path');

import { MyBBTemplateSet, MyBBStyle } from "./MyBBThemes";
import { getWorkspacePath, getConfig, getConnexion } from './utils';

async function onSaveEvent(document: vscode.TextDocument) {
    const config = await getConfig();

    if (config.autoUpload) {
        const docPath = document.uri.fsPath;
        const parent1Path = path.dirname(docPath);
        const parent2Path = path.dirname(parent1Path);
        const parent3Path = path.dirname(parent2Path);

        if (parent3Path === getWorkspacePath()) {
            const ext = path.extname(docPath);
            const parent1Dir = path.basename(parent1Path);
            const parent2Dir = path.basename(parent2Path);

            const con = getConnexion(config.database);

            if (parent2Dir === 'template_sets' && ext === '.html') {
                const templateSet = new MyBBTemplateSet(parent1Dir, con, config.database.prefix);
                const fileName = path.basename(docPath, ext); // With extension
                templateSet.saveElement(fileName, document.getText(), config.mybbVersion);

            } else if (parent2Dir === 'styles' && ext === '.css') {
                const style = new MyBBStyle(parent1Dir, con, config.database.prefix);
                const fileName = path.basename(docPath); // Without extension
                style.saveElement(fileName, document.getText(), config.mybbVersion);
            }
        }
    }
    
}


export { onSaveEvent };