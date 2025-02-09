// в данном файле представлен самый главный алгоритм заглыта
// сразу скажу - половина написана мною, половина - нейросетью
// почему нейросетью? ну, по приколу! круто ж
// функции, написанные нейросетью: _computeIdf, _tf, _tfidf, _cosineSimilarity

export default class Gestonify {
    constructor(corpus, limit = 4000, isRandom = false, isPunctuation = true) {
        this.corpus = corpus;
        this.limit = limit;
        this.isRandom = isRandom;
        this.isPunctuation = isPunctuation;
    }

    read() {
        const corpus = this.isPunctuation
            ? this.corpus
            : this.corpus.replace(/[^\w\s]|_/g, "");
        this.lines = corpus.split("\n");
        this._computeIdf();
    }

    _computeIdf() {
        const totalDocs = this.lines.length;
        const df = {};
        this.lines.forEach(line => {
            const tokens = new Set(
                line
                    .split(/\W+/)
                    .filter(token => token.length > 0)
                    .map(token => token.toLowerCase())
            );
            tokens.forEach(token => {
                df[token] = (df[token] || 0) + 1;
            });
        });
        this.idf = {};
        for (const token in df) {
            this.idf[token] = Math.log(totalDocs / (df[token] || 1));
        }
    }

    _tf(text) {
        const tokens = text
            .split(/\W+/)
            .filter(token => token.length > 0)
            .map(token => token.toLowerCase());
        const tf = {};
        tokens.forEach(token => {
            tf[token] = (tf[token] || 0) + 1;
        });
        const len = tokens.length;
        for (const token in tf) {
            tf[token] = tf[token] / len;
        }
        return tf;
    }

    _tfidf(tf) {
        const tfidf = {};
        for (const token in tf) {
            tfidf[token] = tf[token] * (this.idf[token] || 0);
        }
        return tfidf;
    }

    _cosineSimilarity(vecA, vecB) {
        let dot = 0;

        let magA = 0;
        let magB = 0;
        const tokens = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
        tokens.forEach(token => {
            const a = vecA[token] || 0;
            const b = vecB[token] || 0;
            dot += a * b;
            magA += a * a;
            magB += b * b;
        });
        if (magA === 0 || magB === 0) return 0;
        return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    read_input(input) {
        this.input = input;
        const line = this.limit ? input.slice(0, this.limit) : input;
        this.input_words = line.split(" ");
        const tf = this._tf(line);
        this.inputTfidf = this._tfidf(tf);
    }

    find_lines(count = 5) {
        let finded_lines = [];
        this.input_words.forEach(word => {
            finded_lines = [
                ...finded_lines,
                ...this.lines.filter(line =>
                    line.toLowerCase().includes(word.toLowerCase())
                )
            ];
        });
        
        finded_lines = Array.from(new Set(finded_lines));
        const similarities = finded_lines.map(line => {
            const tfidf = this._tfidf(this._tf(line));
            const sim = this._cosineSimilarity(this.inputTfidf, tfidf);
            return [line, sim];
        });
        similarities.sort((a, b) => b[1] - a[1]);
        return similarities.slice(0, count).map(pair => pair[0]);
    }

    random_choice(list) {
        const random_integer = Math.floor(Math.random() * list.length);
        return list[random_integer];
    }

    generate(input) {
        this.read();
        this.read_input(input);

        if (this.input_words.length > 0) {
            const lines = this.find_lines();
            if (lines.length > 1) {
                return this.random_choice(lines);
            } else {
                if (lines[0]) return lines[0];
                return this.random_choice(this.lines);
            }
        } else {
            if (this.isRandom) {
                return this.random_choice(this.lines);
            }
            return null;
        }
    }
}