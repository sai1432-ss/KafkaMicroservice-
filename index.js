const express = require('express');
const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid'); // Ensure npm install uuid@9
require('dotenv').config();

const app = express();
app.use(express.json());

// In-memory store for processed events
const processedEvents = [];

// --- HELPER FUNCTIONS (Logic to be Unit Tested) ---
/**
 * Logic to create the UserEvent object
 */
const generateUserEvent = (userId, eventType, payload) => {
  return {
    eventId: uuidv4(),
    userId: userId,
    eventType: eventType,
    timestamp: new Date().toISOString(),
    payload: payload || {}
  };
};

/**
 * Logic to check for duplicate events (Idempotency)
 */
const isDuplicate = (eventId, eventHistory) => {
  return eventHistory.some(event => event.eventId === eventId);
};
// --------------------------------------------------

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKA_BROKERS || 'kafka:29092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'user-activity-consumer-group' });

/**
 * PHASE 1: Producer API
 * POST /events/generate
 */
app.post('/events/generate', async (req, res) => {
  const { userId, eventType, payload } = req.body;

  if (!userId || !eventType) {
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: 'userId and eventType are required fields.' 
    });
  }

  // Use the helper function (This is what we test!)
  const userEvent = generateUserEvent(userId, eventType, payload);

  try {
    await producer.send({
      topic: 'user-activity-events',
      messages: [{ value: JSON.stringify(userEvent) }],
    });
    return res.status(201).json({ status: 'Created', eventId: userEvent.eventId });
  } catch (error) {
    console.error('Producer Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PHASE 3: Query API
 * GET /events/processed
 */
app.get('/events/processed', (req, res) => {
  res.status(200).json(processedEvents);
});

/**
 * PHASE 2: Consumer Logic
 */
const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'user-activity-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const eventData = JSON.parse(message.value.toString());

      console.log(`Received Event -> ID: ${eventData.eventId}`);

      // --- IDEMPOTENCY CHECK (Using Helper Function) ---
      if (isDuplicate(eventData.eventId, processedEvents)) {
        console.warn(`Skipping Duplicate -> ID: ${eventData.eventId}`);
        return;
      }

      console.log(`Processing Event -> ID: ${eventData.eventId}, User: ${eventData.userId}, Type: ${eventData.eventType}`);
      processedEvents.push(eventData);
    },
  });
};

const start = async () => {
  try {
    await producer.connect();
    console.log('Producer connected');
    await runConsumer();
    console.log('Consumer connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start services:', err);
  }
};

// --- CRITICAL EXPORT SECTION ---
// 1. Only start server if run directly
if (require.main === module) {
  start();
}

// 2. Export functions for testing
module.exports = { generateUserEvent, isDuplicate, processedEvents };