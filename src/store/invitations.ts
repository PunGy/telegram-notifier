import { fromNullable } from 'fp-ts/lib/Option.js'

export type Store = Map<string, number>

export const createInvitation = (id: number): [string, number] => [
    Math.floor(Math.random() * 0xffffffff).toString(16), // 32-bit key
    id,
]

export const addInvitation = (store: Store) => (key: string, id: number) => store.set(key, id)
export const deleteInvitation = (store: Store) => (key: string) => store.delete(key)
export const getId = (store: Store) => (key: string) => fromNullable(store.get(key))

export const useStore = (store: Store) => ({
    addInvitation: addInvitation(store),
    deleteInvitation: deleteInvitation(store),
    getId: getId(store),
})
