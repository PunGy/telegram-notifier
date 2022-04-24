import { Level } from 'level'

export const connectDatabase = () => (
    new Level('./database', { valueEncoding: 'json' })
)

export const put = (db: Level) => <T>(key: string, value: T) => (
    db.put(key, typeof value === 'string' ? value : JSON.stringify(value))
)
