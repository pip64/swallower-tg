import Markov from "./markov.mjs";
import Gestonify from "./geston.mjs";

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

            const textForChain = foundLines.join("\n");
            console.log(textForChain)

            const chain = new Markov(textForChain);

            const x = chain.generate(symbols)
            console.log(x)

            return x || this.lines.choice();
        } catch (error) {
            console.error(error.stack);
            return "Сложно...";
        }
    }
}