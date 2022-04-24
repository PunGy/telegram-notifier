import * as C from 'fp-ts/Console'
import { IO } from 'fp-ts/IO'
import { create as createDate } from 'fp-ts/Date'

type Level = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'

interface Entry <T> {
    message: T;
    app: string;
    date: Date;
    level: Level;
}


function log<T>(logger: <A>(x: A) => IO<void>, entry: Entry<T>)
{
    const message = typeof entry.message === 'object'
        ? JSON.stringify(entry.message, null, 2) : entry.message
    return logger(`${entry.level} [${entry.app}] ${entry.date.toLocaleString()}: ${message}`)
}

type LoggerFn<T> = (message: T, date?: Date) => IO<void>

const info = <T>(app: string): LoggerFn<T> => (message, date) => log(
    C.info,
    {
        message,
        app,
        date: date ?? createDate(),
        level: 'INFO',
    },
)
const debug = <T>(app: string): LoggerFn<T> => (message, date) => log(
    C.log,
    {
        message,
        app,
        date: date ?? createDate(),
        level: 'DEBUG',
    },
)
const warning = <T>(app: string): LoggerFn<T> => (message, date) => log(
    C.warn,
    {
        message,
        app,
        date: date ?? createDate(),
        level: 'WARNING',
    },
)
const error = <T>(app: string): LoggerFn<T> => (message, date) => log(
    C.error,
    {
        message,
        app,
        date: date ?? createDate(),
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
