import express from 'express';
import { LoginModel } from '../../models/LoginModel';
const router = express.Router();

// GETリクエスト
router.get('/', getUserInfo, (req: express.Request, res: express.Response) => {
    try {
        res.status(200).json({ ok: '成功' });
    } catch (error) {
        res.status(400).json({ message: '' });
    }
});

// POSTリクエスト
router.post('/', getUserInfo, (req: express.Request, res: express.Response) => {
    try {
        res.status(200).json(res.locals.userInfoResult);
    } catch (error) {
        res.status(400).json({ message: '' });
    }
});

async function getUserInfo(req: any, res: any, next: any): Promise<any> {
    const userInfo: LoginModel = new LoginModel();
    const userInfoResult: any = await userInfo.getUserInfoResult(
        req.body.userId,
        req.body.password
    );
    res.locals.userInfoResult = userInfoResult;
    return next();
}

export default router;
