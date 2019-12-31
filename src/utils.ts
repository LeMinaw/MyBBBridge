import * as vscode from 'vscode';
import * as mysql from 'mysql';
import { promises as fs, PathLike } from 'fs';
import path = require('path');


function timestamp(): number {
    return Math.floor(Date.now() / 1000);
}


function getWorkspacePath() {
    if (vscode.workspace.workspaceFolders) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
        vscode.window.showErrorMessage("No workspace opened!");
    }
    return '';
}


async function makePath(path: PathLike) {
    try {
        await fs.mkdir(path, { 'recursive': true });
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
}


export function urlJoin(urlParts: string[]): string {
    return urlParts
        .map(part => {
            const part2 = part.endsWith('/') ? part.substring(0, part.length - 1) : part;
            return part2.startsWith('/') ? part2.substr(1) : part2;
        })
        .join('/');
}


async function getConfig() {
    const configFilePath = path.join(getWorkspacePath(), '.vscode', 'mbbb.json');
    let configFile: Buffer;
    try {
        configFile = await fs.readFile(configFilePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            vscode.window.showErrorMessage('Config file not found! Try using "Create config file" command.');
            return;
        }
        throw err;
    }
    return JSON.parse(configFile.toString());
}


function getConnexion(dbConfig: any) {
    return mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password
    });
}


export { getWorkspacePath, makePath, getConfig, getConnexion, timestamp };