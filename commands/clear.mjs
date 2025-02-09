import isAdmin from "../modules/isAdmin.mjs";
import initChat from "../modules/chats/initChat.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import getClearKeyboard from "../modules/inline/clear.mjs";

export default async function clear(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then(async (result) => {
            	try {
                    if (result) {
                        await ctx.reply("Выберите что вам нужно очистить в БД Заглыта", {
                            reply_markup: {
                                inline_keyboard: getClearKeyboard()
                            }
                        })
                    } else {
                        await ctx.reply("❌ Команда доступна только для администраторов")
                    }
				} catch (error) {
                	console.log(error);
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