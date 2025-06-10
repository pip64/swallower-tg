import { modes } from "../constants/modes.mjs";
import setBotMode from "../modules/chats/mode.mjs";
import isAdmin from "../modules/isAdmin.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import initChat from "../modules/chats/initChat.mjs";
import getModeKeyboard from "../modules/inline/mode_keyboard.mjs";
import { modeFormats } from "../constants/modes.mjs";

const random = max => Math.floor(Math.random() * (max - 0) + 0)

Array.prototype.choice = function () {
    return this[random(this.length)];
}

export default async function selectModeHandler(ctx) {
    try {
        const mode = ctx.callbackQuery.data;
        const chatId = ctx.callbackQuery.message.chat.id;
        const messageId = ctx.callbackQuery.message.id;
        const author = ctx.callbackQuery.from.id;

        await ctx.answerCbQuery().catch(() => {});

        isAdmin(chatId, author, ctx).then(async (result) => {
        	try {
                if (result) {
                    const [isExists, chat] = await isChatExists(chatId);

                    if (!isExists) {
                        await initChat(chatId, false, 'default', ctx);
                    }

                    if (Object.keys(modes).includes(mode)) {
                        if (await setBotMode(chatId, mode)) {
                            await ctx.editMessageReplyMarkup({
                                inline_keyboard: getModeKeyboard(mode)
                            })

                            await ctx.answerCbQuery(`✅ Режим изменён на ${modeFormats[mode]}`);
                        } else {
                            await ctx.answerCbQuery(`❌ Произошла ошибка при изменении режима`);
                        }
                    } else {
                        await ctx.answerCbQuery(`❌ Неизвестный режим`);
                    }
                } else {
                    await ctx.answerCbQuery("❌ Выбор режима доступен только для администраторов")
                }
			} catch (error) {
                	console.log(error);
            }
        }).catch(async (error) => {
            console.log(error);
            await ctx.answerCbQuery("Упс! Произошла ошибка 😅")
        })
    } catch (error) {
        console.log("Ошибка в обработчике callback_query:", error);
    }
}