import isAdmin from "../modules/isAdmin.mjs";
import initChat from "../modules/chats/initChat.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import * as fs from 'node:fs/promises';
import { constants } from 'node:fs/promises';

export async function clearMessagesHandler(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.from.id, ctx).then(async (result) => {
            	try {
                    const [isExists, chat] = await isChatExists(ctx.callbackQuery.message.chat.id);

                    if (result) {
                        if (isExists) {
                            if (await fs.access(`./database/messages/${ctx.callbackQuery.message.chat.id}.txt`, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)) {
                                const deleteMessages = await fs.unlink(`./database/messages/${ctx.callbackQuery.message.chat.id}.txt`).then(() => true).catch(() => false)

                                if (deleteMessages) {
                                    await ctx.editMessageText("🗑 БД сообщений очищена!")
                                } else {
                                    await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
                                }
                            } else await ctx.answerCbQuery("БД сообщений не найдена 😅")
                        } else {
                            const init = await initChat(ctx.callbackQuery.message.chat.id, true, ctx)

                            if (init) await ctx.answerCbQuery("БД чата не найдена 😅")
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

export async function clearStickersHandler(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.from.id, ctx).then(async (result) => {
            	try {
                    const [isExists, chat] = await isChatExists(ctx.callbackQuery.message.chat.id);

                    if (result) {
                        if (isExists) {
                            if (await fs.access(`./database/stickers/${ctx.callbackQuery.message.chat.id}.txt`, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)) {
                                const deleteStickers = await fs.unlink(`./database/stickers/${ctx.callbackQuery.message.chat.id}.txt`).then(() => true).catch(() => false)

                                if (deleteStickers) {
                                    await ctx.editMessageText("🗑 БД стикеров очищена!")
                                } else {
                                    await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
                                }
                            } else await ctx.answerCbQuery("БД стикеров не найдена 😅")
                        } else {
                            const init = await initChat(ctx.callbackQuery.message.chat.id, true, ctx)

                            if (init) await ctx.answerCbQuery("БД чата не найдена 😅")
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

export async function clearAllHandler(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.from.id, ctx).then(async (result) => {
            	try {
                    const [isExists, chat] = await isChatExists(ctx.callbackQuery.message.chat.id);

                    if (result) {
                        if (isExists) {
                            if (await fs.access(`./database/messages/${ctx.callbackQuery.message.chat.id}.txt`, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)
                                || await fs.access(`./database/stickers/${ctx.callbackQuery.message.chat.id}.txt`, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)) {
                                const [deleteMessages, deleteStickers] = [
                                    await fs.unlink(`./database/messages/${ctx.callbackQuery.message.chat.id}.txt`).then(() => true).catch(() => false),
                                    await fs.unlink(`./database/stickers/${ctx.callbackQuery.message.chat.id}.txt`).then(() => true).catch(() => false)
                                ]

                                if (deleteMessages || deleteStickers) {
                                    await ctx.editMessageText("🗑 БД чата очищена!")
                                } else {
                                    await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
                                }
                            } else await await ctx.answerCbQuery("БД чата не найдена 😅")
                        } else {
                            const init = await initChat(ctx.callbackQuery.message.chat.id, true, ctx)

                            if (init) await ctx.answerCbQuery("БД чата не найдена 😅")
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