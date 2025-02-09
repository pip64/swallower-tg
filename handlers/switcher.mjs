import isAdmin from "../modules/isAdmin.mjs";
import initChat from "../modules/chats/initChat.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import setIsBotActive from "../modules/chats/enable.mjs";
import getSwitcherKeyboard from "../modules/inline/switcher.mjs";

export async function disableBotHandler (ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.from.id, ctx).then(async (result) => {
            	try {
                    const [isExists, chat] = await isChatExists(ctx.callbackQuery.message.chat.id);

                    if (result) {
                        if (isExists && chat.enabled) {
                            const disableBot = await setIsBotActive(ctx.callbackQuery.message.chat.id, false);

                            if (disableBot) {
                                await ctx.editMessageReplyMarkup({
                                    inline_keyboard: getSwitcherKeyboard(false)
                                })

                                await ctx.answerCbQuery("✅ Теперь бот не будет отвечать в чате!")
                            } else {
                                await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
                            }
                        } else if (isExists && !chat.enabled) {
                            await ctx.editMessageReplyMarkup({
                                inline_keyboard: getSwitcherKeyboard(false)
                            })

                            await ctx.answerCbQuery("Бот итак отключен в чате 😅")
                        } else {
                            const init = await initChat(ctx.callbackQuery.message.chat.id, false, ctx)

                            if (init) await ctx.answerCbQuery("Бот итак отключен в чате 😅")
                            else await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
                        }
                    } else {
                        await ctx.answerCbQuery("❌ Команда доступна только для администраторов")
                    }
                } catch (error) {
                	console.log(error);
                }
            }).catch(async (error) => {
                console.log(error);
                await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
            })
        }
    } catch (error) {
        console.log(error);
    }
}

export async function enableBotHandler (ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.from.id, ctx).then(async (result) => {
                const [isExists, chat] = await isChatExists(ctx.callbackQuery.message.chat.id);
                
                if (result) {
                    if (isExists && !chat.enabled) {
                        const enableBot = await setIsBotActive(ctx.callbackQuery.message.chat.id, true);

                        if (enableBot) {
                            await ctx.editMessageReplyMarkup({
                                inline_keyboard: getSwitcherKeyboard(true)
                            })

                            await ctx.answerCbQuery("✅ Теперь бот будет отвечать в чате!")
                        } else {
                            await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
                        }
                    } else if (isExists && chat.enabled) {
                        await ctx.answerCbQuery("Бот уже включен в чате 😅")
                    } else {
                        const init = await initChat(ctx.callbackQuery.message.chat.id, true, ctx)

                        if (init) {
                            await ctx.editMessageReplyMarkup({
                                inline_keyboard: getSwitcherKeyboard(true)
                            })

                            await ctx.answerCbQuery("✅ Теперь бот будет отвечать в чате!")
                        }
                        else await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
                    }                    
                } else {
                    await ctx.answerCbQuery("❌ Команда доступна только для администраторов")
                }
            }).catch(async (error) => {
                console.log(error);
                await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
            })
        }
    } catch (error) {
        console.log(error);
    }
}