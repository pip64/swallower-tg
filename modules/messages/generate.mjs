import * as fs from 'node:fs/promises';
import { constants } from 'node:fs/promises';
import { modes } from '../../constants/modes.mjs';
import z2bp from "../z2bp.mjs";

export default async function generateMarkov(input = "", channel_id, symbols_count, mode = "default", type) {
    try {
        const file_name = type === "direct" ? "./database/direct_messages.txt" : `./database/messages/${channel_id}.txt`;
        if (await fs.access(file_name, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)) {
            const chatMessages = await fs.readFile(
                file_name, { encoding: "utf-8" });

            const zaglyt2 = new z2bp(chatMessages);
            const sentence = zaglyt2.generate(input, symbols_count);

            return await modes[mode](sentence) || sentence;
        }
    } catch (error) {
        console.log(error);
    }
}