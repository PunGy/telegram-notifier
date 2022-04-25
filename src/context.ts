import { Context as TelegrafContext } from 'telegraf'
import { Option } from 'fp-ts/lib/Option.js'
import { User } from './user.js'

export interface LocalContext extends TelegrafContext
{
    userState: Option<User>;
}

export type Context = LocalContext & TelegrafContext
