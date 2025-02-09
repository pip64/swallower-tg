import * as fs from 'node:fs/promises';
import { constants } from 'node:fs/promises';

export default async function clearOldMessages(channel_id, type, count) {
    try {
        if (await fs.access(`./database/${type}/${channel_id}.txt`, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)) {
            const chatMessages = await fs.readFile(
                `./database/${type}/${channel_id}.txt`, { encoding: "utf-8" });

            const messagesList = chatMessages.split("\n");
            for (const i of [...Array(count).keys()]) {
                messagesList.shift()
            }
            const newDb = messagesList.join('\n')

            const rewrite = await fs.writeFile(`./database/${type}/${channel_id}.txt`, newDb, {encoding:'utf8',flag:'w'}).then(() => true).catch(() => false)
            
            if (rewrite) {
                return true
            }
        }
    } catch (error) {
        console.log(error);
    }
}