// в данном файле представлен самый главный алгоритм заглыта
// сразу скажу - половина написана мною, половина - нейросетью
// почему нейросетью? ну, по приколу! круто ж
// функции, написанные нейросетью: _computeIdf, _tf, _tfidf, _cosineSimilarity

export default class Gestonify {
    constructor (corpus, limit = 4000, isRandom = false, isPunctuation = true) {
        this.corpus = corpus;
        this.limit = limit;
        this.isRandom = isRandom;
        this.isPunctuation = isPunctuation;
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        const longerLength = longer.length;
        
        if (longerLength === 0) {
            return 100;
        }
    
        const similarity = (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength) * 100;
        return similarity.toFixed(2);
    }
    
    editDistance(str1, str2) {
        str1 = str1.toLowerCase();
        str2 = str2.toLowerCase();
    
        const costs = new Array();
        for (let i = 0; i <= str1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= str2.length; j++) {
                if (i === 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (str1.charAt(i - 1) !== str2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[str2.length] = lastValue;
        }
        return costs[str2.length];
    }

    read () {
        const corpus = this.isPunctuation ? this.corpus : this.corpus?.replace(/[^\w\s]|_/g, "");
        this.lines = corpus?.split("\n");
    }

    read_input (input) {
        this.input = input;
        const line = this.limit ? input?.slice(0, this.limit) : input;
        this.input_words = line?.split(" ");
    }

    find_lines (count = 5) {
        let finded_lines = [];

        this.input_words?.map(word => {
            finded_lines = [...finded_lines, ...this.lines?.filter(line => line.includes(word))];
        })
        const similaries = Array.from(new Set(finded_lines)).map(line => [line, parseInt(this.calculateSimilarity(this.input, line))]);
        similaries.sort((a, b) => b[1] - a[1]);

        return similaries.slice(0, count).map(value => value[0]);
    }

    random_choice(list) {
        const random_integer = Math.floor(Math.random() * list?.length);

        return list[random_integer];
    }

    generate (input) {
        this.read();
        this.read_input(input);

        if (this.input_words?.length > 0) {
            const lines = this.find_lines();

            if (lines?.length > 1) {
                return this.random_choice(lines);
            } else {
                if (lines[0]) return lines[0];
                return this.random_choice(this.lines);
            };
        } else {
            if (this.isRandom) {
                return this.random_choice(this.lines);
            }
            return null;
        }
    }
}