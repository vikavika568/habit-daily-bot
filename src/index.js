const { Telegraf, Markup } = require('telegraf')
const axios = require('axios')
const generateJpeg = require('./statistics')
require('dotenv').config()

const bot = new Telegraf(process.env.TOKEN)

const { API_URL } = process.env

bot.use(async (ctx, next) => {
  const { data } = await axios.post(API_URL, {
    method: 'auth',
    // chatId: ctx.message.chat.id
    chatId: 539135198
  })
  if (data.authed === true) {
    return next()
  }

  ctx.reply('forbidden')
  return undefined
})

bot.start((ctx) =>
  ctx.reply(
    'шо это тут у нас',
    Markup.keyboard([
      [
        Markup.button.callback('я сделяль с:', 'done'),
        Markup.button.callback('статистика', 'second')
      ]
    ]).resize()
  )
)
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.on('contact', (ctx) => ctx.reply(ctx.message.contact))
bot.hears('hi', async (ctx) => {
  axios
    .post(API_URL, {
      method: 'getUsers'
    })
    .then((response) => {
      console.log(response.data)
      console.log(
        '???????????????????????????????////',
        JSON.stringify(response.data.data)
      )
      ctx.reply(ctx.message.chat.id)
    })
})

// bot.hears('я сделяль с:',(ctx)=>ctx.reply('good job',Markup.inlineKeyboard([
//     Markup.button.callback('я сделяль с:', 'done'),
//     Markup.button.callback('другое', 'second'),
// ]).resize()))

// bot.hears('другое',async (ctx) => {
//     axios.post(API_URL,
//        {
//        method: 'getUsers',
//      })

bot.hears('я сделяль с:', async (ctx) => {
  axios
    .post(API_URL, {
      method: 'getHabits',
      chatId: ctx.message.chat.id
    })
    .then((response) => {
      console.log(response.data)
      console.log(
        '???????????????????????????????////',
        JSON.stringify(response.data)
      )

      const habits = response.data
      const buttons = []
      habits.forEach((elem) => {
        console.log(elem.title)
        buttons.push([{ text: elem.title, callback_data: `action-${elem.id}` }])
      })
      console.log('fffffffffffff', buttons)
      ctx.reply('Что сделяль?', {
        // прикрутим клаву
        reply_markup: {
          inline_keyboard: buttons
        }
      })
    })
})
bot.action(/action-\d+/, async (ctx) => {
  const actionId = +ctx.match[0].replace('action-', '')
  const chatId = ctx.update.callback_query.message.chat.id
  const messageId = ctx.update.callback_query.message.message_id

  const response = await axios.post(API_URL, {
    method: 'doneHabit',
    chatId,
    habitId: actionId
  })

  // console.log(response.data)
  console.log(ctx.update.callback_query.message.chat.id)
  //-----------
  const responseList = await axios.post(API_URL, {
    method: 'getHabits',
    chatId
  })
  const habits = responseList.data
  const buttons = []

  habits.forEach((elem) => {
    console.log(elem.title)
    buttons.push([{ text: elem.title, callback_data: `action-${elem.id}` }])
  })

  bot.telegram.editMessageReplyMarkup(chatId, messageId, messageId, {
    inline_keyboard: buttons
  })

  //-----------

  return ctx.reply('Супер!')
})
bot.hears('статистика', async (ctx) => {
  const response = await axios.post(API_URL, {
    method: 'getTodayStatistics'
  })
  console.log(response.data)
  return ctx.replyWithPhoto({ source: Buffer.from(generateJpeg(), 'base64') })
})

bot.on('sticker', (ctx) => ctx.reply('👍'))

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
