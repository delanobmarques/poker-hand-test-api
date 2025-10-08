
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

const suits = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"];
const valueCodes = {
  "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "0",
  "JACK": "J", "QUEEN": "Q", "KING": "K", "ACE": "A"
};

function createCard(value, suit) {
  const code = valueCodes[value] + suit[0];
  return {
    code: code,
    image: `https://deckofcardsapi.com/static/img/${code}.png`,
    images: {
      svg: `https://deckofcardsapi.com/static/img/${code}.svg`,
      png: `https://deckofcardsapi.com/static/img/${code}.png`
    },
    value: value,
    suit: suit
  };
}

function generateHand(type) {
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getSample = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

  switch(type) {
    case 'royalflush': {
      const suit = getRandom(suits);
      return ["10", "JACK", "QUEEN", "KING", "ACE"].map(v => createCard(v, suit));
    }
    case 'straightflush': {
      const suit = getRandom(suits);
      // Define all possible straights including Ace-low (A-2-3-4-5)
      const straights = [];
      
      // Regular straights (2-3-4-5-6 through 10-J-Q-K-A)
      for (let i = 0; i <= values.length - 5; i++) {
        straights.push(values.slice(i, i + 5));
      }
      
      // Add Ace-low straight (A-2-3-4-5)
      straights.push(["ACE", "2", "3", "4", "5"]);
      
      const selectedStraight = getRandom(straights);
      console.log('STRAIGHTFLUSH DEBUG - selected straight:', selectedStraight, 'suit:', suit);
      return selectedStraight.map(v => createCard(v, suit));
    }
    case 'fourofakind': {
      const value = getRandom(values);
      const fourSuits = getSample(suits, 4);
      const kickerValue = getRandom(values.filter(v => v !== value));
      const kickerSuit = getRandom(suits);
      const allCards = fourSuits.map(s => createCard(value, s)).concat(createCard(kickerValue, kickerSuit));
      // Shuffle the cards so they're not sorted
      return allCards.sort(() => 0.5 - Math.random());
    }
    case 'fullhouse': {
      const tripleValue = getRandom(values);
      const pairValue = getRandom(values.filter(v => v !== tripleValue));
      const tripleSuits = getSample(suits, 3);
      const pairSuits = getSample(suits, 2);
      const allCards = tripleSuits.map(s => createCard(tripleValue, s)).concat(pairSuits.map(s => createCard(pairValue, s)));
      // Shuffle the cards so they're not sorted
      return allCards.sort(() => 0.5 - Math.random());
    }
    case 'flush': {
      const suit = getRandom(suits);
      const cards = getSample(values, 5);
      return cards.map(v => createCard(v, suit));
    }
    case 'straight': {
      // Define all possible straights including Ace-low (A-2-3-4-5)
      const straights = [];
      
      // Regular straights (2-3-4-5-6 through 10-J-Q-K-A)
      for (let i = 0; i <= values.length - 5; i++) {
        straights.push(values.slice(i, i + 5));
      }
      
      // Add Ace-low straight (A-2-3-4-5)
      straights.push(["ACE", "2", "3", "4", "5"]);
      
      const selectedStraight = getRandom(straights);
      console.log('STRAIGHT DEBUG - selected straight:', selectedStraight);
      return selectedStraight.map(v => createCard(v, getRandom(suits)));
    }
    case 'threeofakind': {
      const value = getRandom(values);
      const suits3 = getSample(suits, 3);
      const kickers = getSample(values.filter(v => v !== value), 2);
      const allCards = suits3.map(s => createCard(value, s)).concat(kickers.map(v => createCard(v, getRandom(suits))));
      // Shuffle the cards so they're not sorted
      return allCards.sort(() => 0.5 - Math.random());
    }
    case 'twopair': {
      const pairValues = getSample(values, 2);
      const cards = [];
      pairValues.forEach(v => {
        const suits2 = getSample(suits, 2);
        cards.push(...suits2.map(s => createCard(v, s)));
      });
      const kickerValue = getRandom(values.filter(v => !pairValues.includes(v)));
      const allCards = cards.concat(createCard(kickerValue, getRandom(suits)));
      // Shuffle the cards so they're not sorted
      return allCards.sort(() => 0.5 - Math.random());
    }
    case 'onepair': {
      const value = getRandom(values);
      const suits2 = getSample(suits, 2);
      const kickers = getSample(values.filter(v => v !== value), 3);
      const allCards = suits2.map(s => createCard(value, s)).concat(kickers.map(v => createCard(v, getRandom(suits))));
      // Shuffle the cards so they're not sorted
      return allCards.sort(() => 0.5 - Math.random());
    }
    case 'highcard': {
      const cards = getSample(values, 5);
      return cards.map(v => createCard(v, getRandom(suits)));
    }
    case 'random': {
      return Array.from({length: 5}, () => createCard(getRandom(values), getRandom(suits)));
    }
    default: return null;
  }
}

app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to the Poker Hand Test API",
    description: "Generate poker hands for testing purposes",
    endpoint: "/pokerhandtest/{handtype}",
    available_hands: [
      "royalflush", "straightflush", "fourofakind", "fullhouse", 
      "flush", "straight", "threeofakind", "twopair", "onepair", 
      "highcard", "random"
    ]
  });
});

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
