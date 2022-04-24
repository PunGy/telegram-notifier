// Absolute path resolution
import 'app-module-path/register'

import * as fs from 'fs'
import { Markup, Telegraf } from 'telegraf'
import * as O from 'fp-ts/lib/Option'

const fileName = 'main'

// Configure runtime environment
import { config } from 'dotenv'
import { NotifyKeyboard } from './helpers/keyboard'
import { getArgs, Arguments } from 'helpers/args'
import { useLogger } from 'helpers/logger'

const Logger = useLogger(fileName)

const cwd = process.cwd()
const args = getArgs()

declare global {
    namespace NodeJS {
        interface Process {
            runtimeArgs: Readonly<Arguments>;
        }
    }
}
process.runtimeArgs = args

let envFile = `${cwd}/.env`
if (args.test)
{
    if (fs.existsSync(`${cwd}/.env.test`))
        envFile = `${cwd}/.env.test`
    else
        Logger.warning('Bot is running in test mode, but .env.test is not exist! Using .env instead')()
}
config({ path: envFile })

// Main app logic
import { isNil } from 'helpers/functions'
import { LocalContext } from 'types/context'
import {
    createUserSubscriber,
    useStoreSubscribers,
    createUserPoster,
    useStorePosters,
    UserState,
} from 'store/user'


if (isNil(process.env.BOT_TOKEN))
{
    Logger.error('Bot token is not defined! Please, define it in the .env (or .env.test) file')()
    process.exit(1)
}

const bot = new Telegraf<LocalContext>(process.env.BOT_TOKEN)

const StorePosters = useStorePosters()
const StoreSubscribers = useStoreSubscribers()

// Middlewares

bot.use((ctx, next) =>
{
    Logger.info(ctx.from)()
    if (isNil(ctx.from)) return

    // Setup user state
    const userId = String(ctx.from.id)
    ctx.userState = O.fold<UserState, O.Option<UserState>>(
        () => StoreSubscribers.getUser(userId),
        O.some,
    )(StorePosters.getUser(userId))

    next()
})

bot.command('start', async (ctx, next) =>
{
    Logger.info(ctx.update)()

    const poster = createUserPoster('id', 'max', 'max')
    poster.subscribers = ['id1', 'id2', 'id3']

    await ctx.reply('Hello', {
        reply_markup: NotifyKeyboard(poster),
    })
    Logger.info('done!')()

    next()
})

bot.on('callback_query', (ctx) =>
{
    Logger.info(ctx.update)()
})

bot
    .launch()
    .then(Logger.info('Bot started'))


const shutdownBot = (signal: string) => () =>
{
    bot.stop(signal)
    Logger.info('Bot is turned off')()
}
process.once('SIGINT', shutdownBot('SIGINT'))
process.once('SIGTERM', shutdownBot('SIGTERM'))
