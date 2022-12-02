import DbAccesser = require('../../util/DbAccesser');
import { QueryResult, PoolClient } from 'pg';

export abstract class AbstractDbDao {
    protected queryResult = async (
        sqlName: string,
        args: any[]
    ): Promise<object> => {
        //let resultSet: ResultSet;
        const client = await DbAccesser.pool.connect();

        try {
            const resultSet = await client.query(sqlName, args);
            return {
                result: {
                    code: '',
                    message: ''
                },
                elements: resultSet.rows
            };
        } catch (err: any) {
            console.log(err.stack);
            return {
                result: {
                    code: '',
                    message: ''
                }
            };
        } finally {
            if (client.release.name !== 'throwOnRelease') {
                client.release();
            }
        }
    };

    /**
     * INSERT or UPDATEのSQL実行.
     * 注意事項：トランザクションの範囲はこの関数内だけです。
     * 　　　　　複数SQLを１トランザクションにしたい場合は本Functionは使わないでください。
     *
     * @param _sql Key name associated with SQL statement
     * @param args SQL parameter array
     * @return resultSet Object(row count)
     */
    protected update = async (
        _sql: string,
        values: any[][]
    ): Promise<object> => {
        let vParam: any[][];
        for (let k = 0; k < values.length; ) {
            if (k + 2 >= values.length) {
                vParam = values.slice(k, values.length);
                this.updateExec(_sql, vParam, values.length - k);
                break;
            } else {
                vParam = values.slice(k, k + 2);
                this.updateExec(_sql, vParam, 2);
                k = k + 2;
            }
        }
        return {
            code: '0',
            message: '',
            rowCount: 2
        };
    };

    protected updateExec = async (
        _sql: string,
        args: any,
        limitRows: number
    ): Promise<object> => {
        // transaction start
        const client = await DbAccesser.pool.connect();
        try {
            await client.query('BEGIN');
            for (let num = 0; num < limitRows; num++) {
                await client.query(_sql, args[num]);
            }
            await client.query('COMMIT');
            return {
                code: '0',
                message: '',
                rowCount: limitRows
            };
        } catch (e) {
            await client?.query('ROLLBACK');
            throw e;
        } finally {
            if (client?.release.name !== 'throwOnRelease') {
                client?.release();
            }
        }
    };
}

export interface ResultSet extends QueryResult {
    success: boolean;
    errCode: string;
}
