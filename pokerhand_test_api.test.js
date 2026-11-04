const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const { before, after, test } = require('node:test');

const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'];
const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
const handTypes = ['royalflush', 'straightflush', 'fourofakind', 'fullhouse', 'flush',
  'straight', 'threeofakind', 'twopair', 'onepair', 'highcard', 'random'];
let server;
let baseUrl;

before(async () => {
  const reservation = net.createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [path.join(__dirname, 'pokerhand_test_api.js')], {
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('API startup timed out')), 10000);
    let output = '';
    server.stdout.on('data', chunk => {
      output += chunk;
      if (output.includes('listening at')) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.stderr.on('data', chunk => { output += chunk; });
    server.once('error', error => {
      clearTimeout(timer);
      reject(error);
    });
    server.once('exit', code => {
      clearTimeout(timer);
      reject(new Error(`API exited (${code}): ${output}`));
    });
  });
});

after(async () => {
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill();
    await exited;
  }
});

async function requestHand(type) {
  const response = await fetch(`${baseUrl}/pokerhandtest/${type}`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.deck_id, 'testdeck');
  assert.equal(body.remaining, 47);
  assert.equal(body.cards.length, 5);
  assert.equal(new Set(body.cards.map(card => card.code)).size, 5, 'Cards must be unique');
  for (const card of body.cards) {
    assert.ok(ranks.includes(card.value));
    assert.ok(suits.includes(card.suit));
    const valueCode = { '10': '0', JACK: 'J', QUEEN: 'Q', KING: 'K', ACE: 'A' }[card.value] || card.value;
    assert.equal(card.code, valueCode + card.suit[0]);
    assert.equal(card.image, `https://deckofcardsapi.com/static/img/${card.code}.png`);
    assert.equal(card.images.png, card.image);
    assert.equal(card.images.svg, `https://deckofcardsapi.com/static/img/${card.code}.svg`);
  }
  return body.cards;
}

function isStraight(cards) {
  const sorted = cards.map(card => ranks.indexOf(card.value) + 2).sort((left, right) => left - right);
  return sorted.join(',') === '2,3,4,5,14' ||
    sorted.every((rank, index) => index === 0 || rank === sorted[index - 1] + 1);
}

function isFlush(cards) {
  return new Set(cards.map(card => card.suit)).size === 1;
}

function groups(cards) {
  const counts = new Map();
  for (const card of cards) counts.set(card.value, (counts.get(card.value) || 0) + 1);
  return [...counts.values()].sort((left, right) => right - left);
}

test('root lists all supported endpoints', async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).available_hands, handTypes);
});

test('straight stays consecutive after endpoints that sample ranks', async () => {
  for (let iteration = 0; iteration < 30; iteration++) {
    for (const type of ['flush', 'twopair', 'highcard']) {
      await requestHand(type);
      const cards = await requestHand('straight');
      assert.ok(isStraight(cards), `After ${type}: ${cards.map(card => card.value).join(', ')}`);
    }
  }
});

for (const type of handTypes) {
  test(`${type} returns valid hands across repeated requests`, async () => {
    for (let iteration = 0; iteration < 200; iteration++) {
      const cards = await requestHand(type);
      const label = `${type}: ${cards.map(card => card.code).join(', ')}`;
      switch (type) {
        case 'royalflush':
          assert.ok(isFlush(cards), label);
          assert.deepEqual(cards.map(card => ranks.indexOf(card.value)).sort((left, right) => left - right), [8, 9, 10, 11, 12]);
          break;
        case 'straightflush':
          assert.ok(isStraight(cards) && isFlush(cards), label);
          break;
        case 'flush':
          assert.ok(isFlush(cards), label);
          break;
        case 'straight':
          assert.ok(isStraight(cards) && !isFlush(cards), label);
          break;
        case 'highcard':
          assert.deepEqual(groups(cards), [1, 1, 1, 1, 1], label);
          assert.ok(!isStraight(cards) && !isFlush(cards), label);
          break;
        case 'random':
          break;
        default:
          assert.deepEqual(groups(cards), {
            fourofakind: [4, 1], fullhouse: [3, 2], threeofakind: [3, 1, 1],
            twopair: [2, 2, 1], onepair: [2, 1, 1, 1]
          }[type], label);
      }
    }
  });
}

test('hand names are case insensitive', async () => {
  assert.ok(isStraight(await requestHand('StRaIgHt')));
});

test('unknown hand returns a JSON 404', async () => {
  const response = await fetch(`${baseUrl}/pokerhandtest/unknown`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { success: false, error: 'Hand not found' });
});