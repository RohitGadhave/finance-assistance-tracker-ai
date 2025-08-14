import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  env: process.env.NODE_ENV || "development",
  groqApiKey: process.env.GROQ_AI_API_KEY || "",
  isProduction: process.env.NODE_ENV === "production",
  aiModel: process.env.AI_MODEL || "",
  MAX_TOOL_CALL_LOOPS: 10,
  dbName: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  cluster: process.env.DB_CLUSTER,
  mongoDbUrl :process.env.DB_URL || "mongodb://localhost:27017",
  isMongoDbCluster:process.env.USE_MONGODB_CLUSTER == "1",
  cookieSecretKey:process.env.COOKIE_SECRET_KEY || "rohit",
  cookieUserKey:'_UID',
};
