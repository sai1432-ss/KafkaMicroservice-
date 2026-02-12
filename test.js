const { Kafka } = require('kafkajs');

// Configuration
const API_URL = 'http://localhost:3000';
const KAFKA_BROKER = process.env.KAFKA_BROKERS || 'kafka:29092';

// Colors for console output
const PASS = '\x1b[32mPASS\x1b[0m';
const FAIL = '\x1b[31mFAIL\x1b[0m';

async function runIntegrationTests() {
  console.log('🚀 Starting Integration Tests...\n');

  // --- TEST 1: Verify API Event Generation (Step 1.3) ---
  console.log('1️⃣  Testing POST /events/generate...');
  try {
    const response = await fetch(`${API_URL}/events/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test_user_1',
        eventType: 'LOGIN',
        payload: { test: 'integration' }
      })
    });

    if (response.status === 201) {
      const data = await response.json();
      console.log(`   ${PASS} Event Created: ${data.eventId}`);
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (err) {
    console.error(`   ${FAIL} API Error:`, err.message);
  }

  // --- TEST 2: Verify Idempotency (Step 2.2) ---
  // We manually send TWO messages with the SAME eventId to Kafka
  // to prove the consumer only stores ONE.
  console.log('\n2️⃣  Testing Consumer Idempotency (Duplicate Handling)...');
  const duplicateId = 'duplicate-test-id-999';
  const duplicateEvent = {
    eventId: duplicateId,
    userId: 'hacker_user',
    eventType: 'ATTACK',
    timestamp: new Date().toISOString(),
    payload: { attempt: 'double_spend' }
  };

  const kafka = new Kafka({ clientId: 'test-script', brokers: [KAFKA_BROKER] });
  const producer = kafka.producer();

  try {
    await producer.connect();
    
    // Send 1st Copy
    await producer.send({
      topic: 'user-activity-events',
      messages: [{ value: JSON.stringify(duplicateEvent) }],
    });
    console.log('   -> Sent Copy 1');

    // Send 2nd Copy (The Duplicate)
    await producer.send({
      topic: 'user-activity-events',
      messages: [{ value: JSON.stringify(duplicateEvent) }],
    });
    console.log('   -> Sent Copy 2 (Duplicate)');
    
    await producer.disconnect();
  } catch (err) {
    console.error(`   ${FAIL} Kafka Error:`, err.message);
  }

  // Wait for Consumer to process
  console.log('\n⏳ Waiting 3 seconds for processing...');
  await new Promise(r => setTimeout(r, 3000));

  // --- TEST 3: Verify Data Retrieval (Step 3.1) ---
  console.log('\n3️⃣  Testing GET /events/processed...');
  try {
    const response = await fetch(`${API_URL}/events/processed`);
    const storedEvents = await response.json();

    // Check 1: Did we find the API event?
    const foundApiEvent = storedEvents.find(e => e.userId === 'test_user_1');
    if (foundApiEvent) console.log(`   ${PASS} Found API generated event.`);
    else console.log(`   ${FAIL} Missing API event!`);

    // Check 2: Did we handle the duplicate correctly?
    const duplicates = storedEvents.filter(e => e.eventId === duplicateId);
    if (duplicates.length === 1) {
      console.log(`   ${PASS} Idempotency Check Passed: Found exactly 1 copy of ID ${duplicateId}`);
    } else {
      console.log(`   ${FAIL} Idempotency Failed: Found ${duplicates.length} copies of ID ${duplicateId}`);
    }

    console.log(`\n✅ Total Events Stored: ${storedEvents.length}`);

  } catch (err) {
    console.error(`   ${FAIL} Query API Error:`, err.message);
  }
}

runIntegrationTests();