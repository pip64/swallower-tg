import isAdmin from "../modules/isAdmin.mjs";
import initChat from "../modules/chats/initChat.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import getSwitcherKeyboard from "../modules/inline/switcher.mjs";

export default async function switcher(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then(async (result) => {
            	try {
                    const [isExists, chat] = await isChatExists(ctx.message.chat.id);

                    if (result) {
                        await ctx.reply("Включите или выключите бота.\n\nЕсли вы его выключите, то он перестанет писать в чат.\nЕсли включите, то он будет писать в чат.", {
                            reply_markup: {
                                inline_keyboard: getSwitcherKeyboard(chat.enabled)
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