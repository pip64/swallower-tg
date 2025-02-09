import setBotMode from "../modules/chats/mode.mjs";
import isAdmin from "../modules/isAdmin.mjs";
import { modes } from "../constants/modes.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import getModeKeyboard from "../modules/inline/mode_keyboard.mjs";

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

export default async function Mode (ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then(async (result) => {
            	try {
                    if (result) {
                        const [isExists, chat] = await isChatExists(ctx.message.chat.id);

                        ctx.replyWithMarkdown(`Заглыт будет менять свои сообщения под режимы.\n\nПример: \`${await modes[Object.keys(modes).choice()](phrases.choice())}\`\n\nВыберите режим:`, {
                                reply_markup: {
                                    inline_keyboard: getModeKeyboard(chat.mode)
                                }
                            });                    
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