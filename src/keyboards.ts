import { Markup } from 'telegraf'
import { button } from './helpers/keyboard.js'

// Keyboards:
export const NotifyKeyboard = () =>
{
    const keyboard = (
        Markup.keyboard([
            [button('/notify')],
        ]).reply_markup
    )
    keyboard.resize_keyboard = true

    return keyboard
}

// Inline Keyboards:
