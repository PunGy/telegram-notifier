import { fromNullable, none, some } from 'fp-ts/lib/Option'

export interface ListenParameter {
    id: number;
    name: string;
}
export interface User {
    id: number;
    subscribers: Array<string>;
    listen: Array<ListenParameter>;
}

type Store = Map<number, User>
const store: Store = new Map()

export const createUserPoster = (id: number): User => ({
    id,
    subscribers: [],
    listen: [],
})

// Only add a new user. If the user are already there - it would be not rewrote
export const addUser = (store: Store) => (user: User) =>
{
    if (store.has(user.id))
        store.set(user.id, user)
    return user
}

export const deleteUser = (store: Store) => (user: User) =>
{
    if (store.has(user.id))
    {
        store.delete(user.id)
        return some(user)
    }
    return none
}

export const getUser = (store: Store) => (id: number) => (
    fromNullable(store.get(id))
)

export const useStore = () => ({
    addUser: addUser(store),
    getUser: getUser(store),
    deleteUser: deleteUser(store),
})
