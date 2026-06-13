# Server Setup for MongoDB Atlas

This project currently uses `process.env.MONGO_URI` to connect to MongoDB.
If the local MongoDB server is unavailable, the backend can optionally fall back to an in-memory database during development.

## Setup a permanent MongoDB Atlas cluster

1. Go to https://www.mongodb.com/cloud/atlas and sign in or create a free account.
2. Create a new cluster and name it `ai diet planner`.
3. Create a database user and password.
4. Add your IP address to Network Access.
5. Get the connection string for the cluster and modify it to use the database name `ai_diet_planner`.

Example `MONGO_URI`:

```env
MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/ai_diet_planner?retryWrites=true&w=majority"
```

6. Copy `server/.env.example` to `server/.env` and update values.

## Run the server

```powershell
cd "e:\ai diet planner\server"
npm install
npm run dev
```

## Permanent vs temporary storage

- **MongoDB Atlas**: your data is stored permanently in the cloud. Good for production and real projects.
- **Local `mongodb-memory-server` fallback**: temporary data stored in memory. It is lost when the server stops.

## If you want to use Atlas now

- Create the cluster in Atlas.
- Add the Atlas URI to `server/.env`.
- Restart the backend.
## Local MongoDB fallback

If Atlas is unavailable or not configured, the server will next attempt to connect to local MongoDB using `MONGO_URI_LOCAL`.

- Install MongoDB Community Server on your machine.
- Start the `mongod` service.
- Confirm it listens on port `27017`.
- If you want a temporary in-memory fallback during development, set `ALLOW_MEMORY_FALLBACK=true`.
If you want, I can also help you with the exact Atlas cluster config string once you have your Atlas account and username/password. 