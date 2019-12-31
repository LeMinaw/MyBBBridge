import * as vscode from 'vscode';
import * as mysql from 'mysql';
import * as request from 'request-promise-native';

import { timestamp, urlJoin, getConfig } from './utils';


abstract class MyBBSet {
    name: string;
    con: mysql.Connection;
    prefix: string;

    public constructor(name:string, con: mysql.Connection, prefix: string='mybb_') {
        this.name = name;
        this.con = con;
        this.prefix = prefix;
    }

    public getTable(name:string): string {
        return this.prefix + name;
    }

    public query(req: string, params: any[], callback: any=()=>{}): any {
        return new Promise((resolve, reject) => {
            this.con.query(req, params, (err: any, result: any) => {
                if (err) {
                    vscode.window.showErrorMessage(err.message);
                    return reject(err);
                }
                callback(err, result);
                return resolve(result);
            });
        });
    }
}


class MyBBTemplateSet extends MyBBSet {
    sid: number|undefined;

    private async getSid(): Promise<number|undefined> {
        const res = await this.query(
            'SELECT sid FROM ?? WHERE title=?',
            [this.getTable('templatesets'), this.name],
            (err: any, result: any) => {
                if (!result.length) {
                    vscode.window.showErrorMessage(`Can't find template ${this.name}!`);
                }
            }
        );
        this.sid = res[0].sid;
        return this.sid;
    }

    public async getElements(): Promise<any> {
        await this.getSid();
        const templates = await this.query(
            'SELECT title, template FROM ?? WHERE sid=? ORDER BY sid DESC, title ASC',
            [this.getTable('templates'), this.sid],
            (err: any, result: any) => {
                if (!result.length) {
                    vscode.window.showErrorMessage(`No templates files found for template ${this.name}!`);
                } 
            }
        );
        return templates;
    }

    public async saveElement(name: string, content: string, version: number) {
        await this.getSid();

        const res = await this.query(
            'SELECT tid FROM ?? WHERE title=? AND sid=?',
            [this.getTable('templates'), name, this.sid],
        );

        if (!res.length) { // Insert
            this.query(
                'INSERT INTO ?? SET title=?, template=?, sid=?, version=?',
                [this.getTable('templates'), name, content, this.sid, version],
                (err: any, result: any) => {
                    if (!err) {
                        vscode.window.showInformationMessage(`Uploaded new template ${name} in DB.`);
                    }
                }
            );
        } else { // Update
            this.query(
                'UPDATE ?? SET template=? WHERE title=? AND sid=?',
                [this.getTable('templates'), content, name, this.sid],
                (err: any, result: any) => {
                    if (!err) {
                        vscode.window.showInformationMessage(`Updated template ${name} in DB.`);
                    }
                }
            );
        }
    }
}


class MyBBStyle extends MyBBSet {
    tid: number|undefined;

    private async getTid() {
        const res = await this.query(
            'SELECT tid FROM ?? WHERE name=?',
            [this.getTable('themes'), this.name],
            (err: any, result: any) => {
                if (!result.length) {
                    vscode.window.showErrorMessage(`Can't find theme ${this.name}!`);
                }
            }
        );
        this.tid = res[0].tid;
        return this.tid;
    }

    private async getSid(name: string) {
        await this.getTid();
        const res = await this.query(
            'SELECT sid FROM ?? WHERE name=? AND tid=?',
            [this.getTable('themestylesheets'), name, this.tid]
        );
        return res[0].sid;
    }

    public async getElements() {
        await this.getTid();
        const stylesheets = await this.query(
            'SELECT name, stylesheet FROM ?? WHERE tid=? ORDER BY tid DESC, name ASC',
            [this.getTable('themestylesheets'), this.tid],
            (err: any, result: any) => {
                if (!result.length) {
                    vscode.window.showErrorMessage(`No stylesheets files found for theme ${this.name}!`);
                } 
            }
        );
        return stylesheets;
    }

    public async saveElement(name: string, content: string, version: number) {
        await this.getTid();

        const res = await this.query(
            'SELECT sid FROM ?? WHERE name=? AND tid=?',
            [this.getTable('themestylesheets'), name, this.tid],
        );

        if (!res.length) { // Insert
            this.query(
                'INSERT INTO ?? SET name=?, stylesheet=?, tid=?, lastmodified=?',
                [this.getTable('themestylesheets'), name, content, this.tid, timestamp()],
                (err: any, result: any) => {
                    if (!err) {
                        vscode.window.showInformationMessage(`Uploaded new stylesheet ${name} in DB.`);
                    }
                }
            );
        } else { // Update
            this.query(
                'UPDATE ?? SET stylesheet=?, lastmodified=? WHERE name=? AND tid=?',
                [this.getTable('themestylesheets'), content, timestamp(), name, this.tid],
                (err: any, result: any) => {
                    if (!err) {
                        vscode.window.showInformationMessage(`Updated stylesheet ${name} in DB.`);
                        this.requestCacheRefresh(name);
                    }
                }
            );
        }
    }

    public async requestCacheRefresh(name: string): Promise<void> {
        const config = await getConfig();

        if (config.mybbUrl) {
            const scriptUrl = urlJoin([config.mybbUrl, 'cachecss.php']);

            request
                .get({
                    uri: scriptUrl,
                    qs: {
                        tid: this.tid,
                        name: name
                    }
                })
                .catch(err => {
                    vscode.window.showErrorMessage("Failed to request stylesheet cache refresh!");
                    throw err;
                });
        }
    }
}


export { MyBBTemplateSet, MyBBStyle };
