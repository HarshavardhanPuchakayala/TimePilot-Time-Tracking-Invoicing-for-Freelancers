<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/87f1b888-6285-4b79-9d1a-efead72de97d" />
# FreelanceFlow — Time Tracking & Invoicing App

A full-stack MERN application that lets freelancers track billable time against clients and projects, and generate invoices from unbilled work.

## Project Status

🚧 In active development — Project 1 of a 5-project MERN + production engineering learning roadmap.

## Problem

Freelancers often track time and manage invoicing across scattered spreadsheets and disconnected tools, leading to lost hours, inconsistent billing, and no single source of truth for what's been billed vs. outstanding.

## Core Features (MVP)

- [ ] User authentication (JWT-based signup/login)
- [ ] Client management (CRUD)
- [ ] Project management (CRUD, linked to clients)
- [ ] Time tracking (timer-based and manual entry)
- [ ] Edit/delete time entries
- [ ] Unbilled time summary (by client/project)
- [ ] Invoice generation from selected time entries
- [ ] Invoice status tracking (paid/unpaid)

## Tech Stack

**Frontend:** React, (routing/state libraries TBD)
**Backend:** Node.js, Express
**Database:** MongoDB, Mongoose
**Auth:** JWT, bcrypt
**Deployment:** Docker, Nginx, VPS

## Project Structure

```
.
├── client/          # React frontend
├── server/          # Express backend
│   ├── src/
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoint definitions
│   │   ├── controllers/  # Route logic
│   │   ├── middleware/   # Auth checks, error handling
│   │   └── config/       # DB connection, env setup
│   ├── .env.example
│   └── server.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas)

### Backend Setup

```bash
cd server
npm install
cp .env.example .env   # then fill in your own values
npm run dev
```

### Environment Variables

See `server/.env.example` for required variables (Mongo connection string, JWT secret, port).

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## API Documentation

_To be added as endpoints are built._

## Data Models

- **User** — freelancer account
- **Client** — a company/person the freelancer works for
- **Project** — unit of work under a Client
- **TimeSession** — a logged block of billable time under a Project
- **Invoice** — a bill generated from selected unbilled TimeSessions


## License

Personal learning project — not currently licensed for reuse.
