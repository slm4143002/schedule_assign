import AbstractDbDao = require('./AbstractDbDao');

class ScheduleDao extends AbstractDbDao.AbstractDbDao {
    /**
     * get one record from schedule_person table by scheduleWeek
     * @param scheduleWeek string
     * @return searchSchedulePerson data object
     */
    schedulePersonSql = `SELECT T2.name,T1.* FROM schedule_person as T1 inner join person_mst as T2 
            on T1.person_id=T2.person_id 
            WHERE  T1.schedule_week = $1 and T2.priority = $2 
            ORDER BY T1.person_id `;

    userInfoSql = `SELECT * From login WHERE  userid = $1 and password = $2 `;

    insertScheduleSql =
        `INSERT INTO SCHEDULE_PERSON (
                            person_id,
                            schedule_week,
                            mon_start,
                            mon_end,
                            tue_start,
                            tue_end,
                            wed_start,
                            wed_end,
                            thu_start,
                            thu_end,
                            fri_start,
                            fri_end,
                            sat_start,
                            sat_end,
                            sun_start,
                            sun_end,
                            createid,
                            create_date,
                            updateid,
                            update_date) 
                            VALUES` + ScheduleDao.getSql(20, 1);

    static getSql(columnSum: number, execCount: number): string {
        let count = [];
        let paramArray = [];
        let k = 1;
        for (let i = 1; i <= execCount; i++) {
            for (let j = k; j < k + columnSum; j++) {
                paramArray.push('$' + j);
            }
            let result = paramArray.join(',');
            count.push('(' + result + ')');
            paramArray = [];
            k = k + columnSum;
        }

        return count.join(',');
    }
    public async getSchedulePerson(
        scheduleWeek: Date,
        priority: string
    ): Promise<object> {
        return this.queryResult(this.schedulePersonSql, [
            scheduleWeek,
            priority
        ]);
    }

    public async getUserInfo(
        userId: string,
        password: string
    ): Promise<object> {
        return this.queryResult(this.userInfoSql, [userId, password]);
    }

    public async insertSchedule(values: any[][]): Promise<object> {
        return this.update(this.insertScheduleSql, values);
    }
}
export = ScheduleDao;
