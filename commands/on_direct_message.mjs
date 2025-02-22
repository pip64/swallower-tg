import getRandomInt from "../modules/random.mjs"
import saveMessage from "../modules/messages/save.mjs"
import generateMarkov from "../modules/messages/generate.mjs"
import weightedRandom from "../modules/randomWeight.mjs"
import stickerChoice from "../modules/messages/sticker.mjs"
import initChat from "../modules/chats/initChat.mjs"
import isChatExists from "../modules/chats/isChatExists.mjs"

const reactionsList = ['🤩', '🤮', '🙏', '🕊', '🤡', '🥱', '😍', '🌚', '🌭', '💯', '🖕', '😈', '😎', '💊', '🤷‍♂️', '🤷‍♀️', '🤨', '😴', '🤓', '🗿']

export default async function on_direct_message(ctx) {
    try {
        if (['private'].includes(ctx.chat.type)) {
            const [isExists, chat] = await isChatExists(ctx.message.chat.id, "users");

            if (isExists) {
                if (ctx?.message?.text) {
                    await saveMessage(ctx.message.text, ctx.message.chat.id, "messages", "direct")
                }

                if (getRandomInt(6) === 5) {
                    await ctx.react(reactionsList[getRandomInt(reactionsList.length)])
                }

                const generatedSentence = await generateMarkov(ctx.message?.text, ctx.message.chat.id, 25, chat.mode, "direct");
                const fixedSentence = generatedSentence[0]?.toUpperCase() + generatedSentence?.slice(1);

                await ctx.telegram.sendChatAction(ctx.message.chat.id, 'typing');

                setTimeout(async () => {
                    try {
                        await ctx.reply(fixedSentence, { reply_to_message_id: ctx.message.message_id });
                    } catch (error) {
                        console.log(error);
                    }
                }, (fixedSentence.length / 5) * 1000);
            } else {
                await initChat(ctx.message.chat.id, true, "default", ctx, "users");
                await ctx.reply("Привет! Теперь я тебя знаю и мы можем начать общение.")
            }
        }
    } catch (error) {
        console.log(error)
    }
}