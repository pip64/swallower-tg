import { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import fs from 'fs'
import path from 'path'
import 'dotenv/config'

import startCommand from "./commands/start.mjs"
import on_message from "./commands/on_message.mjs"
import on_sticker from "./commands/on_sticker.mjs"
import clear from "./commands/clear.mjs"
import mailToAll from "./commands/admin/mail_to_all.mjs"
import Mode from "./commands/mode.mjs"
import selectModeHandler from "./handlers/select_mode.mjs"
import { clearAllHandler, clearMessagesHandler, clearStickersHandler } from "./handlers/clear.mjs"
import { enableBotHandler, disableBotHandler } from "./handlers/switcher.mjs"
import switcher from "./commands/switcher.mjs"
import informationChat from "./commands/info.mjs"
import generatePoemCommand from "./commands/poem.mjs"
import newMode from "./commands/newmode.mjs"
import download from "./commands/download.mjs"
import generateStoryCommand from "./commands/story.mjs"

const bot = new Telegraf(process.env.token)
const requestQueue = new Map()
const messageQueue = new Map()
const MAX_CONCURRENT_REQUESTS = 30
const REQUEST_TIMEOUT = 15000
const MAX_QUEUE_SIZE = 1000

const wrapHandlerWithTimeout = (handler, timeout = 30000) => {
    return async (ctx, next) => {
        const chatId = ctx.chat?.id
        if (!chatId) {
            return handler(ctx, next)
        }

        if (requestQueue.size >= MAX_CONCURRENT_REQUESTS) {
            console.warn(`Too many concurrent requests (${requestQueue.size}/${MAX_CONCURRENT_REQUESTS})`)
            try {
                await ctx.reply("Слишком много запросов, попробуйте позже")
            } catch (error) {
                console.error('Failed to send rate limit message:', error)
            }
            return
        }

        const requestInfo = {
            type: ctx.updateType,
            startTime: Date.now()
        }
        requestQueue.set(chatId, requestInfo)

        let timeoutId
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error(`Handler timed out after ${timeout}ms`))
            }, timeout)
        })

        try {
            const result = await Promise.race([
                handler(ctx, next),
                timeoutPromise
            ])
            clearTimeout(timeoutId)
            return result
        } catch (error) {
            clearTimeout(timeoutId)
            console.error(`Handler error for ${requestInfo.type}: ${error.message}`)
            logErrorToFile(error)
            
            if (ctx && ctx.reply && !ctx.replied) {
                try {
                    await ctx.reply("Произошла ошибка при обработке запроса. Пожалуйста, повторите позже.")
                } catch (replyError) {
                    console.error('Failed to send error message:', replyError)
                }
            }
            
            throw error
        } finally {
            requestQueue.delete(chatId)
        }
    }
}

const logErrorToFile = (error) => {
    const errorFilePath = path.resolve('errors.txt')
    const date = new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
    const logMessage = `${date}\n${error.stack || error}\n\n`
    fs.appendFileSync(errorFilePath, logMessage, { encoding: 'utf8' })
}

const processQueue = async (chatId) => {
    const queue = messageQueue.get(chatId) || []
    if (queue.length === 0) return

    if (requestQueue.size >= MAX_CONCURRENT_REQUESTS) {
        if (queue.length > MAX_QUEUE_SIZE) {
            queue.shift()
        }
        return
    }

    const handler = queue.shift()
    requestQueue.set(chatId, true)
    try {
        await handler()
    } finally {
        requestQueue.delete(chatId)
        if (queue.length > 0) {
            processQueue(chatId)
        }
    }
}

const processRequest = async (chatId, handler) => {
    if (requestQueue.size >= MAX_CONCURRENT_REQUESTS) {
        console.warn(`Too many concurrent requests for chat ${chatId}, request dropped`)
        return
    }

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
    })

    requestQueue.set(chatId, true)
    try {
        await Promise.race([handler(), timeoutPromise])
    } catch (error) {
        console.error(`Error processing request for chat ${chatId}:`, error)
    } finally {
        requestQueue.delete(chatId)
    }
}

setInterval(() => {
    const used = process.memoryUsage()
    console.log(`Memory usage: ${Math.round(used.heapUsed / 1024 / 1024)}MB`)
    console.log(`Active requests: ${requestQueue.size}/${MAX_CONCURRENT_REQUESTS}`)
    
    const now = Date.now()
    for (const [chatId, info] of requestQueue.entries()) {
        const duration = now - info.startTime
        console.log(`Chat ${chatId}: ${info.type} request running for ${duration}ms`)
    }
}, 30000)

bot.start(wrapHandlerWithTimeout(startCommand))
bot.command("enable", wrapHandlerWithTimeout(switcher))
bot.command("disable", wrapHandlerWithTimeout(switcher))
bot.command("clear", wrapHandlerWithTimeout(clear))
bot.command("mail", wrapHandlerWithTimeout(mailToAll, 300000))
bot.command("download", wrapHandlerWithTimeout(download))
bot.command("mode", wrapHandlerWithTimeout(Mode))
bot.command("switcher", wrapHandlerWithTimeout(switcher))
bot.command("information", wrapHandlerWithTimeout(informationChat))
bot.command("poem", wrapHandlerWithTimeout(generatePoemCommand))
bot.command("story", wrapHandlerWithTimeout(generateStoryCommand))
bot.command("newmode", wrapHandlerWithTimeout(newMode))

bot.action("bot_enable", wrapHandlerWithTimeout(enableBotHandler))
bot.action("bot_disable", wrapHandlerWithTimeout(disableBotHandler))
bot.action("clear_messages", wrapHandlerWithTimeout(clearMessagesHandler))
bot.action("clear_stickers", wrapHandlerWithTimeout(clearStickersHandler))
bot.action("clear_all", wrapHandlerWithTimeout(clearAllHandler))

bot.on('callback_query', wrapHandlerWithTimeout(selectModeHandler))
bot.on(message('text'), wrapHandlerWithTimeout(on_message))
bot.on(message('poll'), wrapHandlerWithTimeout(on_message))
bot.on(message('sticker'), wrapHandlerWithTimeout(on_sticker))

const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...')
    try {
        await bot.stop()
        console.log('Bot stopped successfully')
        process.exit(0)
    } catch (error) {
        console.error('Error during shutdown:', error)
        process.exit(1)
    }
}

process.once('SIGINT', gracefulShutdown)
process.once('SIGTERM', gracefulShutdown)

bot.launch({
    dropPendingUpdates: true,
    allowedUpdates: ['message', 'callback_query'],
    polling: {
        timeout: 30,
        limit: 50,
        retryAfter: 1
    }
}, () => console.log(process.env.bot_name, 'успешно запущен!'))
    .catch((err) => {
        console.error('Ошибка при запуске бота:', err)
        process.exit(1)
    })