interface ExpressBodyParser {
    json(options?: OptionsJson): RequestHandler;
    urlencoded(options?: OptionsUrlencoded): RequestHandler;
}

interface ExpressCookieParser {
    (secret?: string | string[], options?: cookieParser.CookieParseOptions): express.RequestHandler;
}

interface ExpressStatic {
    (root: string, options?: ServeStaticOptions): express.Handler
}

type ExpressLogger = (format: string | (() => void), options?: object) => RequestHandler;

declare module 'dialogflow-fulfillment';

class DialogflowConversation {
    ask(question: string): void;
}

class WebhookClient {
    constructor(request: any, response: any);
    parameters: any;
    intent: string;
    add(string): void;
    conv(): DialogflowConversation;
    handleRequest(intentMap: Map<string, (agent: WebhookClient) => void>): Promise<any>;
}