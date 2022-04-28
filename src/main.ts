import * as fs from 'fs'
import { Telegraf } from 'telegraf'
import { config } from 'dotenv'
import * as O from 'fp-ts/lib/Option.js'
import { pipe } from 'fp-ts/lib/function.js'
import {
    createUser,
    User,
    useStore as useUserStore,
} from './store/user.js'
import { Context, LocalContext } from './context.js'
import { connectDatabase, read, write } from './helpers/database.js'
import { getArgs, Arguments } from './helpers/args.js'
import { isNil } from './helpers/functions/index.js'
import { useLogger } from './helpers/logger.js'
import { NotifyKeyboard } from './keyboards.js'
import { createInvitation, useStore as useInvitationsStore } from './store/invitations.js'


// Configure runtime

const Logger = useLogger('main')

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
        Logger.warning('Bot is running in test mode, but .env.test is not exist! Using .env instead')
}
config({ path: envFile })
// Main app logic

if (isNil(process.env.BOT_TOKEN))
{
    Logger.error('Bot token is not defined! Please, define it in the .env (or .env.test) file')
    process.exit(1)
}

const bot = new Telegraf<LocalContext>(process.env.BOT_TOKEN)

const db = connectDatabase()
const DB = {
    write: write(db),
    read: read(db),
}

const notAuthorizedReply = (ctx: Context) => () => ctx.reply('You are not authorized! Run /start')

// Middlewares

DB.read()
    .then((userStore) =>
    {
        const UserStore = useUserStore(userStore)
        const InvitationsStore = useInvitationsStore(new Map())

        bot.use((ctx, next) =>
        {
            Logger.info(ctx.from)
            if (isNil(ctx.from)) return

            // Setup user state
            ctx.userState = UserStore.getUser(ctx.from.id)

            next()
        })

        bot.command('start', async (ctx, next) =>
        {
            Logger.info(`Got update` )

            await O.fold<User, Promise<any>>(
                () =>
                {
                    UserStore.addUser(createUser(ctx.from.id))
                    DB.write(userStore)
                    return ctx.reply('You was successfully registered!', { reply_markup: NotifyKeyboard() })
                },
                () => ctx.reply('You are already registered!', { reply_markup: NotifyKeyboard() }),
            )(ctx.userState)

            next()
        })

        bot.command('get_subscribers', async (ctx, next) =>
        {
            await O.fold<User, Promise<any>>(
                notAuthorizedReply(ctx),
                (user) =>
                {
                    try
                    {
                        const [key, id] = createInvitation(user.id)
                        InvitationsStore.addInvitation(key, id)

                        return ctx.reply(`Share this key to those who wants to subscribes to you`)
                            .then(() => ctx.reply(key))
                    }
                    catch (e)
                    {
                        Logger.error('Failed while executing registration!', e)
                        return ctx.reply('Error occurred!')
                    }
                },
            )(ctx.userState)

            next()
        })

        bot.command('notify', async (ctx, next) =>
        {

            await O.fold<User, Promise<any>>(
                notAuthorizedReply(ctx),
                (user) => Promise
                    .all(Array.from(user.subscribers).map(id => ctx.telegram.sendMessage(id, `Notification from ${ctx.from.username}`)))
                    .then(() => ctx.reply('Subscribers was successfully notified')),
            )(ctx.userState)

            next()
        })

        bot.command('subscribe', async (ctx, next) =>
        {
            await O.fold<User, Promise<any>>(
                notAuthorizedReply(ctx),
                (user) =>
                {
                    try
                    {
                        const key = ctx.message.text.split(' ')[1]
                        if (isNil(key)) return ctx.reply(
                            'Wrong usage of parameters! Usage: /subscribe [key]'
                            + '\n\nFor receiving a key, publisher should run /get_subscribers',
                        )

                        return pipe(
                            InvitationsStore.getId(key),
                            O.fold(
                                () => ctx.reply('No such invitation! Ensure the is key is right'),
                                (id) =>
                                {
                                    InvitationsStore.deleteInvitation(key)
                                    return pipe(
                                        UserStore.addSubscriber(id, user.id),
                                        O.fold(
                                            () => ctx.reply('Cannot find such publisher!'),
                                            () =>
                                            {
                                                DB.write(userStore)
                                                return ctx.reply('Successfully subscribed to a new publisher!')
                                            },
                                        ),
                                    )
                                },
                            ),
                        )
                    }
                    catch (e)
                    {
                        Logger.error('Failed while executing subscribing!', e)
                        return ctx.reply('Error occurred!')
                    }
                },
            )(ctx.userState)

            next()
        })

        bot.on('callback_query', (ctx) =>
        {
            Logger.info('got callback query', ctx.update)
        })

        bot
            .launch()
            .then(() => Logger.info('Bot started'))


        const shutdownBot = (signal: string) => () =>
        {
            bot.stop(signal)
            Logger.info('Bot is turned off')
        }
        process.once('SIGINT', shutdownBot('SIGINT'))
        process.once('SIGTERM', shutdownBot('SIGTERM'))
    })
