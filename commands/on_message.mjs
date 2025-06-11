import getRandomInt from "../modules/random.mjs"
import saveMessage from "../modules/messages/save.mjs"
import generateMarkov from "../modules/messages/generate.mjs"
import weightedRandom from "../modules/randomWeight.mjs"
import stickerChoice from "../modules/messages/sticker.mjs"
import initChat from "../modules/chats/initChat.mjs"
import isChatExists from "../modules/chats/isChatExists.mjs"
import on_direct_message from "./on_direct_message.mjs"
import gtts from 'gtts'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const reactionsList = ['🤩', '🤮', '🙏', '🕊', '🤡', '🥱', '😍', '🌚', '🌭', '💯', '🖕', '😈', '😎', '💊', '🤷‍♂️', '🤷‍♀️', '🤨', '😴', '🤓', '🗿']
const MAX_MESSAGE_LENGTH = 1000
const MAX_REACTION_INTERVAL = 10000
const MAX_TYPING_TIME = 5000
const lastReactions = new Map()

export default async function on_message(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            const [isExists, chat] = await isChatExists(ctx.message.chat.id)

            if (isExists && chat?.enabled) {
                if (ctx?.message?.text) {
                    saveMessage(ctx.message.text, ctx.message.chat.id, "messages")
                        .catch(error => console.error('Error saving message:', error))
                }

                const chatId = ctx.message.chat.id
                const lastReaction = lastReactions.get(chatId) || 0
                const now = Date.now()

                const shouldRespond = 
                    ctx?.message?.reply_to_message?.from?.id === ctx.botInfo.id ||
                    ctx?.message?.text?.toLowerCase().startsWith(process.env.bot_name) ||
                    ctx?.message?.text?.includes(ctx.botInfo.username) ||
                    getRandomInt(15) === 14

                if (!shouldRespond) {
                    if (getRandomInt(6) === 5 && (now - lastReaction) > MAX_REACTION_INTERVAL) {
                        ctx.react(reactionsList[getRandomInt(reactionsList.length)])
                            .catch(error => console.error('Error sending reaction:', error))
                        lastReactions.set(chatId, now)
                    }
                    return
                }

                const messageType = weightedRandom(["message", "sticker", "voice"], [55, 15, 30])

                switch (messageType) {
                    case "message":
                        try {
                            const generatedSentence = await generateMarkov(
                                ctx.message?.text, 
                                ctx.message.chat.id, 
                                Math.min(25, MAX_MESSAGE_LENGTH), 
                                chat.mode
                            )

                            if (!generatedSentence) {
                                throw new Error('Failed to generate sentence')
                            }

                            const fixedSentence = generatedSentence[0]?.toUpperCase() + 
                                generatedSentence?.slice(1)

                            const typingTime = Math.min((fixedSentence.length / 10) * 1000, MAX_TYPING_TIME)
                            
                            await ctx.telegram.sendChatAction(ctx.message.chat.id, 'typing')
                            await new Promise(resolve => setTimeout(resolve, typingTime))
                            await ctx.reply(fixedSentence, { 
                                reply_to_message_id: ctx.message.message_id 
                            })
                        } catch (error) {
                            console.error('Error generating/sending message:', error)
                            await ctx.reply('Извините, произошла ошибка при генерации ответа.')
                                .catch(console.error)
                        }
                        break

                    case "voice":
                        try {
                            const generatedSentence = await generateMarkov(
                                ctx.message?.text, 
                                ctx.message.chat.id, 
                                Math.min(25, MAX_MESSAGE_LENGTH), 
                                chat.mode
                            )

                            if (!generatedSentence) {
                                throw new Error('Failed to generate sentence')
                            }

                            const fixedSentence = generatedSentence[0]?.toUpperCase() + 
                                generatedSentence?.slice(1)

                            await ctx.telegram.sendChatAction(ctx.message.chat.id, 'record_voice')
                            
                            const tts = new gtts(fixedSentence, 'ru')
                            const voicePath = path.join(process.cwd(), 'database', 'voice', `voice_${Date.now()}.mp3`)
                            
                            await new Promise((resolve, reject) => {
                                tts.save(voicePath, (err) => {
                                    if (err) reject(err)
                                    else resolve()
                                })
                            })

                            await ctx.replyWithVoice({ source: voicePath }, {
                                reply_to_message_id: ctx.message.message_id
                            })

                            fs.unlinkSync(voicePath)
                        } catch (error) {
                            console.error('Error generating/sending voice message:', error)
                            await ctx.reply('Извините, произошла ошибка при генерации голосового сообщения.')
                                .catch(console.error)
                        }
                        break

                    case "sticker":
                        try {
                            await ctx.telegram.sendChatAction(ctx.message.chat.id, 'choose_sticker')
                            
                            const sticker = await stickerChoice(ctx.message.chat.id)
                            if (!sticker) {
                                throw new Error('Failed to get sticker')
                            }

                            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
                            await ctx.replyWithSticker(sticker, { 
                                reply_to_message_id: ctx.message.message_id 
                            })
                        } catch (error) {
                            console.error('Error sending sticker:', error)
                            await ctx.reply('Извините, не удалось отправить стикер.')
                                .catch(console.error)
                        }
                        break
                }
            } else {
                initChat(ctx.message.chat.id, true, "default", ctx, undefined, false)
                    .catch(error => console.error('Error initializing chat:', error))
            }
        } else {
            on_direct_message(ctx)
                .catch(error => console.error('Error in direct message handler:', error))
        }
    } catch (error) {
        console.error('Critical error in message handler:', error)
    }
}