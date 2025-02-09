export default function weightedRandom(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    const randomNumber = Math.random() * totalWeight;

    let weightSum = 0;
    for (let i = 0; i < items.length; i++) {
        weightSum += weights[i];
        if (randomNumber < weightSum) {
            return items[i];
        }
    }
}