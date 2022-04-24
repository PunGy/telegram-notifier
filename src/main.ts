// Absolute path resolution
import 'app-module-path/register'

import * as fs from 'fs'
import { Telegraf } from 'telegraf'

const fileName = 'main'

// Configure runtime environment
import { config } from 'dotenv'
import { connectDatabase } from './helpers/database'
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

const db = connectDatabase()

// Main app logic
import { isNil } from 'helpers/functions'
import { LocalContext } from 'types/context'
import {
    useStore,
} from 'store/user'


if (isNil(process.env.BOT_TOKEN))
{
    Logger.error('Bot token is not defined! Please, define it in the .env (or .env.test) file')()
    process.exit(1)
}

const bot = new Telegraf<LocalContext>(process.env.BOT_TOKEN)

const Store = useStore()

// Middlewares

db.values().all()
    .then((users) =>
    {
        if (users.length > 0)
        {
            users.forEach((user) =>
            {
                Store.addUser(JSON.parse(user))
            })
        }

        bot.use((ctx, next) =>
        {
            Logger.info(ctx.from)()
            if (isNil(ctx.from)) return

            // Setup user state
            ctx.userState = Store.getUser(ctx.from.id)

            next()
        })

        bot.command('start', async (ctx, next) =>
        {
            Logger.info(ctx.update)()

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
    })
