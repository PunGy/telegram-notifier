import { fromNullable, none, some } from 'fp-ts/lib/Option.js'

export interface User {
    id: number;
    subscribers: Set<number>;
}

export type Store = Map<number, User>

export const createUser = (id: number): User => ({
    id,
    subscribers: new Set(),
})

// Only add a new user. If the user are already there - it would be not rewrote
export const addUser = (store: Store) => (user: User) =>
{
    if (!store.has(user.id))
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

export const addSubscriber = (store: Store) => (publisherId: number, userId: number) => (
    fromNullable(store.get(publisherId)?.subscribers.add(userId))
)
export const removeSubscriber = (store: Store) => (publisherId: number, userId: number) => (
    fromNullable(store.get(publisherId)?.subscribers.delete(userId))
)

export const getUser = (store: Store) => (id: number) => (
    fromNullable(store.get(id))
)

export const useStore = (store = new Map) => ({
    addUser: addUser(store),
    getUser: getUser(store),
    deleteUser: deleteUser(store),
    addSubscriber: addSubscriber(store),
    removeSubscriber: removeSubscriber(store),
})
