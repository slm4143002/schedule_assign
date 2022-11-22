import { MonDaySchedule } from './weekmodels/MonDaySchedule';
import { TueDaySchedule } from './weekmodels/TueDaySchedule';
import { WednesDaySchedule } from './weekmodels/WednesDaySchedule';
import { ThuDaySchedule } from './weekmodels/ThuDaySchedule';
import { FriDaySchedule } from './weekmodels/FriDaySchedule';
import { SatDaySchedule } from './weekmodels/SatDaySchedule';
import { SunDaySchedule } from './weekmodels/SunDaySchedule';
import ScheduleDao = require('./dao/ScheduleDao');

export const DAY_SHIFT_0: string = '100000';
export const DAY_SHIFT_1: string = '140000';
export const DAY_SHIFT_2: string = '190000';
export const DAY_SHIFT_3: string = '230000';
// 同時に稼働人数上限
export const OPERATION_PEOPLE_MAX: number = 4;

export const TIME_TRANSFORM_TEXT_MAP: Map<string, string> = new Map([
    ['090000', '9時'],
    ['100000', '10時'],
    ['140000', '14時'],
    ['190000', '19時'],
    ['230000', '23時'],
]);
export class ScheduleModelDifficult {
    staffSchedulePersonList: SchedulePerson[] = [];
    tempStaffSchedulePersonList: SchedulePerson[] = [];
    // 10-14
    mon_workTime1: number = 0;
    tue_workTime1: number = 0;
    wednes_workTime1: number = 0;
    thu_workTime1: number = 0;
    fri_workTime1: number = 0;
    sat_workTime1: number = 0;
    sun_workTime1: number = 0;

    // 14-19
    mon_workTime2: number = 0;
    tue_workTime2: number = 0;
    wednes_workTime2: number = 0;
    thu_workTime2: number = 0;
    fri_workTime2: number = 0;
    sat_workTime2: number = 0;
    sun_workTime2: number = 0;

    // 19-23
    mon_workTime3: number = 0;
    tue_workTime3: number = 0;
    wednes_workTime3: number = 0;
    thu_workTime3: number = 0;
    fri_workTime3: number = 0;
    sat_workTime3: number = 0;
    sun_workTime3: number = 0;

