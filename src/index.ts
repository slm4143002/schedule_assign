import express from 'express';
import DbAccesser from './util/DbAccesser';
import router from './routes/v1/index';

// initialize db config
DbAccesser.init().then((isConnect: boolean) => {
    if (!isConnect) {
        process.exit(-1);
    }
});

const app: any = express();
app.disable('x-powered-by');
// JSONオブジェクトの受信設定
app.use(express.json());
// 配列側のオブジェクトの受信設定
app.use(express.urlencoded({ extended: false }));
app.use(function (req: any, res: any, next: any) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'POST, GET, PUT, DELETE, OPTIONS'
    );
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Max-Age', '86400');
    next();
});
app.options('*', function (req: any, res: any) {
    res.sendStatus(200);
});
// ルーティング
app.use('/v1', router);

// 8080
const port = process.env.PORT || 3000;

// APIサーバ起動
app.listen(port);
console.log('Express WebApi listening on port ' + port);
