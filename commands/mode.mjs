import setBotMode from "../modules/chats/mode.mjs";
import isAdmin from "../modules/isAdmin.mjs";
import { modes } from "../constants/modes.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import getModeKeyboard from "../modules/inline/mode_keyboard.mjs";
import getMode from "../modules/modes/getMode.mjs";
import database from "../database/index.mjs";

const random = max => Math.floor(Math.random() * (max - 0) + 0)

Array.prototype.choice = function () {
    return this[random(this.length)];
}

const phrases = [
    "привет бро, как дела?",
    "как же сегодня прекрасно на улице!",
    "трогать траву прекрасно",
    "я знаю твой айпи адрес",
    "стетхем здарова"
]

export default async function Mode(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then(async (result) => {
                try {
                    if (result) {
                        const [isExists, chat] = await isChatExists(ctx.message.chat.id);

                        const otherMode = ctx.message.text.split("/mode")[1].trim();

                        if (otherMode.length > 0) {
                            const mode = await getMode(Number(otherMode));

                            if (!mode) return await ctx.reply("❌ Такого режима не существует.");

                            const changeMode = await setBotMode(ctx.message.chat.id, otherMode);

                            if (!changeMode) return await ctx.reply("❌ Не удалось установить режим.")
                            
                            await ctx.reply(`✅ Установлен режим "${mode?.name}".\nВы всегда можете изменить режим обратно в /mode.`);
                        } else {
                            ctx.replyWithMarkdown(`Заглыт будет менять свои сообщения под режимы.\n\nПример: \`${await modes[Object.keys(modes).choice()](phrases.choice())}\`\n\nВыберите режим:`, {
                                reply_markup: {
                                    inline_keyboard: getModeKeyboard(chat.mode)
                                }
                            });
                        }
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