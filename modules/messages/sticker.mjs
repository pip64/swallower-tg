import * as fs from 'node:fs/promises';
import { constants } from 'node:fs/promises';
import getRandomInt from '../random.mjs';

export default async function stickerChoice(channel_id) {
    try {
        if (await fs.access(`./database/stickers/${channel_id}.txt`, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)) {
            const chatStickersFile = await fs.readFile(
                `./database/stickers/${channel_id}.txt`, { encoding: "utf-8" });
            
            const chatStickers = chatStickersFile
                .split("\n")
                .filter(element => element.length > 0)

            return chatStickers[getRandomInt(chatStickers.length)];
        }
    } catch (error) {
        console.log(error);
    }
}