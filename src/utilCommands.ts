import * as vscode from 'vscode';
import { promises as fs, PathLike } from 'fs';
import path = require('path');

import { getWorkspacePath } from './utils';


async function createConfigCommand() {
    // Get current workspace path
    const workspacePath = getWorkspacePath();
    
    // Get or create .vscode dir
    let configFilePath = path.join(workspacePath, '.vscode');
    try {
        await fs.mkdir(configFilePath);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }

    // Create config file if not already existing
    configFilePath = path.join(configFilePath, 'mbbb.json');
    try {
        await fs.access(configFilePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            const defaultConf = JSON.stringify({
                "database": {
                    "host": "localhost",
                    "port": 3306,
                    "database": "mybb",
                    "prefix": "mybb_",
                    "user": "root",
                    "password": ""
                },
                "mybb_version": 1860
            }, null, 4);

            await fs.writeFile(configFilePath, defaultConf);
            vscode.window.showInformationMessage(`Config file ${configFilePath} created sucessfully.`);
            return;
        }
        throw err;
    }
    vscode.window.showErrorMessage(`Config file ${configFilePath} already exists!`);
}


export { createConfigCommand };