    public getScheduleResult = async (elementId: string): Promise<object> => {
        const schduleMap: Map<string, WeekResult> = new Map();
        const schduleTempMap: Map<string, WeekResult> = new Map();
        const resScheduleResult: ScheduleResult[] = [];
        // スケジュール人員を読み込み
        await this.getSchedulePersonTable(
            '',
            '1',
            this.staffSchedulePersonList
        );

        // 正社員の当番を割り当てる
        this.setStaffSchedule(schduleMap);

        // アルバイト人員を読み込み
        await this.getSchedulePersonTable(
            '',
            '2',
            this.tempStaffSchedulePersonList
        );

        /**
         * 月曜日の割り当て
         */
        const monDaySchedule: MonDaySchedule = new MonDaySchedule(
            this.mon_workTime1,
            this.mon_workTime2,
            this.mon_workTime3
        );
        monDaySchedule.setMonday(
            schduleTempMap,
            this.tempStaffSchedulePersonList
        );

        /**
         * 火曜日の割り当て
         */
        const tueDaySchedule: TueDaySchedule = new TueDaySchedule(
            this.tue_workTime1,
            this.tue_workTime2,
            this.tue_workTime3
        );
        tueDaySchedule.setTuesday(
            schduleTempMap,
            this.tempStaffSchedulePersonList
        );

        /**
         * 水曜日の割り当て
         */
        const wednesDaySchedule: WednesDaySchedule = new WednesDaySchedule(
            this.wednes_workTime1,
            this.wednes_workTime2,
            this.wednes_workTime3
        );
        wednesDaySchedule.setTuesday(
            schduleTempMap,
            this.tempStaffSchedulePersonList
        );
        /**
         * 木曜日の割り当て
         */
        const thuDaySchedule: ThuDaySchedule = new ThuDaySchedule(
            this.thu_workTime1,
            this.thu_workTime2,
            this.thu_workTime3
        );
        thuDaySchedule.setTuesday(
            schduleTempMap,
            this.tempStaffSchedulePersonList
        );
        /**
         * 金曜日の割り当て
         */
        const friDaySchedule: FriDaySchedule = new FriDaySchedule(
            this.fri_workTime1,
            this.fri_workTime2,
            this.fri_workTime3
        );
        friDaySchedule.setTuesday(
            schduleTempMap,
            this.tempStaffSchedulePersonList
        );
        /**
         * 土曜日の割り当て
         */
        const satDaySchedule: SatDaySchedule = new SatDaySchedule(
            this.sat_workTime1,
            this.sat_workTime2,
            this.sat_workTime3
        );
        satDaySchedule.setTuesday(
            schduleTempMap,
            this.tempStaffSchedulePersonList
        );
        /**
         * 日曜日の割り当て
         */
        const sunDaySchedule: SunDaySchedule = new SunDaySchedule(
            this.sun_workTime1,
            this.sun_workTime2,
            this.sun_workTime3
        );
        sunDaySchedule.setTuesday(
            schduleTempMap,
            this.tempStaffSchedulePersonList
        );

        let tmepMap: Map<string, string> = new Map();
        for (let i: number = 0; i < this.staffSchedulePersonList.length; i++) {
            tmepMap.set(
                this.staffSchedulePersonList[i].personId,
                this.staffSchedulePersonList[i].name
            );
        }
        for (
            let i: number = 0;
            i < this.tempStaffSchedulePersonList.length;
            i++
        ) {
            tmepMap.set(
                this.tempStaffSchedulePersonList[i].personId,
                this.tempStaffSchedulePersonList[i].name
            );
        }

        schduleMap.forEach((value: WeekResult, key: string) => {
            resScheduleResult.push({
                personId: key,
                name: tmepMap.get(key) as string,
                scheduleWeek: '20221030',
                scheduleResult: value,
            });
        });
        schduleTempMap.forEach((value: WeekResult, key: string) => {
            resScheduleResult.push({
                personId: key,
                name: tmepMap.get(key) as string,
                scheduleWeek: '20221030',
                scheduleResult: value,
            });
        });

        return resScheduleResult;
    };

