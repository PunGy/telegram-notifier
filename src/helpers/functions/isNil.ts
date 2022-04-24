function isNil(x: unknown): x is undefined | null
{
    return x == null
}

export default isNil
