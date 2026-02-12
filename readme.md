Kafka Microservice - Event Processing System
============================================

📖 Project Overview
-------------------

This project represents a robust, production-ready blueprint for a distributed event-driven microservice architecture. Built using **Node.js** and **Express**, it integrates seamlessly with **Apache Kafka** to demonstrate core principles of modern backend engineering.

The service is designed to handle the full lifecycle of a **UserEvent**: acting as a **Producer** that ingests and validates API requests, and a **Consumer** that processes these messages asynchronously. A key focus of this implementation is **Idempotency**—ensuring that even if Kafka redelivers a message (a common occurrence in distributed systems), the application processes it exactly once, maintaining data integrity.

🏗️ Architectural Overview
--------------------------

The system is containerized using Docker Compose and consists of three distinct components interacting in real-time:

1.  **Zookeeper**: The coordination service responsible for managing the Kafka cluster state and configuration.
    
2.  **Kafka Broker**: The central message bus. It hosts the user-activity-events topic where all immutable event logs are stored.
    
3.  **App Service (Node.js)**: A single microservice that performs three roles:
    
    *   **API Layer**: Exposes REST endpoints for external clients to generate events and query data.
        
    *   **Producer Client**: Validates incoming JSON payloads, appends metadata (UUID, ISO Timestamps), and publishes to Kafka.
        
    *   **Consumer Client**: Listens to the topic as part of the user-activity-consumer-group, filtering duplicates before storing valid events in an in-memory database.
        

🚀 Key Features
---------------

*   **Robust Event Producer**: The system exposes a clean RESTful POST endpoint. It enforces a strict schema validation, ensuring every event contains a userId and eventType before it is serialized and sent to the broker.
    
*   **Scalable Consumer Groups**: The consumer is configured with a specific groupId (user-activity-consumer-group). This design pattern allows the system to scale horizontally; if we added more instances of this service, Kafka would automatically load-balance the partitions among them.
    
*   **Idempotency & Data Integrity**: Since Kafka guarantees "at-least-once" delivery, duplicate messages are possible. This service implements logic to check every incoming eventId against the local data store. If a duplicate is detected, it is logged and gracefully skipped, preventing data corruption.
    
*   **In-Memory Persistence**: For demonstration purposes, processed events are stored in a resilient in-memory array, allowing for immediate retrieval and verification via the Query API.
    
*   **Containerized Health Checks**: The docker-compose.yml includes sophisticated health checks. The application waits until Kafka is fully operational before attempting to connect, preventing startup race conditions.
    

🛠️ Prerequisites
-----------------

To run this system, ensure your environment meets the following requirements:

*   **Docker & Docker Compose**: Required to orchestrate the multi-container environment (Zookeeper, Kafka, App).
    
*   **Node.js (v18+)**: Optional. Only required if you intend to run unit tests locally without Docker.
    
*   **API Client**: Tools like Postman, Insomnia, or cURL to interact with the HTTP endpoints.
    

📦 Installation & Detailed Setup
--------------------------------

1.  git clone cd kafka-microservice
    
2.  docker-compose up -d --build
    
3.  docker-compose ps_Look for a status of Up (healthy) for all three services._
    

🔌 API Documentation
--------------------

### 1\. Generate Event (Producer)

This endpoint acts as the entry point for the system. It accepts raw user activity data and transforms it into a standardized UserEvent.

*   **Endpoint**: POST http://localhost:3000/events/generate
    
*   **Content-Type**: application/json
    

**Request Body Schema:**The payload field is flexible and can store any event-specific metadata (e.g., location, device info, browser type).

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "userId": "user_LE5",    "eventType": "LOGIN",         // Required: Type of activity (LOGIN, LOGOUT, etc.)    "payload": {      "device": "Pixel 9",      "region": "India"    }  }   `

**Response:**

*   { "status": "Created", "eventId": "550e8400-e29b-41d4-a716-446655440000"}
    
*   **400 Bad Request**: The request failed validation (missing userId or eventType).
    
*   **500 Internal Server Error**: The service could not connect to the Kafka broker.
    

### 2\. Query Processed Events (Consumer)

This endpoint exposes the state of the in-memory database, allowing you to verify that events have been consumed and stored correctly.

*   **Endpoint**: GET http://localhost:3000/events/processed
    

**Response:**Returns a JSON array of all unique UserEvent objects currently held in memory.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   [    {      "eventId": "550e8400-e29b-41d4-a716-446655440000",      "userId": "user_LE5",      "eventType": "LOGIN",      "timestamp": "2026-02-12T10:00:00.000Z",      "payload": { "device": "Pixel 9", "region": "India" }    },    ...  ]   `

🧪 Comprehensive Testing Strategy
---------------------------------

This project utilizes a dual-layer testing strategy to ensure both code correctness and system stability. You can run tests either inside the Docker container (Recommended) or locally.

### Option 1: Running Tests Inside Docker (Recommended)

This method ensures tests run in the exact environment where the code is deployed. We use docker cp to ensure the latest test scripts are present in the container before execution.

**1\. Unit Tests (Logic Isolation)**Verifies schema generation and idempotency logic without external dependencies.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   docker cp unit.test.js kafka-microservice-app-service-1:/app/unit.test.js; docker exec -it kafka-microservice-app-service-1 node unit.test.js   `

**2\. Integration Tests (End-to-End)**Validates the full flow: Producer API -> Kafka -> Consumer -> Database.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   docker cp test.js kafka-microservice-app-service-1:/app/test.js; docker exec -it kafka-microservice-app-service-1 node test.js   `

### Option 2: Running Tests Locally (Windows PowerShell)

Use this method for rapid development cycles without entering the container.

**1\. Install Dependencies**Required only once to download kafkajs, express, etc. to your machine.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   npm install   `

**2\. Run Unit Tests**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   node unit.test.js   `

**3\. Run Integration Tests**We set the KAFKA\_BROKERS environment variable to localhost:9092 so the script connects to the exposed Docker port.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   $env:KAFKA_BROKERS = "localhost:9092"  node test.js   `

📂 Project Structure
--------------------

*   index.js: The monolithic entry point. It initializes the Express server, configures the Kafka Producer/Consumer, and contains the core event loop logic.
    
*   docker-compose.yml: Infrastructure as Code (IaC) file defining the Zookeeper and Kafka services, network bridges, and environment variables.
    
*   unit.test.js: Standalone test suite using Node.js assertions to validate helper functions.
    
*   test.js: An automated script acting as an external client to verify system behavior and idempotency.