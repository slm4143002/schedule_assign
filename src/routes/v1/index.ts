import express from 'express';
import schedulerouter from './getScheduleResult';
import postSchedulerouter from './postScheduleResult';
import usersRouter from './users';

const router = express.Router();
router.use('/login', usersRouter);
// v1以下のルーティング
router.use('/scheduleResult', schedulerouter);
// v1以下のルーティング
router.use('/createSchedule', postSchedulerouter);

export default router;
