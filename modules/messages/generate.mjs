import * as fs from 'node:fs/promises';
import { constants } from 'node:fs/promises';
import { modes } from '../../constants/modes.mjs';
import z2bp from "../z2bp.mjs";
import getMode from '../modes/getMode.mjs';

const random = max => Math.floor(Math.random() * (max - 0) + 0)

String.prototype.insertRandomWords = function(massive) {
    let splitted = this.split(" ");
    const count = Math.ceil(splitted.length / 3);

    const indexesToInsert = Array.from({length: count > 0 ? count : 1}).map(() => random(0, splitted.length));

    indexesToInsert.map(value => splitted = splitted.insert(massive.choice(), value));

    return splitted.join(" ");
};

export default async function generateMarkov(input = "", channel_id, symbols_count, mode = "default", type) {
    try {
        const file_name = type === "direct" ? "./database/direct_messages.txt" : `./database/messages/${channel_id}.txt`;
        if (await fs.access(file_name, constants.R_OK | constants.W_OK).then(() => true).catch(() => false)) {
            const chatMessages = await fs.readFile(
                file_name, { encoding: "utf-8" });

            const zaglyt2 = new z2bp(chatMessages);
            const sentence = zaglyt2.generate(input, symbols_count);
            
            const modeFunction = modes[mode];
            const otherMode = modeFunction ? null : await getMode(Number(mode));
            const otherModeFunction = (text) => text.insertRandomWords(otherMode?.words);
            
            return (otherMode ? await otherModeFunction(sentence) : await modes[mode](sentence)) || sentence;
        }
    } catch (error) {
        console.log(error);
    }
}