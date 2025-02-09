import isAdmin from "../modules/isAdmin.mjs";
import initChat from "../modules/chats/initChat.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import setIsBotActive from "../modules/chats/enable.mjs";

export default async function disable (ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then(async (result) => {
                const [isExists, chat] = await isChatExists(ctx.message.chat.id);

                if (result) {
                    if (isExists && chat.enabled) {
                        const disableBot = await setIsBotActive(ctx.message.chat.id, false);

                        if (disableBot) {
                            await ctx.reply("✅ Теперь бот не будет отвечать в чате!")
                        } else {
                            await ctx.reply("Упс! Произошла ошибка 😅")
                        }
                    } else if (isExists && !chat.enabled) {
                        await ctx.reply("Бот итак отключен в чате 😅")
                    } else {
                        const init = await initChat(ctx.message.chat.id, false, ctx)

                        if (init) await ctx.reply("Бот итак отключен в чате 😅")
                        else await ctx.reply("Упс! Произошла ошибка 😅")
                    }
                } else {
                    await ctx.reply("❌ Команда доступна только для администраторов")
                }
            }).catch(async (error) => {
                console.log(error);
                await ctx.reply("Упс! Произошла ошибка 😅")
            })
        }
    } catch (error) {
        console.log(error);
    }
}