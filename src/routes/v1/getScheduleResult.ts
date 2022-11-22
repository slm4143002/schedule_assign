import express from 'express';
import { ScheduleModelDifficult } from '../../models/ScheduleModelDifficult';
const schedulerouter = express.Router();

// GETリクエスト
schedulerouter.get(
    '/',
    getScheduleResult,
    (req: express.Request, res: express.Response) => {
        try {
            res.status(200).json(res.locals.scheduleResult);
        } catch (error: unknown) {
            res.status(400).json({ message: '22222' });
        }
    }
);

// POSTリクエスト
schedulerouter.post(
    '/',
    getScheduleResult,
    (req: express.Request, res: express.Response) => {
        try {
            res.status(200).json({ message: '登録しました' });
        } catch (error: unknown) {
            res.status(400).json({ message: '1111' });
        }
    }
);

async function getScheduleResult(req: any, res: any, next: any): Promise<any> {
    const smModel: ScheduleModelDifficult = new ScheduleModelDifficult();
    const scheduleResultTable: any = await smModel.getScheduleResult('11');

    res.locals.scheduleResult = scheduleResultTable;
    return next();
}

export default schedulerouter;