    // スケジュール人員を読み込み、配列に格納する
    private getSchedulePersonTable = async (
        weekDay1: string,
        priority: string,
        schedulePersonList: SchedulePerson[]
    ): Promise<any> => {
        const scheduleDao: ScheduleDao = new ScheduleDao();
        const response: any = await scheduleDao.getSchedulePerson(
            new Date('2022-10-30'),
            priority
        );
        response.elements.forEach((_element: any) => {
            schedulePersonList.push({
                personId: _element['person_id'],
                name: _element['name'],
                scheduleWeek: _element['schedule_week'],
                monStart: _element['mon_start'],
                monEnd: _element['mon_end'],
                tueStart: _element['tue_start'],
                tueEnd: _element['tue_end'],
                wednesStart: _element['wed_start'],
                wednesEnd: _element['wed_end'],
                thuStart: _element['thu_start'],
                thuEnd: _element['thu_end'],
                friStart: _element['fri_start'],
                friEnd: _element['fri_end'],
                satStart: _element['sat_start'],
                satEnd: _element['sat_end'],
                sunStart: _element['sun_start'],
                sunEnd: _element['sun_end'],
                workCoun: 0,
                daytimeCoun: 0,
            });
        });

        return response;
    };
    // 正式社員の当番を割り当てる
    private setStaffSchedule = (schduleMap: Map<string, WeekResult>): void => {
        for (let i: number = 0; i < this.staffSchedulePersonList.length; i++) {
            let weekDays = ['', '', '', '', '', '', ''];
            if (this.staffSchedulePersonList[i].monStart) {
                weekDays[0] =
                    (TIME_TRANSFORM_TEXT_MAP.get(
                        this.staffSchedulePersonList[i].monStart
                    ) as string) +
                    '-' +
                    (TIME_TRANSFORM_TEXT_MAP.get(
                        this.staffSchedulePersonList[i].monEnd
                    ) as string);
                if (
                    this.staffSchedulePersonList[i].monStart < DAY_SHIFT_1 &&
                    this.staffSchedulePersonList[i].monEnd >= DAY_SHIFT_1
                ) {
                    this.mon_workTime1 += 1;
                }
                if (this.staffSchedulePersonList[i].monEnd >= DAY_SHIFT_2) {
                    this.mon_workTime2 += 1;
                }
                if (this.staffSchedulePersonList[i].monEnd >= DAY_SHIFT_3) {
                    this.mon_workTime3 += 1;
                }
            }
            if (this.staffSchedulePersonList[i].tueStart) {
                weekDays[1] = (
                    TIME_TRANSFORM_TEXT_MAP.get(
                        this.staffSchedulePersonList[i].tueStart
                    ) as string
                )
                    .concat('-')
                    .concat(
                        TIME_TRANSFORM_TEXT_MAP.get(
                            this.staffSchedulePersonList[i].tueEnd
                        ) as string
                    );

                if (
                    this.staffSchedulePersonList[i].tueStart < DAY_SHIFT_1 &&
                    this.staffSchedulePersonList[i].tueEnd >= DAY_SHIFT_1
                ) {
                    this.tue_workTime1 += 1;
                }
                if (this.staffSchedulePersonList[i].tueEnd >= DAY_SHIFT_2) {
                    this.tue_workTime2 += 1;
                }
                if (this.staffSchedulePersonList[i].tueEnd >= DAY_SHIFT_3) {
                    this.tue_workTime3 += 1;
                }
            }
            if (this.staffSchedulePersonList[i].wednesStart) {
                weekDays[2] = (
                    TIME_TRANSFORM_TEXT_MAP.get(
                        this.staffSchedulePersonList[i].wednesStart
                    ) as string
                )
                    .concat('-')
                    .concat(
                        TIME_TRANSFORM_TEXT_MAP.get(
                            this.staffSchedulePersonList[i].wednesEnd
                        ) as string
                    );

                if (
                    this.staffSchedulePersonList[i].wednesStart < DAY_SHIFT_1 &&
                    this.staffSchedulePersonList[i].wednesEnd >= DAY_SHIFT_1
                ) {
                    this.wednes_workTime1 += 1;
                }
                if (this.staffSchedulePersonList[i].wednesEnd >= DAY_SHIFT_2) {
                    this.wednes_workTime2 += 1;
                }
                if (this.staffSchedulePersonList[i].wednesEnd >= DAY_SHIFT_3) {
                    this.wednes_workTime3 += 1;
                }
            }
            if (this.staffSchedulePersonList[i].thuStart) {
                weekDays[3] = (
                    TIME_TRANSFORM_TEXT_MAP.get(
                        this.staffSchedulePersonList[i].thuStart
                    ) as string
                )
                    .concat('-')
                    .concat(
                        TIME_TRANSFORM_TEXT_MAP.get(
                            this.staffSchedulePersonList[i].thuEnd
                        ) as string
                    );

                if (
                    this.staffSchedulePersonList[i].thuStart < DAY_SHIFT_1 &&
                    this.staffSchedulePersonList[i].thuEnd >= DAY_SHIFT_1
                ) {
                    this.fri_workTime1 += 1;
                }
                if (this.staffSchedulePersonList[i].thuEnd >= DAY_SHIFT_2) {
                    this.thu_workTime2 += 1;
                }
                if (this.staffSchedulePersonList[i].thuEnd >= DAY_SHIFT_3) {
                    this.thu_workTime3 += 1;
                }
            }
            if (this.staffSchedulePersonList[i].friStart) {
                weekDays[4] = (
                    TIME_TRANSFORM_TEXT_MAP.get(
                        this.staffSchedulePersonList[i].friStart
                    ) as string
                )
                    .concat('-')
                    .concat(
                        TIME_TRANSFORM_TEXT_MAP.get(
                            this.staffSchedulePersonList[i].friEnd
                        ) as string
                    );

                if (
                    this.staffSchedulePersonList[i].friStart < DAY_SHIFT_1 &&
                    this.staffSchedulePersonList[i].friEnd >= DAY_SHIFT_1
                ) {
                    this.fri_workTime1 += 1;
                }
                if (this.staffSchedulePersonList[i].friEnd >= DAY_SHIFT_2) {
                    this.fri_workTime2 += 1;
                }
                if (this.staffSchedulePersonList[i].friEnd >= DAY_SHIFT_3) {
                    this.fri_workTime3 += 1;
                }
            }
            if (this.staffSchedulePersonList[i].satStart) {
                weekDays[5] = (
                    TIME_TRANSFORM_TEXT_MAP.get(
                        this.staffSchedulePersonList[i].satStart
                    ) as string
                )
                    .concat('-')
                    .concat(
                        TIME_TRANSFORM_TEXT_MAP.get(
                            this.staffSchedulePersonList[i].satEnd
                        ) as string
                    );

                if (
                    this.staffSchedulePersonList[i].satStart < DAY_SHIFT_1 &&
                    this.staffSchedulePersonList[i].satEnd >= DAY_SHIFT_1
                ) {
                    this.sat_workTime1 += 1;
                }
                if (this.staffSchedulePersonList[i].satEnd >= DAY_SHIFT_2) {
                    this.sat_workTime2 += 1;
                }
                if (this.staffSchedulePersonList[i].satEnd >= DAY_SHIFT_3) {
                    this.sat_workTime3 += 1;
                }
            }
            if (this.staffSchedulePersonList[i].sunStart) {
                weekDays[6] = (
                    TIME_TRANSFORM_TEXT_MAP.get(
                        this.staffSchedulePersonList[i].sunStart
                    ) as string
                )
                    .concat('-')
                    .concat(
                        TIME_TRANSFORM_TEXT_MAP.get(
                            this.staffSchedulePersonList[i].sunEnd
                        ) as string
                    );

                if (
                    this.staffSchedulePersonList[i].sunStart < DAY_SHIFT_1 &&
                    this.staffSchedulePersonList[i].sunEnd >= DAY_SHIFT_1
                ) {
                    this.sun_workTime1 += 1;
                }
                if (this.staffSchedulePersonList[i].sunEnd >= DAY_SHIFT_2) {
                    this.sun_workTime2 += 1;
                }
                if (this.staffSchedulePersonList[i].sunEnd >= DAY_SHIFT_3) {
                    this.sun_workTime3 += 1;
                }
            }

            schduleMap.set(this.staffSchedulePersonList[i].personId, {
                monDay: weekDays[0],
                tuesDay: weekDays[1],
                wednesDay: weekDays[2],
                thursDay: weekDays[3],
                friDay: weekDays[4],
                saturDay: weekDays[5],
                sunDay: weekDays[6],
            });
        }
    };
}

export interface SchedulePerson {
    personId: string;
    name: string;
    scheduleWeek: Date;
    monStart: string;
    monEnd: string;
    tueStart: string;
    tueEnd: string;
    wednesStart: string;
    wednesEnd: string;
    thuStart: string;
    thuEnd: string;
    friStart: string;
    friEnd: string;
    satStart: string;
    satEnd: string;
    sunStart: string;
    sunEnd: string;
    workCoun: number;
    daytimeCoun: number;
}
export interface ScheduleResult {
    personId: string;
    name: string;
    scheduleWeek: string;
    scheduleResult: WeekResult;
}
export interface WeekResult {
    monDay: string;
    tuesDay: string;
    wednesDay: string;
    thursDay: string;
    friDay: string;
    saturDay: string;
    sunDay: string;
}
