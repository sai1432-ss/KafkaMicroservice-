const assert = require('assert');
const { generateUserEvent, isDuplicate } = require('./index');

console.log('🚀 Starting Unit Tests (Logic Only)...\n');

// --- TEST 1: Event Generation Logic ---
console.log('1️⃣  Testing generateUserEvent()...');
try {
  const event = generateUserEvent('unit_user', 'TEST_TYPE', { foo: 'bar' });

  // Assertions
  assert.ok(event.eventId, 'Event ID should exist');
  assert.strictEqual(event.userId, 'unit_user', 'User ID should match');
  assert.strictEqual(event.eventType, 'TEST_TYPE', 'Event Type should match');
  assert.ok(event.timestamp, 'Timestamp should exist');
  assert.ok(!isNaN(Date.parse(event.timestamp)), 'Timestamp should be valid ISO 8601');
  
  console.log('   ✅ PASS: Schema structure is valid.');
} catch (err) {
  console.error('   ❌ FAIL:', err.message);
  process.exit(1);
}

// --- TEST 2: Idempotency Logic ---
console.log('\n2️⃣  Testing isDuplicate() (Idempotency)...');
try {
  const mockHistory = [
    { eventId: 'id-123', userId: 'u1' },
    { eventId: 'id-456', userId: 'u2' }
  ];

  // Case A: Duplicate ID
  const resultTrue = isDuplicate('id-123', mockHistory);
  assert.strictEqual(resultTrue, true, 'Should return TRUE for existing ID');
  console.log('   ✅ PASS: Correctly identified duplicate.');

  // Case B: New ID
  const resultFalse = isDuplicate('id-789', mockHistory);
  assert.strictEqual(resultFalse, false, 'Should return FALSE for new ID');
  console.log('   ✅ PASS: Correctly identified new event.');

} catch (err) {
  console.error('   ❌ FAIL:', err.message);
  process.exit(1);
}

console.log('\n✅ All Unit Tests Passed!');