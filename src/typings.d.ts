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

class Card {
    constructor(card: string | { [key: string]: any });
    setTitle(title: string): Card;
    setText(text: string): Card;
    setImage(imageUrl: string): Card;
    setButton(button: string | RichResponse): Card;
    setPlatform(platform: string): Card;
}

class Context {
    delete(name: string): void;
    get(name: string): { [key: string]: any };
    set(context: { name: string, lifespan: number, parameters?: { [key: string]: any } }): void;
}

class DialogflowConversation {
    ask(question: string): void;
}

class Suggestion {
    constructor(suggestion: string | { [key: string]: any });
    setReply(rely: string): Suggestion;
    setPlatform(platform: string): Suggestion;
}

class WebhookClient {
    constructor(request: any, response: any);
    context: Context;
    intent: string;
    parameters: { [key: string]: any };
    add(string): void;
    end(string): void;
    conv(): DialogflowConversation;
    handleRequest(intentMap: Map<string, (agent: WebhookClient) => void>): Promise<any>;
    setFollowupEvent(event: string | { name: string, languageCode?: string, paramters: { [key: string]: any } }): void
}