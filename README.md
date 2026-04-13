🗳️ Blockchain-Based Voting System

A secure, transparent, and decentralized voting system built using blockchain technology to ensure fair and tamper-proof elections.

🚀 Overview

This project leverages blockchain technology to eliminate the limitations of traditional voting systems such as lack of transparency, centralization, and risk of tampering. Each vote is recorded as a transaction on the blockchain, making the system immutable and verifiable.

🧠 Key Features
 One Person, One Vote (prevents duplicate voting)
 Secure Authentication System
 Tamper-proof Voting using Blockchain
 Transparent and Verifiable Results
 Smart Contract-based Vote Management
 Real-time Result Display

🏗️ Tech Stack

🌐 Frontend
HTML, CSS, JavaScript

⚙️ Backend
Node.js

🗄️ Database
MongoDB

⛓️ Blockchain
Ethereum
Solidity

🛠️ Tools
MetaMask
Hardhat (Solidity: compile, test, deploy)

Quick start
- Root: `npm install` (backend workspace)
- Blockchain: `npm run install:chain` or `cd blockchain && npm install`
- Backend: copy `backend/.env.example` to `backend/.env`, start MongoDB, then `npm run dev:backend`
- Contracts: start Ganache on port **7545**, then `npm run compile:chain` and `npm run deploy:chain`
- Frontend: open `frontend/index.html` or serve the `frontend` folder

⚙️ How It Works
User registers and logs in through the system
User connects their wallet via MetaMask
User casts a vote through the frontend
The vote is recorded as a transaction on the blockchain
Smart contract ensures vote validity and prevents duplication
Results are displayed transparently

