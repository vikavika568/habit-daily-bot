import { Telegraf, Markup } from 'telegraf'
import generateJpeg from './statistics.js'
import { config } from 'dotenv'
import Database from '@/db'

config()

const bot = new Telegraf(process.env.TOKEN)

const db = new Database()

bot.start(async (ctx) => {
  const authed = await db.auth(ctx.message.chat.id)

  if (authed) {
    return ctx.reply(
      'шо это тут у нас',
      Markup.keyboard([
        [
          Markup.button.callback('я сделяль с:', 'done'),
          Markup.button.callback('статистика', 'second')
        ]
      ]).resize()
    )
  } else {
    return ctx.reply('forbidden')
  }
})

bot.hears('я сделяль с:', async (ctx) => {
  try {
    const habits = await db.getHabits(ctx.message.chat.id, new Date())

    const buttons = []

    habits.forEach((elem) => {
      buttons.push([{ text: elem.title, callback_data: `action-${elem._id}` }])
    })

    ctx.reply('Что сделяль?', {
      reply_markup: {
        inline_keyboard: buttons
      }
    })
  } catch (e) {
    return ctx.reply('forbidden')
  }
})

bot.action(/action-.*/, async (ctx) => {
  const actionId = ctx.match[0].replace('action-', '')
  const chatId = ctx.update.callback_query.message.chat.id
  const messageId = ctx.update.callback_query.message.message_id

  try {
    await db.doneHabit(chatId, actionId)
  } catch (e) {
    return ctx.reply('ты уже отмечал(а) эту привычку сегодня')
  }

  try {
    const habits = await db.getHabits(chatId, new Date())

    const buttons = []

    habits.forEach((elem) => {
      buttons.push([{ text: elem.title, callback_data: `action-${elem._id}` }])
    })

    bot.telegram.editMessageReplyMarkup(chatId, messageId, messageId, {
      inline_keyboard: buttons
    })
    return ctx.reply('Супер!')
  } catch (e) {
    return ctx.reply('forbidden')
  }
})

bot.hears('статистика', async (ctx) => {
  return ctx.replyWithPhoto({ source: Buffer.from(generateJpeg(), 'base64') })
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
