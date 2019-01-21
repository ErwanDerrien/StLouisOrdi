import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import { ServeStaticOptions } from 'serve-static';

import { ComputersController } from './controllers/Computers';

class Server {
    private expressApp: express.Application;

    public constructor(app: express.Application = express()) {
        this.expressApp = app;
    }

    public start(port: number): void {
        this.addMiddlewares();
        this.addServertRoutes();
        this.addClientRoutes();

        this.expressApp.on('listening', () => { console.log('Listening on port', port); });
        this.expressApp.on('error', (error: any) => {
            console.log('Issue noticed while starting the server...', error);
        });
        this.expressApp.listen(port);
    }

    private handleCORS(request: express.Request, response: express.Response, next: express.NextFunction): any {
        response
            .header('Vary', 'Origin')
            .header('Access-Control-Allow-Origin', request.header('origin'))
            .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Ids-Only, X-Sort-By')
            .header('Access-Control-Allow-Credentials', 'true');
        next();
    }

    private addMiddlewares(bdParser: ExpressBodyParser = bodyParser, ckParser: ExpressCookieParser = cookieParser, serveStatic: ExpressStatic = express.static) {
        this.expressApp.use(bdParser.json());
        this.expressApp.use(bdParser.urlencoded({ extended: false }));
        this.expressApp.use(ckParser());
        this.expressApp.use(this.handleCORS);
        const staticOptions: ServeStaticOptions = {
            etag: true,
            immutable: true,
            index: false,
            lastModified: true,
            maxAge: 24 * 3600 * 1000, // 24 heures seconds
            redirect: false
        };
        this.expressApp.use('/images', serveStatic(__dirname + '/../../src/client/images', staticOptions));
    }

    private addServertRoutes() {
        this.expressApp.use(ComputersController.getInstance().getRouter());
    }

    private addClientRoutes() {
    }
}

/* istanbul ignore if */
if (process.argv[1].endsWith('/dist/server/index.js')) {
    new Server().start(Number(process.env.PORT || '8082'));
}