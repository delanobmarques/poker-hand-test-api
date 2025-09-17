
const express = require('express');
const app = express();
const port = 3000;

const generateHand = (type) => {
    const hands = {
        royalflush: require('./hands').generate_royal_flush,
        straightflush: require('./hands').generate_straight_flush,
        fourofakind: require('./hands').generate_four_of_a_kind,
        fullhouse: require('./hands').generate_full_house,
        flush: require('./hands').generate_flush,
        straight: require('./hands').generate_straight,
        threeofakind: require('./hands').generate_three_of_a_kind,
        twopair: require('./hands').generate_two_pair,
        onepair: require('./hands').generate_one_pair,
        highcard: require('./hands').generate_high_card,
        random: require('./hands').generate_random
    };
    return hands[type] ? hands[type]() : null;
};

app.get('/pokerhandtest/:hand', (req, res) => {
    const hand = req.params.hand.toLowerCase();
    const cards = generateHand(hand);
    if (cards) {
        res.json({ success: true, deck_id: 'testdeck', cards: cards, remaining: 47 });
    } else {
        res.status(404).json({ success: false, error: 'Hand not found' });
    }
});

app.listen(port, () => {
    console.log(`Poker Hand Test API listening at http://localhost:${port}`);
});
