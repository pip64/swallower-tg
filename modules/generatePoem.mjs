import Markov from "./markov.mjs";
import fs from 'fs';

function mostFrequentWord(text) {
    const words = text.toLowerCase().match(/\p{L}+/gu);
    if (!words) return null;

    const frequency = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(frequency).reduce((max, entry) =>
        entry[1] > max[1] ? entry : max
    )[0];
}

export default function generatePoem(file) {
    let poem = "";
    let rhyme = "";

    const text = fs.readFileSync(file, 'utf-8');

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

    return [poem || "Я стих сочинить не смог\nУж сложно мне, поверь.", mostFrequentWord(poem) || "Не смог..."];
}