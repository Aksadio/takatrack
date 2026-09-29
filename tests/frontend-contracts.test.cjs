'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const contracts = require('../app/static/js/api-contracts.js');

const baseUrl = process.env.TAKATRACK_URL || 'http://127.0.0.1:3000';

async function get(path) {
  const response = await fetch(new URL(path, baseUrl), { headers: { Accept: 'application/json' } });
  assert.equal(response.status, 200, `${path} returned HTTP ${response.status}`);
  return response;
}

async function getJson(path) {
  const response = await get(path);
  return response.json();
}

test('actual daily, weekly, and monthly dashboard responses match the browser contract', async () => {
  for (const period of ['daily', 'weekly', 'monthly']) {
    const payload = await getJson(`/api/dashboard?period=${period}`);
    assert.equal(contracts.dashboard(payload).period, period);
  }
});

test('actual transaction-list response matches types, nullability, and decimal serialization', async () => {
  const payload = await getJson('/api/transactions?limit=100&offset=0');
  const checked = contracts.transactionList(payload);
  assert.ok(checked.items.length <= checked.limit);
  checked.items.forEach(contracts.transaction);
});

test('actual settings response matches currency and manual-rate contracts', async () => {
  const payload = await getJson('/api/settings');
  const checked = contracts.settings(payload);
  assert.ok(checked.currencies.some((currency) => currency.code === checked.base_currency));
});

test('actual report endpoints and health endpoint remain usable without changing ledger data', async () => {
  const health = await getJson('/healthz');
  assert.equal(health.status, 'ok');
  const csv = await get('/api/exports/csv');
  assert.match(csv.headers.get('content-type') || '', /text\/csv/i);
  assert.match(csv.headers.get('content-disposition') || '', /takatrack-report\.csv/);
  const pdf = await get('/api/exports/pdf');
  assert.match(pdf.headers.get('content-type') || '', /application\/pdf/i);
  assert.match(pdf.headers.get('content-disposition') || '', /takatrack-report\.pdf/);
});

test('served route manifest matches the page routes declared by the source', async () => {
  const response = await get('/manus-routes.json');
  const manifest = await response.json();
  assert.deepEqual(Object.keys(manifest), ['routes']);
  assert.deepEqual(manifest.routes, [{ path: '/', title: 'TakaTrack dashboard' }]);
});
