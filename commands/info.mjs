import isAdmin from "../modules/isAdmin.mjs";
import isChatExists from "../modules/chats/isChatExists.mjs";
import * as fs from 'node:fs/promises';
import { constants } from 'node:fs/promises';
import { modeFormats } from "../constants/modes.mjs";

export default async function informationChat(ctx) {
    try {
        if (['group', 'supergroup'].includes(ctx.chat.type)) {
            const [isExists, chat] = await isChatExists(ctx.message.chat.id);

            if (isExists) {
                const dbChatMessagesExists = await fs.access(`./database/messages/${ctx.message.chat.id}.txt`, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)
                const channelDatabase = dbChatMessagesExists ? await fs.readFile(
                    `./database/messages/${ctx.message.chat.id}.txt`, { encoding: "utf-8" }) : "";

                await ctx.reply(`Я: ${chat.enabled ? "включен" : "отключен"}\nЯ помню: ${channelDatabase.split("\n").length} сообщений\nРежим: ${modeFormats[chat.mode]}`);
            } else {
                await ctx.reply(`Я: выключен\nЯ помню: 0 сообщений\nРежим: Обычный`)
            }
        }
    } catch (error) {
        console.log(error);
    }
}