import getRandomInt from "../modules/random.mjs"
import saveMessage from "../modules/messages/save.mjs"
import generateMarkov from "../modules/messages/generate.mjs"
import weightedRandom from "../modules/randomWeight.mjs"
import stickerChoice from "../modules/messages/sticker.mjs"
import initChat from "../modules/chats/initChat.mjs"
import isChatExists from "../modules/chats/isChatExists.mjs"
import on_direct_message from "./on_direct_message.mjs"

const reactionsList = ['🤩', '🤮', '🙏', '🕊', '🤡', '🥱', '😍', '🌚', '🌭', '💯', '🖕', '😈', '😎', '💊', '🤷‍♂️', '🤷‍♀️', '🤨', '😴', '🤓', '🗿']

export default async function on_message(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            const [isExists, chat] = await isChatExists(ctx.message.chat.id);

            if (isExists && chat?.enabled) {
                if (ctx?.message?.text) {
                    await saveMessage(ctx.message.text, ctx.message.chat.id, "messages")
                }

                if (getRandomInt(6) === 5) {
                    await ctx.react(reactionsList[getRandomInt(reactionsList.length)])
                }

                if (ctx?.message?.reply_to_message?.from?.id === ctx.botInfo.id
                    || ctx?.message?.text?.toLowerCase().startsWith(process.env.bot_name)
                    || ctx?.message?.text?.includes(ctx.botInfo.username)
                    || getRandomInt(15) === 14) {
                    const messageType = weightedRandom(["message", "sticker"], [85, 15])

                    switch (messageType) {
                        case "message":
                            const generatedSentence = await generateMarkov(ctx.message?.text, ctx.message.chat.id, 25, chat.mode);
                            const fixedSentence = generatedSentence[0]?.toUpperCase() + generatedSentence?.slice(1);

                            await ctx.telegram.sendChatAction(ctx.message.chat.id, 'typing');

                            setTimeout(async () => {
                                try {
                                    await ctx.reply(fixedSentence, { reply_to_message_id: ctx.message.message_id });
                                } catch (error) {
                                    console.log(error);
                                }
                            }, (fixedSentence.length / 5) * 1000);

                            break;
                        case "sticker":
                            await ctx.telegram.sendChatAction(ctx.message.chat.id, 'choose_sticker');

                            setTimeout(async () => {
                                try {
                                    await ctx.replyWithSticker(await stickerChoice(ctx.message.chat.id), { reply_to_message_id: ctx.message.message_id });
                                } catch (error) {
                                    console.log(error);
                                }
                            }, (Math.random() * 2000));

                            break;
                        default:
                            break;
                    }
                }
            } else {
                await initChat(ctx.message.chat.id, true, "default", ctx);
            }
        } else try { on_direct_message(ctx) } catch (error) { console.log(error) }
    } catch (error) {
        console.log(error)
    }
}