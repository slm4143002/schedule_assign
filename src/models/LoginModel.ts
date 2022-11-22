import ScheduleDao = require('./dao/ScheduleDao');
export class LoginModel {
    public getUserInfoResult = async (
        userId: string,
        password: string
    ): Promise<object> => {
        const userInfos: UserInfo = {};
        const scheduleDao: ScheduleDao = new ScheduleDao();
        const response: any = await scheduleDao.getUserInfo(userId, password);
        if (response.elements.length == 0) {
            return {};
        }

        userInfos.userid = response.elements[0].userid;
        userInfos.password = response.elements[0].password;
        userInfos.username = response.elements[0].username;

        return userInfos;
    };
}

interface UserInfo {
    userid?: string;
    password?: string;
    username?: string;
}
