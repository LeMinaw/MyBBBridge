import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import path = require('path');

import { MyBBTemplateSet, MyBBStyle } from "./MyBBThemes";
import { getWorkspacePath, makePath, getConfig, getConnexion } from './utils';


async function loadTemplateSetCommand() {
    const config = await getConfig();
    const con = getConnexion(config.database);

    const templateSetName = await vscode.window.showInputBox({ placeHolder: 'Template set name' });
    if (templateSetName === undefined) {
        return;
    }
    const templateSet = new MyBBTemplateSet(templateSetName, con, config.database.prefix);

    const templateSetPath = path.join(getWorkspacePath(), 'template_sets', templateSet.name);
    await makePath(templateSetPath);

    const templates = await templateSet.getElements();
    templates.forEach(async (template: any) => {
        let templatePath = path.join(templateSetPath, template.title + '.html');
        await fs.writeFile(templatePath, template.template);
    });
    vscode.window.showInformationMessage(`${templates.length} templates were loaded.`);
}


async function loadStyleCommand() {
    const config = await getConfig();
    const con = getConnexion(config.database);

    const styleName = await vscode.window.showInputBox({ placeHolder: 'Style name' });
    if (styleName === undefined) {
        return;
    }
    const style = new MyBBStyle(styleName, con, config.database.prefix);

    const stylePath = path.join(getWorkspacePath(), 'styles', style.name);
    await makePath(stylePath);

    const stylesheets = await style.getElements();
    stylesheets.forEach(async (stylesheet: any) => {
        let stylesheetPath = path.join(stylePath, stylesheet.name + '.css');
        await fs.writeFile(stylesheetPath, stylesheet.stylesheet);
    });
    vscode.window.showInformationMessage(`${stylesheets.length} stylesheets were loaded.`);
}


export { loadTemplateSetCommand, loadStyleCommand };
