import Markov from "./markov.mjs";
import fs from 'fs';

export default function generateStory(file) {
    const text = fs.readFileSync(file, 'utf-8');
    const chain = new Markov(text);
    
    const story = [...Array(10)].map((_, index) => {
        let sentence = "";
        while (sentence.split(" ").length < 3 || sentence.split(" ").length > 10) {
            sentence = chain.generate(Math.floor(Math.random() * 10) + 100);
        }
        return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    });

    return [story.join(". ") + ".", story[Math.floor(Math.random() * story.length)]];
}