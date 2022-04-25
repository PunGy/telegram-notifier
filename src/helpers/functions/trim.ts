import { pipe } from 'fp-ts/lib/function.js'
import reverse from './reverse.js'

export function trimStart(str: string, char = ' '): string
{
    let result = ''

    for (let i = 0; i < str.length; i++)
    {
        if (str[i] !== char)
        {
            result = str.slice(i)
            break
        }
    }

    return result
}

export const trimEnd = (str: string, char = ' ') => pipe(
    trimStart(reverse(str), char),
    reverse,
)

export const trim = (str: string, char = '') => pipe(
    trimStart(str, char),
    str => trimEnd(str, char),
)


