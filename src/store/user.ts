import { has } from 'fp-ts/lib/Record'
import { fromNullable, none, some } from 'fp-ts/lib/Option'

export interface User {
    id: string;
    login: string;
    password: string;
}

export interface UserPoster extends User
{
    type: 'poster';
    subscribers: Array<string>;
}
export interface UserSubscriber extends User
{
    type: 'subscriber';
    listen: Array<string>;
}

type StorePosters = Record<string, UserPoster>
type StoreSubscribers = Record<string, UserSubscriber>

const storePosters: StorePosters = {}
const storeSubscribers: StoreSubscribers = {}

export type UserState = UserPoster | UserSubscriber
export type UserStore = Record<string, User>

export const createUserPoster = (id: string, login: string, password: string): UserPoster => ({
    id,
    login,
    password,
    type: 'poster',
    subscribers: [],
})

export const createUserSubscriber = (id: string, login: string, password: string): UserSubscriber => ({
    id,
    login,
    password,
    type: 'subscriber',
    listen: [],
})

// Only add a new user. If the user are already there - it would be not rewrote
export const addUser = <Store extends UserStore, UserType extends User>(store: Store) => (user: UserType) =>
{
    if (!has(user.id, store))
        (store as UserStore)[user.id] = user
    return user
}

export const deleteUser = <Store extends UserStore, UserType extends User>(store: Store) => (user: UserType) =>
{
    if (user.id in store)
    {
        delete store[user.id]
        return some(user)
    }
    return none
}

export const getUser = <Store extends UserStore, UserType extends User>(store: Store) => (id: string) => (
    fromNullable(store[id] as UserType)
)


export const useStorePosters = () => ({
    addUser: addUser<StorePosters, UserPoster>(storePosters),
    getUser: getUser<StorePosters, UserPoster>(storePosters),
    deleteUser: deleteUser<StorePosters, UserPoster>(storePosters),
})

export const useStoreSubscribers = () => ({
    addUser: addUser<StoreSubscribers, UserPoster>(storeSubscribers),
    getUser: getUser<StoreSubscribers, UserSubscriber>(storeSubscribers),
    deleteUser: deleteUser<StoreSubscribers, UserPoster>(storeSubscribers),
})
