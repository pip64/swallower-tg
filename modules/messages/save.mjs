import * as fs from 'node:fs/promises';
import { constants } from 'node:fs/promises';
import clearOldMessages from './clearOld.mjs';

export default async function saveMessage(text, channel_id, type) {
    try {
        if (await fs.access(`./database/${type}/${channel_id}.txt`, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)) {
            const channelDatabase = await fs.readFile(
                `./database/${type}/${channel_id}.txt`, { encoding: "utf-8" });

            if (channelDatabase.split("\n").length >= 5000) {
                if (await clearOldMessages(channel_id, type, channelDatabase.split("\n").length - 5000)) {
                    const channelDatabaseWrite = await fs.appendFile(`./database/${type}/${channel_id}.txt`, `\n${text}`)
                        .then(() => true)
                        .catch((error) => {
                            console.log(error);
                            return false;
                        });

                    return channelDatabaseWrite;
                }

            } else {
                const channelDatabaseWrite = await fs.appendFile(`./database/${type}/${channel_id}.txt`, `\n${text}`)
                    .then(() => true)
                    .catch((error) => {
                        console.log(error);
                        return false;
                    });

                return channelDatabaseWrite;
            }
        } else {
            return await fs.open(`./database/${type}/${channel_id}.txt`, 'w').then(async () => await saveMessage(text, channel_id, type)).catch();
        }
    } catch (error) {
        console.log(error)
        return false;
    }
}