import mongoose from "mongoose";
import dns from "node:dns";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache = global.mongooseCache ?? {
  connection: null,
  promise: null,
};

global.mongooseCache = cache;

function configureMongoDns() {
  const servers = process.env.MONGODB_DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers?.length) {
    dns.setServers(servers);
  }
}

export async function connectMongo() {
  if (cache.connection) {
    return cache.connection;
  }

  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error(
      "MongoDB is not configured. Add MONGODB_URI to .env and restart the dev server.",
    );
  }

  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(
      "Invalid MONGODB_URI. It must start with mongodb:// or mongodb+srv://.",
    );
  }

  configureMongoDns();

  cache.promise ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "beauty_anas",
    serverSelectionTimeoutMS: 8000,
  });

  try {
    cache.connection = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.connection;
}
