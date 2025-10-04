To successfully build your Lotwise Portfolio Tracker locally, you must compile and start the three Node.js services (Backend, Worker, Frontend) while ensuring the two external dependencies (Postgres and Kafka) are running via Docker.

Here is the step-by-step process for a successful local build:

Step 1: Start External Dependencies (Postgres & Kafka) 🗄️
You must have Docker Desktop running. This step starts the services required by your applications.

Navigate to the project root (lotwise-portfolio-tracker/).

Start Services: Execute the command to launch your services defined in docker-compose.yml:

docker compose up -d

Initialize Database: Connect to the PostgreSQL database (portfoliodb on localhost:5432) and run the SQL script to create the lots table.

SQL

CREATE TABLE IF NOT EXISTS lots (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    quantity_remaining NUMERIC NOT NULL,
    original_quantity NUMERIC NOT NULL,
    cost_basis NUMERIC NOT NULL,
    open_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    realized_pnl NUMERIC DEFAULT 0,
    closing_trades JSONB DEFAULT '[]'::JSONB
);
Step 2: Build and Start the Backend API 🚀
The API acts as the gateway for trades and the server for reports.

Open Terminal 1 (or a new tab).

Install Dependencies: Navigate to the backend folder and install packages.

cd backend
npm install
Start the Server: Start the API (it connects to Kafka Producer and Postgres).

npm run dev
Wait for the console to log: "API Server running on port 3000" and "Kafka Producer connected."

Step 3: Build and Start the Worker ⚙️
The Worker processes the core FIFO accounting logic.

Open Terminal 2 (a new terminal window/tab).

Install Dependencies: Navigate to the worker folder and install packages.

cd worker
npm install
Start the Worker: Start the Kafka Consumer (it connects to Kafka Consumer and Postgres).

npm start
Wait for the console to log: "Kafka Worker is running and listening for trade events..."

Step 4: Build and Start the Frontend 🌐
The Next.js app provides the user interface.

Open Terminal 3 (a new terminal window/tab).

Install Dependencies: Navigate to the frontend folder and install packages.

cd frontend
npm install
Start the Dev Server: Start the Next.js development server.

npm run dev
Access: Open your web browser to http://localhost:3001 to use the application.
