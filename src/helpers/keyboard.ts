export const BACK_SYMBOL = '↩️'
export const FINISH_SYMBOL = '✅'

export const callbackButton = (text: string, data: string) => ({
    text,
    callback_data: data,
})

export const button = (text: string) => ({
    text,
})
