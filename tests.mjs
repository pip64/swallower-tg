import MarkovChain from 'markovchain';

const dataset = `заглыт
как дела?
а никак
никак, говорю же
нет, молчишь`

const corpus = dataset.split("\n").map(line => line.split(" "))

const chain = new MarkovChain(dataset);

console.log(chain.start('а').end(5).process())