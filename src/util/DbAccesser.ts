'use strict';
import fs = require('fs');
import { Pool, PoolClient, QueryResult } from 'pg';

import config from 'config';
import TypeDefinition = require('./TypeDefinition');

const LINE_DELIMITER: string = '\n';
const COLUMN_DELIMITER: string = ':';

/**
 * db access class
 */
class DbAccesser {
    public static pool: Pool;
    private static sql: Map<string, string>;

    /**
     * Connection Pool init.
     */
    public static async init(): Promise<boolean> {
        //const serverConf: any = ServerConfigModel.getServerConf();
        const jdbcSetting: object = config.get('jdbc');
        this.pool = new Pool(jdbcSetting);

        // Connection to jss DB
        const client: PoolClient = (await this.getClinet()) as PoolClient;

        try {
            // connection test
            await client.query('select 1');

            // Read Sql Files
            // this.readAllSqlFiles();
            // if (this.sql.size === 0) {
            //   return false;
            // }

            return true;
        } catch (err) {
            return false;
        } finally {
            // connection release
            if (client.release.name !== 'throwOnRelease') {
                client.release();
            }
        }
    }

    /**
     * Connection Pool close.
     */
    public static close(): void {
        this.pool.end();
    }

    /**
     * Get client
     */
    public static async getClinet(): Promise<PoolClient | null> {
        try {
            return await this.pool.connect();
        } catch (err) {
            return null;
        }
    }

    /**
     * Transaction start.
     */
    public static async begin(): Promise<PoolClient | null> {
        try {
            const client: PoolClient | null = await this.getClinet();
            if (client == null) {
                return null;
            }
            await client.query('BEGIN');

            return client;
        } catch (err) {
            return null;
        }
    }

    /**
     * Transaction normal end.
     */
    public static async commit(client: PoolClient): Promise<boolean> {
        try {
            await client.query('COMMIT');

            return true;
        } catch (err) {
            this.rollback(client);

            return false;
        } finally {
            if (client.release.name !== 'throwOnRelease') {
                client.release();
            }
        }
    }

    /**
     * Transaction abnormal end.
     */
    public static async rollback(client: PoolClient): Promise<boolean> {
        try {
            await client.query('ROLLBACK');

            return true;
        } catch (err) {
            return false;
        } finally {
            if (client.release.name !== 'throwOnRelease') {
                client.release();
            }
        }
    }

    /**
     * execute sql.
     */
    public static async query(
        client: PoolClient,
        sqlKey: string,
        parameter: any[]
    ): Promise<TypeDefinition.ResultSet> {
        try {
            const _sql: string = this.getSql(sqlKey);

            // sql is not found
            if (_sql === '') {
                await this.rollback(client);

                return this.getResultSet(null, false, '');
            }

            // execute query
            const result: QueryResult = await client.query(_sql, parameter);

            // query success
            return this.getResultSet(result, true, '');
        } catch (err) {
            await this.rollback(client);

            return this.getResultSet(null, false, '');
        }
    }

    public static readAllSqlFiles(): void {
        const fileList: string[] = fs.readdirSync(
            './../dev/resources/config/sql/'
        );
        const sqlList: string[] = fileList
            .filter((filePath: string) => {
                return filePath.endsWith('.sql');
            })
            .map((filePath: string) => './config/sql/' + filePath);
        this.readSqlFiles(sqlList);
    }

    /**
     * Reread all sql file.
     */
    public static readSqlFiles(files: string[]): void {
        this.sql = new Map();

        files.forEach((file: string) => {
            const input: string = fs.readFileSync(file, 'utf8');
            const lines: string[] = input.split(LINE_DELIMITER);
            lines.forEach((line: string) => {
                if (line !== '') {
                    const colmuns: string[] = line.split(COLUMN_DELIMITER);

                    this.sql.set(colmuns[0].trim(), colmuns[1].trim());
                }
            });
        });
    }

    /**
     * get sql string
     */
    public static getSql(sqlKey: string): string {
        if (this.sql.has(sqlKey)) {
            return this.sql.get(sqlKey) as string;
        } else {
            return '';
        }
    }

    /**
     * get ResultSet
     */
    private static getResultSet(
        _result: QueryResult | null,
        _success: boolean,
        _errCode: string
    ): TypeDefinition.ResultSet {
        if (_result === null) {
            return {
                command: '',
                rowCount: 0,
                oid: 0,
                fields: [],
                rows: [],
                success: _success,
                errCode: _errCode
            };
        } else {
            return {
                command: _result.command,
                rowCount: _result.rowCount,
                oid: _result.oid,
                fields: _result.fields,
                rows: _result.rows,
                success: _success,
                errCode: _errCode
            };
        }
    }
}

export = DbAccesser;
