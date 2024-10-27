# 🚀 Money Diary - AI Financial Assistant

## 🌟 About
MoneyDiary is an AI-powered financial assistant designed to help users log and query their transactions seamlessly. Using natural language processing (NLP), MoneyDiary extracts transaction details from user inputs and stores them in a structured database. Users can ask questions about their transaction history, and MoneyDiary will retrieve relevant information using vector-based search for accurate responses.

## 🌟 Table of Contents
- **Features**

- **Architecture**

- **Tech Stack**

- **Setup**

- **Usage**

- **API Reference**

- **Database Structure**

### 📅 Features
- **Transaction Logging**: Log transactions by sending messages like "sent 500 naira to Mercy.
- **Natural Language Queries**: Ask questions like "How much did I send Isaac last week?" and get immediate answers.
- **Telegram Integration**: Log transactions via Telegram and access a dashboard for viewing transaction history.
- **Data Storage & Vector Search**:Transactions are stored in a relational database with vector-based search for fast and accurate retrieval.

### 📅 Architecture
- **Telegram Bot:**: Users log transactions by messaging the bot, which processes and stores these entries.
- **Web App Dashboard**: Users can view recent transactions and query transaction history.
- **Backend**: Handles user authentication, processes queries, stores data, and performs vector searches for retrieval.

### 📅 Tech Stack
- **Backend**: Nodejs, Expressjs
- **Database**: PostgreSQL for structured data, pgvector for embeddings.
- **Messaging Platform**: Telegram API for bot interactions
- **Frontend**:HTML/CSS/JavaScript for the web app dashboard
- **Server**:Caddy for secure HTTPS and reverse proxy