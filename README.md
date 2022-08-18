# telegram-notifier

Telegram Bot application for notifying. It is a general *Observer* pattern realization accomplished in the telegram bot. Can be extended in many different manners

## Starting the application

0. Pull source code
1. `yarn install`
2. Create `.env` file with neccessary variables
3. Run `yarn dev-now`

## Usage

Open telegram bot chat BOT_TOKEN of which belongs to.
* Run `/start` for registration.
* Run `/get_subscribers` to receive invitation code. Send it to those who you want to be your subscriber
* Run `/subscribe [code]` to subscribe.
* Run `/notify` to ping your subscribers

## ENV variables

```bash
BOT_TOKEN="" # the token of your telegram bot
```
