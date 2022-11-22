import ScheduleDao = require('./dao/ScheduleDao');

const DAY_START_SHIFT: string = '090000';
const DAY_SHIFT: string = '9時-17時';
const DAY_END_SHIFT: string = '170000';
const NIGHT_END_SHIFT: string = '230000';
const NIGHT_SHIFT: string = '17-23時';
const ALL_DAY_SHIFT: string = '9時-23時';
const WEEK_SCHEDULE_DAYS: string[] = ['monDay', 'tuesDay'];
// 昼間 二人
const DAY_SCHEDULE_COUNT: number = 2;
// 夜間 2
const NIGHT_SCHEDULE_COUNT: number = 2;

export class ScheduleModel {
    schedulePersonList: SchedulePerson[] = [];

    public getScheduleResult = async (elementId: string): Promise<object> => {
        const schduleMap: Map<string, WeekResult> = new Map();
        const resScheduleResult: ScheduleResult[] = [];
        // スケジュール人員を読み込み
        await this.getSchedulePersonTable(elementId);
        this.setMonday(schduleMap);
        this.setTuesday(schduleMap);
        this.setWednesday(schduleMap);
        this.setThursDay(schduleMap);
        this.setFriDay(schduleMap);
        this.setSatDay(schduleMap);
        this.setSunday(schduleMap);
        let tmepMap: Map<string, string> = new Map();
        for (let i: number = 0; i < this.schedulePersonList.length; i++) {
            tmepMap.set(
                this.schedulePersonList[i].personId,
                this.schedulePersonList[i].name
            );
        }
        schduleMap.forEach((value: WeekResult, key: string) => {
            resScheduleResult.push({
                personId: key,
                name: tmepMap.get(key) as string,
                scheduleWeek: '20221030',
                scheduleResult: value
            });
        });

        return resScheduleResult;
    };

    // スケジュール人員を読み込み、配列に格納する
    private getSchedulePersonTable = async (
        elementId: string
    ): Promise<any> => {
        const scheduleDao: ScheduleDao = new ScheduleDao();
        const response: any = await scheduleDao.getSchedulePerson(
            new Date(),
            ''
        );
        response.elements.forEach((_element: any) => {
            this.schedulePersonList.push({
                name: _element['name'],
                personId: _element['person_id'],
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
                daytimeCoun: 0
            });
        });

        return response;
    };

    // 月曜日のスケジュールを配り
    private setMonday = (schduleMap: Map<string, WeekResult>): void => {
        // 昼間仕事人数
        let dayReCount = 0;
        for (let i: number = 0; i < this.schedulePersonList.length; i++) {
            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };
            // 上限になったので、リターン(当日 昼間)
            if (dayReCount === DAY_SCHEDULE_COUNT) {
                break;
            }
            // 9< time <17
            if (
                DAY_START_SHIFT === this.schedulePersonList[i].monStart &&
                DAY_END_SHIFT <= this.schedulePersonList[i].monEnd
            ) {
                if (schduleMap.has(this.schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        this.schedulePersonList[i].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで
                    if (wResult.monDay === ALL_DAY_SHIFT) {
                        return;
                    }
                } else {
                    wResult.monDay = DAY_SHIFT;
                    // 昼間仕事回数
                    this.schedulePersonList[i].daytimeCoun =
                        this.schedulePersonList[i].daytimeCoun + 1;
                }

                schduleMap.set(this.schedulePersonList[i].personId, wResult);
                // 個人でやった回数(一週間)
                this.schedulePersonList[i].workCoun =
                    this.schedulePersonList[i].workCoun + 1;

                // 昼間仕事人数
                dayReCount = dayReCount + 1;
            }
        }

        // 夜間
        // this.schedulePersonListをやる回数にソート
        // 夜間仕事人数
        let nightReCount = 0;
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return -1;
                if (a.daytimeCoun < a.daytimeCoun) return 1;
            }

