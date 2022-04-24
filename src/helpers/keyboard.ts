import { Markup } from 'telegraf'
import { UserPoster } from '../store/user'

export const BACK_SYMBOL = '↩️'
export const FINISH_SYMBOL = '✅'

export const callbackButton = (text: string, data: string) => ({
    text,
    callback_data: data,
})

export const NotifyKeyboard = (poster: UserPoster) => (
    Markup.keyboard([
        [callbackButton('Notify', `${poster.id}: ${poster.subscribers.join(',')}`)],
    ]).reply_markup
)
