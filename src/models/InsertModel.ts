import ScheduleDao = require('./dao/ScheduleDao');
export class InsertModel {
    public RegistSchedule = async (
        schedulePersonArray: SchedulePerson[]
    ): Promise<object> => {
        const scheduleDao: ScheduleDao = new ScheduleDao();
        const paramValues = [];
        for (let i = 0; i < schedulePersonArray.length; i++) {
            paramValues.push(Object.values(schedulePersonArray[i]));
        }
        const response: any = await scheduleDao.insertSchedule(paramValues);

        return { rowCount: 0 };
    };
}

export interface SchedulePerson {
    personId: string;
    scheduleWeek: Date;
    monStart: string;
    monEnd: string;
    tueStart: string;
    tueEnd: string;
    wedStart: string;
    wedEnd: string;
    thuStart: string;
    thuEnd: string;
    friStart: string;
    friEnd: string;
    satStart: string;
    satEnd: string;
    sunStart: string;
    sunEnd: string;
    createid: string;
    createDate: Date;
    updateid: string;
    updateDate: Date;
}
