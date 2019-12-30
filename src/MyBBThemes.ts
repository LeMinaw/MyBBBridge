import * as vscode from 'vscode';
import * as mysql from 'mysql';


abstract class MyBBSet {
    name: string;
    con: mysql.Connection;
    prefix: string;

    public constructor(name:string, con: mysql.Connection, prefix: string='mybb_') {
        this.name = name;
        this.con = con;
        this.prefix = prefix;
    }

    public getTable(name:string) {
        return this.prefix + name;
    }

    public query(req: string, params: any[], callback: any=()=>{}) {
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

    private getSetName() {
        return this.name + ' Templates';
    }

    private async getSid() {
        const res: any = await this.query(
            'SELECT sid FROM ?? WHERE title=?',
            [this.getTable('templatesets'), this.getSetName()],
            (err: any, result: any) => {
                if (!result.length) {
                    vscode.window.showErrorMessage(`Can't find template ${this.name}!`);
                }
            }
        );
        this.sid = res[0].sid;
        return this.sid;
    }

    public async getElements() {
        await this.getSid();
        const templates: any = await this.query(
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
}


class MyBBStyle extends MyBBSet {
    tid: number|undefined;

    private async getTid() {
        const res: any = await this.query(
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

    public async getElements() {
        await this.getTid();
        const stylesheets: any = await this.query(
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
}


export { MyBBTemplateSet, MyBBStyle };
