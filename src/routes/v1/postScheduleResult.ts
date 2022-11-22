import express from 'express';
import { InsertModel, SchedulePerson } from '../../models/InsertModel';
const postSchedulerouter = express.Router();

// POSTリクエスト
postSchedulerouter.post(
    '/',
    createSchedule,
    (req: express.Request, res: express.Response) => {
        try {
            res.status(200).json(res.locals.registResult);
        } catch (error) {
            res.status(400).json({ message: '' });
        }
    }
);

async function createSchedule(req: any, res: any, next: any): Promise<any> {
    const insertModel: InsertModel = new InsertModel();
    const schedulePersonList: SchedulePerson[] = [];
    // 登録長さ
    const itemArrayLenth = req.body.itemArrayLenth;
    for (let i = 0; i < itemArrayLenth; i++) {
        const monTime = getStarEndTie(req.body.mondayWorkTime[i]);
        const tuesdayTime = getStarEndTie(req.body.tuesdayWorkTime[i]);
        const wednesTime = getStarEndTie(req.body.wednesWorkTime[i]);
        const thursdayTime = getStarEndTie(req.body.thursdayWorkTime[i]);
        const fridayTime = getStarEndTie(req.body.fridayWorkTime[i]);
        const saturdayTime = getStarEndTie(req.body.saturdayWorkTime[i]);
        const sundayTime = getStarEndTie(req.body.sundayWorkTime[i]);
        const sPerson: SchedulePerson = {
            personId: req.body.persionId[i],
            scheduleWeek: new Date(),
            monStart: monTime.startTime,
            monEnd: monTime.endTime,
            tueStart: tuesdayTime.startTime,
            tueEnd: tuesdayTime.endTime,
            wedStart: wednesTime.startTime,
            wedEnd: wednesTime.endTime,
            thuStart: thursdayTime.startTime,
            thuEnd: thursdayTime.endTime,
            friStart: fridayTime.startTime,
            friEnd: fridayTime.endTime,
            satStart: saturdayTime.startTime,
            satEnd: saturdayTime.endTime,
            sunStart: sundayTime.startTime,
            sunEnd: sundayTime.endTime,
            createid: 'u1001',
            createDate: new Date(),
            updateid: 'u1001',
            updateDate: new Date()
        };
        schedulePersonList.push(sPerson);
    }
    const registResult: any = await insertModel.RegistSchedule(
        schedulePersonList
    );
    res.locals.registResult = registResult;

    return next();
}

function getStarEndTie(workTime: string): {
    startTime: string;
    endTime: string;
} {
    let result = {
        startTime: '',
        endTime: ''
    };

    switch (workTime) {
        case '0':
            result = {
                startTime: '100000',
                endTime: '190000'
            };
            break;
        case '1':
            result = {
                startTime: '100000',
                endTime: '230000'
            };
            break;
        case '2':
            result = {
                startTime: '100000',
                endTime: '140000'
            };
            break;
        case '3':
            result = {
                startTime: '190000',
                endTime: '230000'
            };
    }

    return result;
}
export default postSchedulerouter;
