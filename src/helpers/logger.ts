import * as C from 'fp-ts/lib/Console.js'
import { IO } from 'fp-ts/lib/IO.js'
import { create as createDate } from 'fp-ts/lib/Date.js'

type Level = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'

interface Entry <T> {
    messages: Array<T>;
    app: string;
    date: Date;
    level: Level;
}


function log<T>(logger: <A>(x: A) => IO<void>, entry: Entry<T>)
{
    const message = entry.messages.map((message) => typeof message === 'object'
        ? JSON.stringify(message, null, 2) : message,
    ).join(', ')

    logger(`${entry.level} [${entry.app}] ${entry.date.toLocaleString()}: ${message}`)()
}

const info = <T>(app: string) => (...messages: Array<T>) => log(
    C.info,
    {
        messages,
        app,
        date: createDate(),
        level: 'INFO',
    },
)
const debug = <T>(app: string) => (...messages: Array<T>) => log(
    C.log,
    {
        messages,
        app,
        date: createDate(),
        level: 'DEBUG',
    },
)
const warning = <T>(app: string) => (...messages: Array<T>) => log(
    C.warn,
    {
        messages,
        app,
        date: createDate(),
        level: 'WARNING',
    },
)
const error = <T>(app: string) => (...messages: Array<T>) => log(
    C.error,
    {
        messages,
        app,
        date: createDate(),
        level: 'ERROR',
    },
)

const useLogger = (app: string) => ({
    debug: debug(app),
    info: info(app),
    warning: warning(app),
    error: error(app),
})

export {
    info,
    debug,
    warning,
    error,
    useLogger,
}
