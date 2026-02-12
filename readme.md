# Kafka Microservice - Event Processing System

## 📖 Project Overview

This project is a resilient, event-driven microservice built with **Node.js**, **Express**, and **Apache Kafka**. It demonstrates a production-ready architecture acting as both a **Producer** (generating events) and a **Consumer** (processing events with idempotency checks).

The system ensures data integrity by preventing duplicate event processing and provides RESTful APIs for interaction and verification.

---

## 🚀 Key Features

* **Event Producer** → Validates and publishes user activity events to Kafka.
* **Event Consumer** → Asynchronously processes events and stores them in memory.
* **Idempotency Protection** → Prevents duplicate processing using unique Event IDs.
* **Dockerized Infrastructure** → Zookeeper, Kafka, and App orchestrated via Docker Compose.
* **Health Checks** → Container startup validation and dependency readiness.

---

## 🛠️ Prerequisites

* Docker
* Docker Compose
* Git
* Node.js v18+

---

## 📦 Installation & Setup

Follow these steps to get the system running.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/sai1432-ss/KafkaMicroservice-.git
cd KafkaMicroservice-
```

---

### 2️⃣ Configure Environment Variables

Create your runtime environment file:

```bash
cp .env.example .env
```


---

### 3️⃣ Start the Services

Build images and start all containers:

```bash
docker-compose up -d --build
```

This starts:

* Zookeeper
* Kafka Broker
* Node.js Microservice

---

### 4️⃣ Verify System Status

Ensure all services are running and healthy:

```bash
docker-compose ps
```

Expected status:

```
Up (healthy)
```

---

## 🔌 API Documentation

You can interact using **Postman**.

Base URL:

```
http://localhost:3000
```

---

## 1️⃣ Generate Event (Producer)

Publishes a user activity event to Kafka.

### Postman Configuration

**Method:** POST
**URL:**

```
http://localhost:3000/events/generate
```

**Headers**

| Key          | Value            |
| ------------ | ---------------- |
| Content-Type | application/json |

**Body → raw → JSON**

```json
{
  "userId": "user_123",
  "eventType": "LOGIN",
  "payload": {
    "device": "Pixel 9"
  }
}
```

---

### Success Response (201 Created)

```json
{
  "status": "Created",
  "eventId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 2️⃣ Check Processed Events (Consumer)

Retrieve all processed unique events.

### Postman Configuration

**Method:** GET
**URL:**

```
http://localhost:3000/events/processed
```

No body required.

---

### Example Response

```json
[
  {
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user_123",
    "eventType": "LOGIN",
    "timestamp": "2026-02-12T10:00:00.000Z",
    "payload": {
      "device": "Pixel 9"
    }
  }
]
```

---

## 🧪 Running Tests

The project includes automated tests for logic and full system behavior.

---

### Option 1 — Run Inside Docker (Recommended)

Ensures consistent runtime environment.

#### Run Unit Tests

```bash
docker cp unit.test.js kafka-microservice-app-service-1:/app/unit.test.js
docker exec -it kafka-microservice-app-service-1 node unit.test.js
```

---

#### Run Integration Tests

```bash
docker cp test.js kafka-microservice-app-service-1:/app/test.js
docker exec -it kafka-microservice-app-service-1 node test.js
```

---

### Option 2 — Run Locally

Requires Node.js installed.

#### Install Dependencies

```bash
npm install
```

#### Run Unit Tests

```bash
node unit.test.js
```

---

#### Run Integration Tests

Docker containers must already be running.

**Windows PowerShell**

```bash
$env:KAFKA_BROKERS="localhost:9092";
node test.js
```



## 📂 Project Structure

```
.
├── index.js
├── docker-compose.yml
├── unit.test.js
├── test.js
├── .env.example
└── README.md
```

### File Descriptions

**index.js**
Main application entry point. Contains:

* Express server
* Kafka producer
* Kafka consumer
* Idempotency logic

**docker-compose.yml**
Defines Zookeeper, Kafka, networking, and health checks.

**unit.test.js**
Standalone unit tests for business logic.

**test.js**
End-to-end integration test script.

**.env.example**
Environment configuration template.

---



## 💡 What This Project Demonstrates

* Event-driven microservices
* Kafka producer / consumer workflow
* Consumer groups and scaling
* Idempotent event processing
* Docker-based distributed systems
* Health‑checked container startup

---

