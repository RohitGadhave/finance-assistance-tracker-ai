import mongoose from "mongoose";
import { config } from "./env";

if (config.isMongoDbCluster) {
  config.mongoDbUrl = `mongodb+srv://${config.username}:${config.password}@${config.cluster}.mongodb.net/${config.dbName}?retryWrites=true&w=majority`;
}

console.log("mongoose db url", config.mongoDbUrl, config.dbName);
mongoose
  .connect(config.mongoDbUrl, {
    dbName: config.dbName,
    connectTimeoutMS: 300000,
  })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((error) => {
    console.error("mongoose connect error", JSON.stringify(error));
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

//connection to mongodb

mongoose.connection.on("connected", () => {
  console.log("mongodb connected to db");
});

mongoose.connection.on("error", (error) => {
  console.error(error);
});

mongoose.connection.on("disconnected", () => {
  console.log("mongodb is disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
