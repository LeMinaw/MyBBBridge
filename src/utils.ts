import * as vscode from 'vscode';
import * as mysql from 'mysql';
import { promises as fs, PathLike } from 'fs';
import path = require('path');


export function timestamp(): number {
    return Math.floor(Date.now() / 1000);
}


export function getWorkspacePath(): string {
    if (vscode.workspace.workspaceFolders) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
        vscode.window.showErrorMessage("No workspace opened!");
    }
    return '';
}


export async function makePath(path: PathLike): Promise<void> {
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


export async function getConfig(): Promise<any> {
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


export function getConnexion(dbConfig: any): mysql.Connection {
    return mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password
    });
}