import isAdmin from "../modules/isAdmin.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import * as fs from 'node:fs/promises';
import { constants } from 'node:fs/promises';

export default async function informationChat(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            const adminCheck = await isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx);
            
            if (!adminCheck) {
                await ctx.reply('❌ Команда доступна только для администраторов');
                return;
            }

            const [isExists, chat] = await isChatExists(ctx.message.chat.id);

            if (isExists) {
                const dbChatMessagesExists = await fs.access(`./database/messages/${ctx.message.chat.id}.txt`, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)
                
                if (dbChatMessagesExists) {
                    await ctx.reply('Отправляю файл с сообщениями чата...');
                    await ctx.replyWithDocument({
                        source: `./database/messages/${ctx.message.chat.id}.txt`,
                        filename: `chat_${ctx.message.chat.id}.txt`
                    }, {
                        caption: `📥 Файл с сообщениями чата ${ctx.chat.title || ctx.chat.id}`
                    });
                } else {
                    await ctx.reply(`Файл чата не найден.`);
                }
            } else {
                await ctx.reply(`Не удалось найти чат в базе данных.`)
            }
        }
    } catch (error) {
        console.log(error);
    }
}