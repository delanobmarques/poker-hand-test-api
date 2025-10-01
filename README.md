# Poker Hand Test API

A simple Express.js API for generating poker hands for testing purposes. This API was built as a testing resource for the Client Side Programming course being taught at NSCC - Nova Scotia Community College. It allows you to generate specific types of poker hands with realistic card data including images.

## Features

- Generate 11 different types of poker hands
- Returns cards with realistic data (codes, images, values, suits)
- Card images from Deck of Cards API
- Easy-to-use REST endpoints
- Auto-restart development server with nodemon

## Installation

### Prerequisites
- Node.js (version 12 or higher)
- npm (comes with Node.js)

### Steps

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd pokerhand-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   
   For development (auto-restart on file changes):
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

4. **Access the API**
   
   The server will start on `http://localhost:3000`

## API Endpoints

### Root Endpoint
- **GET** `/`
- Returns welcome message and API documentation

**Response:**
```json
{
  "message": "Welcome to the Poker Hand Test API",
  "description": "Generate poker hands for testing purposes",
  "endpoint": "/pokerhandtest/{handtype}",
  "available_hands": [
    "royalflush", "straightflush", "fourofakind", "fullhouse", 
    "flush", "straight", "threeofakind", "twopair", "onepair", 
    "highcard", "random"
  ]
}
```

### Generate Poker Hand
- **GET** `/pokerhandtest/:hand`
- Generates a specific type of poker hand

**Parameters:**
- `hand` (required): The type of poker hand to generate

**Available Hand Types:**
- `royalflush` - Royal Flush (10, J, Q, K, A of same suit)
- `straightflush` - Straight Flush (5 consecutive cards of same suit)
- `fourofakind` - Four of a Kind (4 cards of same value)
- `fullhouse` - Full House (3 of a kind + pair)
- `flush` - Flush (5 cards of same suit)
- `straight` - Straight (5 consecutive cards)
- `threeofakind` - Three of a Kind (3 cards of same value)
- `twopair` - Two Pair (2 pairs of different values)
- `onepair` - One Pair (2 cards of same value)
- `highcard` - High Card (no matching cards)
- `random` - Random 5 cards

**Example Request:**
```
GET http://localhost:3000/pokerhandtest/royalflush
```

**Example Response:**
```json
{
  "success": true,
  "deck_id": "testdeck",
  "cards": [
    {
      "code": "0H",
      "image": "https://deckofcardsapi.com/static/img/0H.png",
      "images": {
        "svg": "https://deckofcardsapi.com/static/img/0H.svg",
        "png": "https://deckofcardsapi.com/static/img/0H.png"
      },
      "value": "10",
      "suit": "HEARTS"
    },
    // ... 4 more cards
  ],
  "remaining": 47
}
```

## Card Data Format

Each card in the response contains:
- `code`: Short code for the card (e.g., "AH" for Ace of Hearts)
- `image`: PNG image URL
- `images`: Object with SVG and PNG image URLs
- `value`: Card value ("2"-"10", "JACK", "QUEEN", "KING", "ACE")
- `suit`: Card suit ("HEARTS", "DIAMONDS", "CLUBS", "SPADES")

## Development

### Project Structure
```
pokerhand-api/
├── pokerhand_test_api.js    # Main API file
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

### Scripts
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart
- `npm test` - Run tests (not implemented yet)

### Adding New Hand Types

To add a new poker hand type:

1. Add a new case to the `generateHand()` function switch statement
2. Implement the logic to generate the specific hand
3. Update the `available_hands` array in the root endpoint

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `404` - Hand type not found

**Error Response Format:**
```json
{
  "success": false,
  "error": "Hand not found"
}
```

## Dependencies

- **express**: Web framework for Node.js
- **nodemon** (dev): Auto-restart server on file changes

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## Support

If you encounter any issues or have questions, please create an issue in the repository.