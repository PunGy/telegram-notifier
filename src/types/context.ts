import { Context as TelegrafContext } from 'telegraf'
import { Option } from 'fp-ts/lib/Option'
import { UserState } from 'store/user'

export interface LocalContext extends TelegrafContext
{
    userState: Option<UserState>;
}

export type Context = LocalContext & TelegrafContext
