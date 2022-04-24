import arg from 'arg'
import { pipe } from 'fp-ts/lib/function'
import { trimStart } from './functions'

interface Arguments {
    test?: boolean;
}
const argumentsList = {
    '--test': Boolean,
}

const getArgs = (): Readonly<Arguments> => pipe(
    arg(argumentsList),
    (args) => (
        pipe(
            Object.entries(args).slice(1).map(([key, val]) => [trimStart(key, '-'), val]),
            Object.fromEntries,
        )
    ),
)

export {
    Arguments,
    getArgs,
}

