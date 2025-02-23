function getRandomInt (min, max) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}


export default class Markov {
	constructor(input = []) {
		this.chain = [];
		if (typeof input === 'object') {
			input.forEach(item => this.add(item));
		} else {
			this.add(input);
		}
	}

	add(input) {
		if (typeof input === 'string') {
			const tokens = input.split(/[\s]/);
			if (tokens.length == 1) {
				for (let i = 0; i < tokens.length; i++) {
					this.buildChain(tokens[i].toLowerCase(), tokens[i].toLowerCase());
				}
			} else {
				for (let i = 0; i < tokens.length - 1; i++) {
					this.buildChain(tokens[i].toLowerCase(), tokens[i + 1].toLowerCase());
				}
			}
		} else if (typeof input === 'object') {
			input.forEach(token => this.add(token));
		}
	}

	buildChain(currentToken, nextToken) {

		let found = false;
		for (let i = 0; i < this.chain.length; i++) {
			const currentRow = this.chain[i];
			const currentKey = currentRow.key;

			if (currentKey === currentToken) {

				found = true;
				let increased = false;

				for (let n = 0; n < currentRow.values.length; n++) {
					if (currentRow.values[n].next === nextToken) {
						currentRow.values[n].count++;
						currentRow.total++;
						increased = true;
						break;
					}
				}


				if (!increased) {
					this.chain[i].values.push({
						next: nextToken,
						count: 1
					});

					this.chain[i].total++;

				}
			}
		}
		
		if (!found && nextToken !== '') {
			this.chain.push({
				key: currentToken,
				values: [{
					next: nextToken,
					count: 1
				}],
				total: 1
			});
		}
	}

	generate(textLength = 70) {
		const random = Math.floor(Math.random() * this.chain.length);
		try {
			let result = this.chain[random].key;
			let nextState = this.addWord(random);
			let length = getRandomInt(1, textLength)

			if (result == nextState) return result;
			if (result.length < length) result += ' ' + nextState;
	
			while (result.length < length) {
				nextState = this.addWord(this.chain.map(word => word.key).indexOf(nextState));
				if (nextState === -1) break;
	
				result += ' ' + nextState;
			}
	
			return result;
		} catch (err) {console.log(err)}


	}
	addWord(rowIndex) {
		const currentRow = this.chain[rowIndex];

		if (currentRow === undefined) return -1;

		const totalChoices = currentRow.total;
		const random = Math.floor(Math.random() * totalChoices);

		let selection = 0;
		let i = 0;
        
		while (selection < random) {
			selection += currentRow.values[i].count;

			if (selection > random) break;

			i += 1;
		}

		return currentRow.values[i].next;
	}
}