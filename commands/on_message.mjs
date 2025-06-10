import getRandomInt from "../modules/random.mjs"
import saveMessage from "../modules/messages/save.mjs"
import generateMarkov from "../modules/messages/generate.mjs"
import weightedRandom from "../modules/randomWeight.mjs"
import stickerChoice from "../modules/messages/sticker.mjs"
import initChat from "../modules/chats/initChat.mjs"
import isChatExists from "../modules/chats/isChatExists.mjs"
import on_direct_message from "./on_direct_message.mjs"

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
                    await saveMessage(ctx.message.text, ctx.message.chat.id, "messages")
                        .catch(error => console.error('Error saving message:', error))
                }

                const chatId = ctx.message.chat.id
                const lastReaction = lastReactions.get(chatId) || 0
                const now = Date.now()

                if (getRandomInt(6) === 5 && (now - lastReaction) > MAX_REACTION_INTERVAL) {
                    try {
                        await ctx.react(reactionsList[getRandomInt(reactionsList.length)])
                        lastReactions.set(chatId, now)
                    } catch (error) {
                        console.error('Error sending reaction:', error)
                    }
                }

                const shouldRespond = 
                    ctx?.message?.reply_to_message?.from?.id === ctx.botInfo.id ||
                    ctx?.message?.text?.toLowerCase().startsWith(process.env.bot_name) ||
                    ctx?.message?.text?.includes(ctx.botInfo.username) ||
                    getRandomInt(15) === 14

                if (shouldRespond) {
                    const messageType = weightedRandom(["message", "sticker"], [85, 15])

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

                                await ctx.telegram.sendChatAction(ctx.message.chat.id, 'typing')
                                
                                const typingTime = Math.min((fixedSentence.length / 5) * 1000, MAX_TYPING_TIME)
                                
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

                        case "sticker":
                            try {
                                await ctx.telegram.sendChatAction(ctx.message.chat.id, 'choose_sticker')
                                
                                const sticker = await stickerChoice(ctx.message.chat.id)
                                if (!sticker) {
                                    throw new Error('Failed to get sticker')
                                }

                                await new Promise(resolve => setTimeout(resolve, Math.random() * 2000))
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
                }
            } else {
                await initChat(ctx.message.chat.id, true, "default", ctx)
                    .catch(error => console.error('Error initializing chat:', error))
            }
        } else {
            try {
                await on_direct_message(ctx)
            } catch (error) {
                console.error('Error in direct message handler:', error)
            }
        }
    } catch (error) {
        console.error('Critical error in message handler:', error)
    }
}