            return 0;
        });

        for (let j: number = 0; j < this.schedulePersonList.length; j++) {
            let wResultNight: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };
            // 上限になったので、リターン
            if (nightReCount === NIGHT_SCHEDULE_COUNT) {
                break;
            }
            // <17 time < 23
            if (NIGHT_END_SHIFT === this.schedulePersonList[j].monEnd) {
                if (schduleMap.has(this.schedulePersonList[j].personId)) {
                    wResultNight = schduleMap.get(
                        this.schedulePersonList[j].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで
                    if (wResultNight.monDay === ALL_DAY_SHIFT) {
                        return;
                        // 昼間がある際に all day
                    } else if (wResultNight.monDay === DAY_SHIFT) {
                        wResultNight.monDay = ALL_DAY_SHIFT;
                    } else {
                        wResultNight.monDay = NIGHT_SHIFT;
                    }
                } else {
                    wResultNight.monDay = NIGHT_SHIFT;
                }
                schduleMap.set(
                    this.schedulePersonList[j].personId,
                    wResultNight
                );
                // 個人でやった回数(一週間)
                this.schedulePersonList[j].workCoun =
                    this.schedulePersonList[j].workCoun + 1;

                nightReCount = nightReCount + 1;
            }
        }
    };

    // 火曜日のスケジュールを配り
    private setTuesday = (schduleMap: Map<string, WeekResult>): void => {
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return 1;
                if (a.daytimeCoun < a.daytimeCoun) return -1;
            }

            return 0;
        });

        // 昼間仕事人数
        let dayReCount = 0;
        for (let i: number = 0; i < this.schedulePersonList.length; i++) {
            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };

            // 上限になったので、リターン(当日 昼間)
            if (dayReCount === DAY_SCHEDULE_COUNT) {
                break;
            }

            // 9< time <17
            if (
                DAY_START_SHIFT === this.schedulePersonList[i].tueStart &&
                DAY_END_SHIFT <= this.schedulePersonList[i].tueEnd
            ) {
                if (schduleMap.has(this.schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        this.schedulePersonList[i].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで 次へ
                    if (wResult.tuesDay === ALL_DAY_SHIFT) {
                        continue;
                    } else {
                        wResult.tuesDay = DAY_SHIFT;
                        // 昼間仕事回数
                        this.schedulePersonList[i].daytimeCoun =
                            this.schedulePersonList[i].daytimeCoun + 1;
                    }
                } else {
                    wResult.tuesDay = DAY_SHIFT;
                    // 昼間仕事回数
                    this.schedulePersonList[i].daytimeCoun =
                        this.schedulePersonList[i].daytimeCoun + 1;
                }

                schduleMap.set(this.schedulePersonList[i].personId, wResult);

                // 個人でやった回数(一週間)
                this.schedulePersonList[i].workCoun =
                    this.schedulePersonList[i].workCoun + 1;

                // 昼間仕事人数
                dayReCount = dayReCount + 1;
            }
        }

        // 夜間
        // this.schedulePersonListをやる回数にソート
        // 夜間仕事人数
        let nightReCount = 0;
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return -1;
                if (a.daytimeCoun < a.daytimeCoun) return 1;
            }

            return 0;
        });

        for (let j: number = 0; j < this.schedulePersonList.length; j++) {
            let wResult2: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };
            // 上限になったので、リターン
            if (nightReCount === NIGHT_SCHEDULE_COUNT) {
                break;
            }
            // >17 <23
            if (NIGHT_END_SHIFT === this.schedulePersonList[j].tueEnd) {
                if (schduleMap.has(this.schedulePersonList[j].personId)) {
                    wResult2 = schduleMap.get(
                        this.schedulePersonList[j].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで
                    if (wResult2.tuesDay === ALL_DAY_SHIFT) {
                        continue;
                        // 昼間がある際に all day
                    } else if (wResult2.tuesDay === DAY_SHIFT) {
                        wResult2.tuesDay = ALL_DAY_SHIFT;
                    } else {
                        wResult2.tuesDay = NIGHT_SHIFT;
                    }
                } else {
                    wResult2.tuesDay = NIGHT_SHIFT;
                }
                schduleMap.set(this.schedulePersonList[j].personId, wResult2);
                // 個人でやった回数(一週間)
                this.schedulePersonList[j].workCoun =
                    this.schedulePersonList[j].workCoun + 1;
                nightReCount = nightReCount + 1;
            }
        }
    };

    // 水曜日のスケジュールを配り
    private setWednesday = (schduleMap: Map<string, WeekResult>): void => {
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return 1;
                if (a.daytimeCoun < a.daytimeCoun) return -1;
            }

            return 0;
        });

        // 昼間仕事人数
        let dayReCount = 0;
        for (let i: number = 0; i < this.schedulePersonList.length; i++) {
            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };

            // 上限になったので、リターン(当日 昼間)
            if (dayReCount === DAY_SCHEDULE_COUNT) {
                break;
            }

            // 9< time <17
            if (
                DAY_START_SHIFT === this.schedulePersonList[i].wednesStart &&
                DAY_END_SHIFT <= this.schedulePersonList[i].wednesEnd
            ) {
                if (schduleMap.has(this.schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        this.schedulePersonList[i].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで 次へ
                    if (wResult.wednesDay === ALL_DAY_SHIFT) {
                        continue;
                    } else {
                        wResult.wednesDay = DAY_SHIFT;
                        // 昼間仕事回数
                        this.schedulePersonList[i].daytimeCoun =
                            this.schedulePersonList[i].daytimeCoun + 1;
                    }
                } else {
                    wResult.wednesDay = DAY_SHIFT;
                    // 昼間仕事回数
                    this.schedulePersonList[i].daytimeCoun =
                        this.schedulePersonList[i].daytimeCoun + 1;
                }

                schduleMap.set(this.schedulePersonList[i].personId, wResult);

                // 個人でやった回数(一週間)
                this.schedulePersonList[i].workCoun =
                    this.schedulePersonList[i].workCoun + 1;

                // 昼間仕事人数
                dayReCount = dayReCount + 1;
            }
        }

        // 夜間
        // this.schedulePersonListをやる回数にソート
        // 夜間仕事人数
        let nightReCount = 0;
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return -1;
                if (a.daytimeCoun < a.daytimeCoun) return 1;
            }

            return 0;
        });

        for (let j: number = 0; j < this.schedulePersonList.length; j++) {
            let wResult2: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };
            // 上限になったので、リターン
            if (nightReCount === NIGHT_SCHEDULE_COUNT) {
                break;
            }
            // >17 <23
            if (NIGHT_END_SHIFT === this.schedulePersonList[j].wednesEnd) {
                if (schduleMap.has(this.schedulePersonList[j].personId)) {
                    wResult2 = schduleMap.get(
                        this.schedulePersonList[j].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで
                    if (wResult2.wednesDay === ALL_DAY_SHIFT) {
                        continue;
                        // 昼間がある際に all day
                    } else if (wResult2.wednesDay === DAY_SHIFT) {
                        wResult2.wednesDay = ALL_DAY_SHIFT;
                    } else {
                        wResult2.wednesDay = NIGHT_SHIFT;
                    }
                } else {
                    wResult2.wednesDay = NIGHT_SHIFT;
                }
                schduleMap.set(this.schedulePersonList[j].personId, wResult2);
                // 個人でやった回数(一週間)
                this.schedulePersonList[j].workCoun =
                    this.schedulePersonList[j].workCoun + 1;
                nightReCount = nightReCount + 1;
            }
        }
    };

    // 木曜日のスケジュールを配り
    private setThursDay = (schduleMap: Map<string, WeekResult>): void => {
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return 1;
                if (a.daytimeCoun < a.daytimeCoun) return -1;
            }

            return 0;
        });

        // 昼間仕事人数
        let dayReCount = 0;
        for (let i: number = 0; i < this.schedulePersonList.length; i++) {
            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };

            // 上限になったので、リターン(当日 昼間)
            if (dayReCount === DAY_SCHEDULE_COUNT) {
                break;
            }

            // 9< time <17
            if (
                DAY_START_SHIFT === this.schedulePersonList[i].thuStart &&
                DAY_END_SHIFT <= this.schedulePersonList[i].thuEnd
            ) {
                if (schduleMap.has(this.schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        this.schedulePersonList[i].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで 次へ
                    if (wResult.thursDay === ALL_DAY_SHIFT) {
                        continue;
                    } else {
                        wResult.thursDay = DAY_SHIFT;
                        // 昼間仕事回数
                        this.schedulePersonList[i].daytimeCoun =
                            this.schedulePersonList[i].daytimeCoun + 1;
                    }
                } else {
                    wResult.thursDay = DAY_SHIFT;
                    // 昼間仕事回数
                    this.schedulePersonList[i].daytimeCoun =
                        this.schedulePersonList[i].daytimeCoun + 1;
                }

                schduleMap.set(this.schedulePersonList[i].personId, wResult);

                // 個人でやった回数(一週間)
                this.schedulePersonList[i].workCoun =
                    this.schedulePersonList[i].workCoun + 1;

                // 昼間仕事人数
                dayReCount = dayReCount + 1;
            }
        }

        // 夜間
        // this.schedulePersonListをやる回数にソート
        // 夜間仕事人数
        let nightReCount = 0;
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return -1;
                if (a.daytimeCoun < a.daytimeCoun) return 1;
            }

            return 0;
        });

        for (let j: number = 0; j < this.schedulePersonList.length; j++) {
            let wResult2: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };
            // 上限になったので、リターン
            if (nightReCount === NIGHT_SCHEDULE_COUNT) {
                break;
            }
            // >17 <23
            if (NIGHT_END_SHIFT === this.schedulePersonList[j].thuEnd) {
                if (schduleMap.has(this.schedulePersonList[j].personId)) {
                    wResult2 = schduleMap.get(
                        this.schedulePersonList[j].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで
                    if (wResult2.thursDay === ALL_DAY_SHIFT) {
                        continue;
                        // 昼間がある際に all day
                    } else if (wResult2.thursDay === DAY_SHIFT) {
                        wResult2.thursDay = ALL_DAY_SHIFT;
                    } else {
                        wResult2.thursDay = NIGHT_SHIFT;
                    }
                } else {
                    wResult2.thursDay = NIGHT_SHIFT;
                }
                schduleMap.set(this.schedulePersonList[j].personId, wResult2);
                // 個人でやった回数(一週間)
                this.schedulePersonList[j].workCoun =
                    this.schedulePersonList[j].workCoun + 1;
                nightReCount = nightReCount + 1;
            }
        }
    };

    // 金曜日のスケジュールを配り
    private setFriDay = (schduleMap: Map<string, WeekResult>): void => {
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return 1;
                if (a.daytimeCoun < a.daytimeCoun) return -1;
            }

            return 0;
        });

        // 昼間仕事人数
        let dayReCount = 0;
        for (let i: number = 0; i < this.schedulePersonList.length; i++) {
            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };

            // 上限になったので、リターン(当日 昼間)
            if (dayReCount === DAY_SCHEDULE_COUNT) {
                break;
            }

            // 9< time <17
            if (
                DAY_START_SHIFT === this.schedulePersonList[i].friStart &&
                DAY_END_SHIFT <= this.schedulePersonList[i].friEnd
            ) {
                if (schduleMap.has(this.schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        this.schedulePersonList[i].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで 次へ
                    if (wResult.friDay === ALL_DAY_SHIFT) {
                        continue;
                    } else {
                        wResult.friDay = DAY_SHIFT;
                        // 昼間仕事回数
                        this.schedulePersonList[i].daytimeCoun =
                            this.schedulePersonList[i].daytimeCoun + 1;
                    }
                } else {
                    wResult.friDay = DAY_SHIFT;
                    // 昼間仕事回数
                    this.schedulePersonList[i].daytimeCoun =
                        this.schedulePersonList[i].daytimeCoun + 1;
                }

                schduleMap.set(this.schedulePersonList[i].personId, wResult);

                // 個人でやった回数(一週間)
                this.schedulePersonList[i].workCoun =
                    this.schedulePersonList[i].workCoun + 1;

                // 昼間仕事人数
                dayReCount = dayReCount + 1;
            }
        }

        // 夜間
        // this.schedulePersonListをやる回数にソート
        // 夜間仕事人数
        let nightReCount = 0;
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return -1;
                if (a.daytimeCoun < a.daytimeCoun) return 1;
            }

            return 0;
        });

        for (let j: number = 0; j < this.schedulePersonList.length; j++) {
            let wResult2: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };
            // 上限になったので、リターン
            if (nightReCount === NIGHT_SCHEDULE_COUNT) {
                break;
            }
            // >17 <23
            if (NIGHT_END_SHIFT === this.schedulePersonList[j].friEnd) {
                if (schduleMap.has(this.schedulePersonList[j].personId)) {
                    wResult2 = schduleMap.get(
                        this.schedulePersonList[j].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで
                    if (wResult2.friDay === ALL_DAY_SHIFT) {
                        continue;
                        // 昼間がある際に all day
                    } else if (wResult2.friDay === DAY_SHIFT) {
                        wResult2.friDay = ALL_DAY_SHIFT;
                    } else {
                        wResult2.friDay = NIGHT_SHIFT;
                    }
                } else {
                    wResult2.friDay = NIGHT_SHIFT;
                }
                schduleMap.set(this.schedulePersonList[j].personId, wResult2);
                // 個人でやった回数(一週間)
                this.schedulePersonList[j].workCoun =
                    this.schedulePersonList[j].workCoun + 1;
                nightReCount = nightReCount + 1;
            }
        }
    };

    // 土曜日のスケジュールを配り
    private setSatDay = (schduleMap: Map<string, WeekResult>): void => {
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return 1;
                if (a.daytimeCoun < a.daytimeCoun) return -1;
            }

            return 0;
        });

        // 昼間仕事人数
        let dayReCount = 0;
        for (let i: number = 0; i < this.schedulePersonList.length; i++) {
            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };

            // 上限になったので、リターン(当日 昼間)
            if (dayReCount === DAY_SCHEDULE_COUNT) {
                break;
            }

            // 9< time <17
            if (
                DAY_START_SHIFT === this.schedulePersonList[i].satStart &&
                DAY_END_SHIFT <= this.schedulePersonList[i].satEnd
            ) {
                if (schduleMap.has(this.schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        this.schedulePersonList[i].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで 次へ
                    if (wResult.saturDay === ALL_DAY_SHIFT) {
                        continue;
                    } else {
                        wResult.saturDay = DAY_SHIFT;
                        // 昼間仕事回数
                        this.schedulePersonList[i].daytimeCoun =
                            this.schedulePersonList[i].daytimeCoun + 1;
                    }
                } else {
                    wResult.saturDay = DAY_SHIFT;
                    // 昼間仕事回数
                    this.schedulePersonList[i].daytimeCoun =
                        this.schedulePersonList[i].daytimeCoun + 1;
                }

                schduleMap.set(this.schedulePersonList[i].personId, wResult);

                // 個人でやった回数(一週間)
                this.schedulePersonList[i].workCoun =
                    this.schedulePersonList[i].workCoun + 1;

                // 昼間仕事人数
                dayReCount = dayReCount + 1;
            }
        }

        // 夜間
        // this.schedulePersonListをやる回数にソート
        // 夜間仕事人数
        let nightReCount = 0;
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return -1;
                if (a.daytimeCoun < a.daytimeCoun) return 1;
            }

            return 0;
        });

        for (let j: number = 0; j < this.schedulePersonList.length; j++) {
            let wResult2: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };
            // 上限になったので、リターン
            if (nightReCount === NIGHT_SCHEDULE_COUNT) {
                break;
            }
            // >17 <23
            if (NIGHT_END_SHIFT === this.schedulePersonList[j].satEnd) {
                if (schduleMap.has(this.schedulePersonList[j].personId)) {
                    wResult2 = schduleMap.get(
                        this.schedulePersonList[j].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで
                    if (wResult2.saturDay === ALL_DAY_SHIFT) {
                        continue;
                        // 昼間がある際に all day
                    } else if (wResult2.saturDay === DAY_SHIFT) {
                        wResult2.saturDay = ALL_DAY_SHIFT;
                    } else {
                        wResult2.saturDay = NIGHT_SHIFT;
                    }
                } else {
                    wResult2.saturDay = NIGHT_SHIFT;
                }
                schduleMap.set(this.schedulePersonList[j].personId, wResult2);
                // 個人でやった回数(一週間)
                this.schedulePersonList[j].workCoun =
                    this.schedulePersonList[j].workCoun + 1;
                nightReCount = nightReCount + 1;
            }
        }
    };

    // 日曜日のスケジュールを配り
    private setSunday = (schduleMap: Map<string, WeekResult>): void => {
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return 1;
                if (a.daytimeCoun < a.daytimeCoun) return -1;
            }

            return 0;
        });
        // 昼間仕事人数
        let dayReCount = 0;
        for (let i: number = 0; i < this.schedulePersonList.length; i++) {
            let wResult: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };

            // 上限になったので、リターン(当日 昼間)
            if (dayReCount === DAY_SCHEDULE_COUNT) {
                break;
            }

            // 9< time <17
            if (
                DAY_START_SHIFT === this.schedulePersonList[i].sunStart &&
                DAY_END_SHIFT <= this.schedulePersonList[i].sunEnd
            ) {
                if (schduleMap.has(this.schedulePersonList[i].personId)) {
                    wResult = schduleMap.get(
                        this.schedulePersonList[i].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで 次へ
                    if (wResult.sunDay === ALL_DAY_SHIFT) {
                        continue;
                    } else {
                        wResult.sunDay = DAY_SHIFT;
                        // 昼間仕事回数
                        this.schedulePersonList[i].daytimeCoun =
                            this.schedulePersonList[i].daytimeCoun + 1;
                    }
                } else {
                    wResult.sunDay = DAY_SHIFT;
                    // 昼間仕事回数
                    this.schedulePersonList[i].daytimeCoun =
                        this.schedulePersonList[i].daytimeCoun + 1;
                }

                schduleMap.set(this.schedulePersonList[i].personId, wResult);

                // 個人でやった回数(一週間)
                this.schedulePersonList[i].workCoun =
                    this.schedulePersonList[i].workCoun + 1;

                // 昼間仕事人数
                dayReCount = dayReCount + 1;
            }
        }

        // 夜間
        // this.schedulePersonListをやる回数にソート
        // 夜間仕事人数
        let nightReCount = 0;
        this.schedulePersonList.sort((a: SchedulePerson, b: SchedulePerson) => {
            if (a.workCoun > b.workCoun) {
                return 1;
            } else if (a.workCoun < b.workCoun) {
                return -1;
            } else {
                if (a.daytimeCoun > a.daytimeCoun) return -1;
                if (a.daytimeCoun < a.daytimeCoun) return 1;
            }

            return 0;
        });

        for (let j: number = 0; j < this.schedulePersonList.length; j++) {
            let wResult2: WeekResult = {
                monDay: '',
                tuesDay: '',
                wednesDay: '',
                thursDay: '',
                friDay: '',
                saturDay: '',
                sunDay: ''
            };
            // 上限になったので、リターン
            if (nightReCount === NIGHT_SCHEDULE_COUNT) {
                break;
            }
            // >17 <23
            if (NIGHT_END_SHIFT === this.schedulePersonList[j].sunEnd) {
                if (schduleMap.has(this.schedulePersonList[j].personId)) {
                    wResult2 = schduleMap.get(
                        this.schedulePersonList[j].personId
                    ) as WeekResult;

                    // 一人では、一日 最大2回まで
                    if (wResult2.sunDay === ALL_DAY_SHIFT) {
                        continue;
                        // 昼間がある際に all day
                    } else if (wResult2.sunDay === DAY_SHIFT) {
                        wResult2.sunDay = ALL_DAY_SHIFT;
                    } else {
                        wResult2.sunDay = NIGHT_SHIFT;
                    }
                } else {
                    wResult2.sunDay = NIGHT_SHIFT;
                }
                schduleMap.set(this.schedulePersonList[j].personId, wResult2);
                // 個人でやった回数(一週間)
                this.schedulePersonList[j].workCoun =
                    this.schedulePersonList[j].workCoun + 1;
                nightReCount = nightReCount + 1;
            }
        }
    };
}

interface SchedulePerson {
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
interface ScheduleResult {
    personId: string;
    name: string;
    scheduleWeek: string;
    scheduleResult: WeekResult;
}
interface WeekResult {
    monDay: string;
    tuesDay: string;
    wednesDay: string;
    thursDay: string;
    friDay: string;
    saturDay: string;
    sunDay: string;
}
