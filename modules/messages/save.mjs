import * as fs from 'node:fs/promises';
import { constants } from 'node:fs/promises';
import clearOldMessages from './clearOld.mjs';

export default async function saveMessage(text, channel_id, type, messages_type) {
    try {
        const file_name = messages_type === "direct" ? "./database/direct_messages.txt" : `./database/${type}/${channel_id}.txt`;

        if (await fs.access(file_name, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)) {
            const channelDatabase = await fs.readFile(
                file_name, { encoding: "utf-8" });

            if (channelDatabase.split("\n").length >= Number(process.env.messages_limit) && messages_type !== "direct") {
                if (await clearOldMessages(channel_id, type, channelDatabase.split("\n").length - Number(process.env.messages_limit))) {
                    const channelDatabaseWrite = await fs.appendFile(file_name, `\n${text}`)
                        .then(() => true)
                        .catch((error) => {
                            console.log(error);
                            return false;
                        });

                    return channelDatabaseWrite;
                }

            } else {
                const channelDatabaseWrite = await fs.appendFile(file_name, `\n${text}`)
                    .then(() => true)
                    .catch((error) => {
                        console.log(error);
                        return false;
                    });

                return channelDatabaseWrite;
            }
        } else {
            return await fs.open(messages_type === "direct" ? "./database/direct_messages.txt" : `./database/${type}/${channel_id}.txt`, 'w').then(async () => await saveMessage(text, channel_id, type, messages_type)).catch();
        }
    } catch (error) {
        console.log(error)
        return false;
    }
}