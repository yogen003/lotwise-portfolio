
**Lotwise Portfolio Tracker**
This project is a portfolio tracking tool that uses a Lot System and FIFO (First-In, First-Out) accounting principles to calculate open positions, average cost, and realized Profit & Loss (P&L).

The architecture is built using a modern microservices pattern: Next.js (Frontend), Node.js/Express (Backend API), Node.js/Kafka (Worker), and PostgreSQL (Database).

1. Data Model (Tables & Relationships)
The application uses one core table in PostgreSQL, lots, which is responsible for recording the purchase history (the "lots") and storing the result of all sales (realized P&L).

A. lots Table Schema
Column Name	Data Type	Description
id	SERIAL PRIMARY KEY	Unique identifier for each purchase lot.
symbol	VARCHAR(10)	Stock ticker (e.g., AAPL).
quantity_remaining	NUMERIC	Number of shares currently held from this lot (open position).
original_quantity	NUMERIC	The initial number of shares purchased.
cost_basis	NUMERIC	The price at which the lot was purchased.
open_timestamp	TIMESTAMP WITH TIME ZONE	Key: Used to determine FIFO order (oldest first).
realized_pnl	NUMERIC	Accumulated P&L recorded when shares from this lot were sold.
closing_trades	JSONB	Audit history of sale transactions applied against this lot.

Export to Sheets
B. Relationships (Derived Views)
No complex relational joins are strictly necessary for the core logic. The Backend API generates its reports by running aggregation queries against the lots table:

/positions: Aggregates all rows where quantity_remaining > 0 to calculate the total_quantity and weighted_average_cost per symbol.

/pnl: Aggregates the realized_pnl column across all rows to provide the total profit/loss per symbol.

2. How FIFO Matching Works
The FIFO (First-In, First-Out) rule is implemented entirely within the Worker service upon receiving a Sell event from Kafka.

Event Consumption: A Sell trade event (qty is negative) is consumed by the Worker.

FIFO Lookup: The Worker queries the lots table for the matching symbol and orders the results by open_timestamp ASC (ascending). This ensures the oldest lot is at the top.

Matching and Allocation: The Worker iterates through the oldest open lots:

It takes shares from the oldest lot first.

P&L Calculation: The realized P&L is calculated using the formula:

P&L=(Sale Price−Lot Cost Basis)×Quantity Sold
The corresponding quantity_remaining is reduced, and the realized_pnl for that lot is updated in a single database transaction.

Transaction Handling: This process continues until the entire sale quantity is covered. Database transactions (BEGIN/COMMIT/ROLLBACK) ensure that if any part of the matching fails (e.g., a connection drops), the entire sale is rolled back, preserving data integrity.

3. How to Run Locally
This project requires Docker (for Postgres and Kafka), Node.js (for all services), and Next.js (for the frontend).

Prerequisites
Docker Desktop (Running)

Node.js (v18+)

All terminals must be started from the project root directory.

Step-by-Step Instructions
A. Start Infrastructure (Postgres & Kafka)
Ensure you have the complete docker-compose.yml file (including Postgres).

Run the command from the project root:

docker compose up -d
Initialize Database: Connect to the portfoliodb (user: user, port: 5432) and run the CREATE TABLE lots SQL script.

B. Start Backend API (Port 3000)
Navigate to the backend directory:

cd backend
npm install
Start the API server (will connect to Kafka Producer and Postgres):

npm run dev
C. Start Worker (Kafka Consumer)
Open a new terminal tab/window.

Navigate to the worker directory:

cd worker
npm install
Start the Worker (will connect to Kafka Consumer and Postgres):

npm start
D. Start Frontend (Port 3001)
Open a third terminal tab/window.

Navigate to the frontend directory:

cd frontend
npm install
Start the Next.js development server:

Bash

npm run dev
Access the site at: http://localhost:3001
