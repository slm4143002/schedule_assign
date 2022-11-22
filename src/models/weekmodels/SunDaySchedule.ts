import {
    SchedulePerson,
    WeekResult,
    TIME_TRANSFORM_TEXT_MAP,
    OPERATION_PEOPLE_MAX,
    DAY_SHIFT_0,
    DAY_SHIFT_1,
    DAY_SHIFT_2,
    DAY_SHIFT_3,
} from '../ScheduleModelDifficult';

export class SunDaySchedule {
    sun_workTime1: number = 0;
    sun_workTime2: number = 0;
    sun_workTime3: number = 0;

    constructor(t1: number, t2: number, t3: number) {
        this.sun_workTime1 = t1;
        this.sun_workTime2 = t2;
        this.sun_workTime3 = t3;
    }

    // 月曜日のスケジュールを配り
    public setTuesday = (
        schduleMap: Map<string, WeekResult>,
        schedulePersonList: SchedulePerson[]
    ): void => {
        // 10= time >=14
        for (let i: number = 0; i < schedulePersonList.length; i++) {
            schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
                // 終わりの時間に昇順
                if (a.sunEnd > b.sunEnd) {
                    return 1;
                    // 当番回数(合計)に降順
                } else if (a.workCoun < b.workCoun) {
                    return -1;
                }

                return 0;
            });

            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: '',
            };
            // 稼働上限になったので、リターン
            if (this.sun_workTime1 >= OPERATION_PEOPLE_MAX) {
                break;
            }
            // 10= time >=14
            if (
                DAY_SHIFT_0 === schedulePersonList[i].sunStart &&
                DAY_SHIFT_1 <= schedulePersonList[i].sunEnd
            ) {
                if (schduleMap.has(schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        schedulePersonList[i].personId
                    ) as WeekResult;
                }
                wResult.sunDay =
                    (TIME_TRANSFORM_TEXT_MAP.get(DAY_SHIFT_0) as string) +
                    '-' +
                    (TIME_TRANSFORM_TEXT_MAP.get(DAY_SHIFT_1) as string);

                schduleMap.set(schedulePersonList[i].personId, wResult);

                // 個人でやった回数(一週間)
                schedulePersonList[i].workCoun =
                    schedulePersonList[i].workCoun + 1;
                // 同時上限人数
                this.sun_workTime1 += 1;
            }
        }

        // 14-19
        schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            // 終わりの時間に昇順
            if (a.sunEnd > b.sunEnd) {
                return 1;
                // 当番回数(合計)に降順
            } else if (a.workCoun < b.workCoun) {
                return -1;
            }

            return 0;
        });
        for (let i: number = 0; i < schedulePersonList.length; i++) {
            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: '',
            };
            // 稼働上限になったので、リターン
            if (this.sun_workTime2 >= OPERATION_PEOPLE_MAX) {
                break;
            }
            // 10 <= time >=14
            if (
                DAY_SHIFT_0 <= schedulePersonList[i].sunStart &&
                DAY_SHIFT_2 <= schedulePersonList[i].sunEnd
            ) {
                if (schduleMap.has(schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        schedulePersonList[i].personId
                    ) as WeekResult;
                    wResult.sunDay =
                        (TIME_TRANSFORM_TEXT_MAP.get(
                            schedulePersonList[i].sunStart
                        ) as string) +
                        '-' +
                        (TIME_TRANSFORM_TEXT_MAP.get(DAY_SHIFT_2) as string);
                } else {
                    wResult.sunDay =
                        (TIME_TRANSFORM_TEXT_MAP.get(DAY_SHIFT_1) as string) +
                        '-' +
                        (TIME_TRANSFORM_TEXT_MAP.get(DAY_SHIFT_2) as string);
                }

                schduleMap.set(schedulePersonList[i].personId, wResult);
                // 個人でやった回数(一週間)
                schedulePersonList[i].workCoun =
                    schedulePersonList[i].workCoun + 1;
                // 同時上限人数
                this.sun_workTime2 += 1;
            }
        }

        // 19-23
        schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            // 終わりの時間に降順
            if (a.sunEnd > b.sunEnd) {
                return -1;
                // 当番回数(合計)に降順
            } else if (a.workCoun < b.workCoun) {
                return -1;
            }

            return 0;
        });
        for (let i: number = 0; i < schedulePersonList.length; i++) {
            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: '',
            };
            // 稼働上限になったので、リターン
            if (this.sun_workTime3 >= OPERATION_PEOPLE_MAX) {
                break;
            }
            // 10 <= time >=23
            if (
                DAY_SHIFT_0 <= schedulePersonList[i].sunStart &&
                DAY_SHIFT_3 <= schedulePersonList[i].sunEnd
            ) {
                if (schduleMap.has(schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        schedulePersonList[i].personId
                    ) as WeekResult;
                    wResult.sunDay =
                        (TIME_TRANSFORM_TEXT_MAP.get(
                            schedulePersonList[i].sunStart
                        ) as string) +
                        '-' +
                        (TIME_TRANSFORM_TEXT_MAP.get(DAY_SHIFT_3) as string);
                } else {
                    wResult.sunDay =
                        (TIME_TRANSFORM_TEXT_MAP.get(DAY_SHIFT_2) as string) +
                        '-' +
                        (TIME_TRANSFORM_TEXT_MAP.get(DAY_SHIFT_3) as string);
                }

                schduleMap.set(schedulePersonList[i].personId, wResult);
                // 個人でやった回数(一週間)
                schedulePersonList[i].workCoun =
                    schedulePersonList[i].workCoun + 1;
                // 同時上限人数
                this.sun_workTime3 += 1;
            }
        }
    };

    public getWorkTime() {
        return [this.sun_workTime1, this.sun_workTime2, this.sun_workTime3];
    }
}
