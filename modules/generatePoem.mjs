import Markov from "./markov.mjs";
import fs from 'fs';

export default function generatePoem() {
    let poem = "";
    let rhyme = "";

    const text = fs.readFileSync('./database/direct_messages.txt', 'utf-8');

    const chain = new Markov(text)

    function getLastTwoLetters(word) {
        const match = word.match(/[а-яА-ЯёЁ]{2}$/);
        return match ? match[0] : '';
    }

    while (poem.trim().split("\n").length < 8) {
        const line = chain.generate(20);
        const splitted_line = line.trim().split(" ");
        const last2letters = getLastTwoLetters(splitted_line[splitted_line.length - 1]);
        if (splitted_line.length < 2) continue
        if (poem.split("\n").length === 1) {
            if (last2letters.length === 2) rhyme = last2letters
            else continue
        } else {
            if (last2letters === rhyme) {}
            else continue
        }
        poem += line + "\n";
    }

    return poem
}