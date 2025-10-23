Railway Route Finder
A full-stack web application for searching and displaying multi-stop train routes with advanced filters and user authentication.

Features
User Registration & Login (JWT-based authentication)

Multi-stop train route search with advanced filters (stops, fare, seat availability, duration)

Clean, modern, responsive frontend built with React

RESTful backend using Node.js/Express and MongoDB

Admin/database seeding script for initial dummy data

Tech Stack
Frontend: React, Axios, CSS (custom/Tailwind)

Backend: Node.js, Express, JWT authentication

Database: MongoDB (Atlas)

Deployment: Render (backend & static frontend)

Setup & Installation
1. Clone the Repository
text
git clone https://github.com/ankitsingh4304/RouteFinderX1.git
cd RouteFinderX1
2. Backend Setup
text
cd backend
npm install
cp .env.example .env    # Edit .env to fill in your Mongo URI, JWT secret, and email API keys
npm run dev             # Starts backend server (nodemon)
Note: For production, use npm start instead.

3. Seed the Database
Run this ONCE for a fresh database to insert demo train/route data:

text
node seed.js
Make sure your .env file points to your intended (local or production) MongoDB instance when you do this.

4. Frontend Setup
text
cd ../frontend
npm install
cp .env.example .env    # Set REACT_APP_API_URL to your backend URL, e.g. https://your-backend.onrender.com
npm start               # Runs frontend on localhost:3000 for development
Production Deployment
Backend: Deploy to Render. Set up environment variables in Render dashboard. Build/start command: npm install && npm start

Frontend: Deploy build folder as a static site (Render Static Site, Netlify, Vercel, etc.)

Build command: npm run build

Publish directory: build

Set environment variable REACT_APP_API_URL as in .env

For all deployments, be sure your frontend REACT_APP_API_URL matches your deployed backend's address.

Usage
Open the deployed frontend in your browser.

Register a new account or log in with an existing user.

Enter route information, adjust filters (max stops, fare, etc.) and submit search.

Review all matching train route options displayed on the results panel.

Seeding the Database
To insert initial demo data into your MongoDB collection, run:

text
cd backend
node seed.js
Only run this ONCE per new database—running repeatedly may create duplicates.

Contributing
Pull requests are welcome. Feel free to open an issue if you want to add features or fix bugs.

License
MIT