// алгоритм zaglyt 2 by pip
// использует цепь маркова(markovchain) + гестонифай

import Gestonify from "./geston.mjs";
import MarkovChain from 'markovchain';
import getRandomInt from "./random.mjs";

const random = max => Math.floor(Math.random() * max);

Array.prototype.choice = function () {
    return this[random(this.length)];
};

export default class z2bp {
    constructor(corpus) {
        this.corpus = corpus;
        this.lines = corpus.split("\n");
        this.geston = new Gestonify(corpus, null, false, true);
    }

    generate(prompt = "", symbols = 30) {
        try {
            this.geston.read();
            this.geston.read_input(prompt);

            const foundLines = this.geston.find_lines(5) || [];
            const resultLines = this._collectRelevantLines(foundLines, prompt);

            const textForChain = resultLines.length > 0
                ? Array.from(new Set(resultLines)).join("\n")
                : this.corpus;
        
            const chain = new MarkovChain(textForChain);
            const main_word = textForChain.split("\n").map(line => line.split(" ")).flat().choice()

            return chain.start(main_word).end(getRandomInt(6)+1).process() || this.lines.choice();
        } catch (error) {
            console.error(error.stack);
            return "Что-то пошло не так, попробуй ещё раз.";
        }
    }

    _collectRelevantLines(foundLines, prompt) {
        const result = [prompt, ...foundLines];

        foundLines.forEach(foundLine => {
            this.lines.forEach((line, index) => {
                if (line.includes(foundLine)) {
                    result.push(line);
                    if (this.lines[index + 1]) {
                        result.push(this.lines[index + 1]);
                    }
                }
            });
        });

        return result;
    }
}