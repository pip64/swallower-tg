import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import fs from 'fs';
import path from 'path';

import startCommand from "./commands/start.mjs";
import on_message from "./commands/on_message.mjs";
import on_sticker from "./commands/on_sticker.mjs";
import clear from "./commands/clear.mjs";
import mailToAll from "./commands/admin/mail_to_all.mjs";
import Mode from "./commands/mode.mjs";
import selectModeHandler from "./handlers/select_mode.mjs";
import { clearAllHandler, clearMessagesHandler, clearStickersHandler } from "./handlers/clear.mjs";
import { enableBotHandler, disableBotHandler } from "./handlers/switcher.mjs";
import switcher from "./commands/switcher.mjs";
import informationChat from "./commands/info.mjs";

const bot = new Telegraf(process.env.token);

const wrapHandlerWithTimeout = (handler, timeout = 10000) => {
    return async (ctx, next) => {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("TimeoutError: Promise timed out")), timeout);
        });

        try {
            await Promise.race([handler(ctx, next), timeoutPromise]);
        } catch (error) {
            console.error(`Ошибка в обработчике: ${error.message}`);
            logErrorToFile(error);
            if (ctx.reply) {
                try { await ctx.reply("Произошла ошибка. Пожалуйста, повторите позже."); } catch { }
            }
        }
    };
};

const logErrorToFile = (error) => {
    const errorFilePath = path.resolve('errors.txt');
    const date = new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const logMessage = `${date}\n${error.stack || error}\n\n`;
    fs.appendFileSync(errorFilePath, logMessage, { encoding: 'utf8' });
};

bot.start(wrapHandlerWithTimeout(startCommand));
bot.command("enable", wrapHandlerWithTimeout(switcher));
bot.command("disable", wrapHandlerWithTimeout(switcher));
bot.command("clear", wrapHandlerWithTimeout(clear));
bot.command("mail", wrapHandlerWithTimeout(mailToAll));
bot.command("mode", wrapHandlerWithTimeout(Mode));
bot.command("switcher", wrapHandlerWithTimeout(switcher));
bot.command("information", wrapHandlerWithTimeout(informationChat));

bot.action("bot_enable", wrapHandlerWithTimeout(enableBotHandler));
bot.action("bot_disable", wrapHandlerWithTimeout(disableBotHandler));
bot.action("clear_messages", wrapHandlerWithTimeout(clearMessagesHandler));
bot.action("clear_stickers", wrapHandlerWithTimeout(clearStickersHandler));
bot.action("clear_all", wrapHandlerWithTimeout(clearAllHandler));

bot.on('callback_query', wrapHandlerWithTimeout(selectModeHandler));
bot.on(message('text'), wrapHandlerWithTimeout(on_message));
bot.on(message('sticker'), wrapHandlerWithTimeout(on_sticker));

bot.launch({ dropPendingUpdates: true }, () => console.log(process.env.bot_name, 'успешно запущен!'))
    .catch((err) => console.error('Ошибка при запуске бота:', err));