#  GraphQL Library App (Full Stack Open — Part 8)

A modern web application for accounting books and authors, built on the basis of the **GraphQL** architecture with support for authorization and real-time updates via **WebSockets**. The project was developed as part of the advanced Part of the 8th international course **Full Stack Open** (University of Helsinki).

---

## Architecture and Technology Stack

The project is divided into two independent layers (Frontend and Backend), communicating with each other exclusively through a single GraphQL entry point.

### Backend (Backend)
* **Node.js & Express**: Server platform.
* **Apollo Server v4**: A powerful GraphQL core for processing schemas, queries, and mutations.
* **MongoDB & Mongoose**: A document-based database. Relational relationships are set up (books refer to the ID of the authors' documents via the `ObjectId`).
* **JWT (JSON Web Tokens)**: Data protection and user authorization by tokens.
* **GraphQL Subscriptions (WebSockets)**: Implementation of live updates based on the `graphql-ws` and `ws` packages.

### Frontend
* **React 19 & Vite 6**: A fast client SPA application.
* **Apollo Client 4**: Declarative data management using the hooks `useQuery`, `useMutation` and `useSubscription', which completely replaced Axios.
* **InMemoryCache**: Intelligent local cache for instant interface updates without unnecessary network requests.

---

# Implemented functionality (According to the steps of the course)

* **Tasks 8.1–8.7 
* **Tasks 8.8–8.12 
* **Tasks 8.13–8.17 
* **Tasks 8.18–8.22
* **Tasks 8.23–8.26 

---

## Quick Launch (Local development)

### 1. Requirements
Make sure that **Node is running on your computer.js** (v18+) and a local **MongoDB** server (port `27017`).

###2. Launching The Backend
Go to the backend folder, install the dependencies, and create an environment file.:
```bash
cd library-backend
npm install
```
Create a file in the root of the backend **`.env`**:
``env
MONGODB_URI=mongodb://127.0.0.1:27017/graphqlLibrary
JWT_SECRET=YOUR_SUPER_SECRET_KEY
``
*(Optional)* Run a one-time script to generate a test user:
``bash
node seed.js
```
Start the server:
```bash
npm start
```
The backend will expand to `http://localhost:4000/graphql `. At the address `http://localhost:4000 `the interactive sandbox **Apollo Sandbox** is available for manual query testing.

###3. Launching the Frontend
Open a parallel terminal, go to the frontend folder and run Vite:
``bash
cd library-frontend
npm install
npm run dev
``
The frontend will automatically open in the browser at `http://localhost:5173 /`.

---

## Test login details

To check the functionality of the recommendations and add books, use the account created by the seed script.js`:
* **Username**: `marina`
* *A password is not required to complete the current course exercises (validation is strictly based on the user's name).*

---

## Project security

* The confidential key file `.env` is included in `.gitignore` and is never publicly available.
* The local connection address `127.0.0.1` is isolated inside the home computer and is completely protected from external attacks from the Internet.
* All GraphQL mutations are parameterized (using typed variables `$`), which 100% eliminates the possibility of injections into the database.

---
**Author of the project**: [Marina Buryakova / marinaburyakova]