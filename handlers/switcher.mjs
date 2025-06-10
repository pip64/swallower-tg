import isAdmin from "../modules/isAdmin.mjs";
import initChat from "../modules/chats/initChat.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import setIsBotActive from "../modules/chats/enable.mjs";
import getSwitcherKeyboard from "../modules/inline/switcher.mjs";

export async function disableBotHandler (ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            await ctx.answerCbQuery().catch(() => {});
            
            const isAdminResult = await isAdmin(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.from.id, ctx);
            const [isExists, chat] = await isChatExists(ctx.callbackQuery.message.chat.id);

            if (isAdminResult) {
                if (isExists && chat.enabled) {
                    const disableBot = await setIsBotActive(ctx.callbackQuery.message.chat.id, false);

                    if (disableBot) {
                        await ctx.editMessageReplyMarkup({
                            inline_keyboard: getSwitcherKeyboard(false)
                        }).catch(() => {});
                    }
                } else if (isExists && !chat.enabled) {
                    await ctx.editMessageReplyMarkup({
                        inline_keyboard: getSwitcherKeyboard(false)
                    }).catch(() => {});
                } else {
                    await initChat(ctx.callbackQuery.message.chat.id, false, ctx);
                }
            }
        }
    } catch (error) {
        console.log('Error in disableBotHandler:', error);
    }
}

export async function enableBotHandler (ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            // Сразу отвечаем на callback query, чтобы избежать таймаута
            await ctx.answerCbQuery().catch(() => {});
            
            const isAdminResult = await isAdmin(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.from.id, ctx);
            const [isExists, chat] = await isChatExists(ctx.callbackQuery.message.chat.id);
            
            if (isAdminResult) {
                if (isExists && !chat.enabled) {
                    const enableBot = await setIsBotActive(ctx.callbackQuery.message.chat.id, true);

                    if (enableBot) {
                        await ctx.editMessageReplyMarkup({
                            inline_keyboard: getSwitcherKeyboard(true)
                        }).catch(() => {});
                    }
                } else if (!isExists) {
                    const init = await initChat(ctx.callbackQuery.message.chat.id, true, ctx);
                    if (init) {
                        await ctx.editMessageReplyMarkup({
                            inline_keyboard: getSwitcherKeyboard(true)
                        }).catch(() => {});
                    }
                }
            }
        }
    } catch (error) {
        console.log('Error in enableBotHandler:', error);
    }
}