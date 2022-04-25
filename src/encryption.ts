import aes from 'aes-js'
import { pipe } from 'fp-ts/lib/function.js'

export const createCounter = (AES_KEY: Array<number>) => (
    new aes.ModeOfOperation.ctr(AES_KEY, new aes.Counter(5))
)

export const decrypt = (AES_KEY: Array<number>, key: string) => pipe(
    aes.utils.hex.toBytes(key), // transform hex to bytes
    bytes => createCounter(AES_KEY).decrypt(bytes), // decrypt
    aes.utils.utf8.fromBytes, // transform decrypted bytes to string
    str => parseInt(str, 10), // transform string to number
)

export const encrypt = (AES_KEY: Array<number>, id: number) => pipe(
    String(id),
    aes.utils.utf8.toBytes,
    bytes => createCounter(AES_KEY).encrypt(bytes),
    aes.utils.hex.fromBytes,
)
