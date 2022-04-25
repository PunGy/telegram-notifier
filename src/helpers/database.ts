import { join } from 'path'
import { Low, JSONFile } from 'lowdb'
import { Store, User } from '../user.js'

type JSONUser = Omit<User, 'subscribers'> & { subscribers: Array<number>; }
type JSONStore = Record<string, JSONUser>

export const connectDatabase = () =>
{
    const dbFile = join(process.cwd(), 'database.json')
    const adapter = new JSONFile<JSONStore>(dbFile)
    return new Low<JSONStore>(adapter)
}

export const write = (db: Low<JSONStore>) => async (store: Store) =>
{
    const raw: JSONStore = {}
    for (const key in store)
        raw[key].subscribers = Array.from(raw[key].subscribers)

    db.data = raw
    await db.write()
    db.data = null

    return store
}

export const read = (db: Low<JSONStore>) => async (): Promise<Store> =>
{
    await db.read()
    if (db.data == null) return new Map

    const store: Store = new Map(
        Object.entries(db.data).map<[number, User]>(([key, jsonUser]) =>
        {
            const user: User = {
                ...jsonUser,
                subscribers: new Set<number>(jsonUser.subscribers),
            }
            return [parseInt(key, 10), user]
        }),
    )

    db.data = null

    return store
}
