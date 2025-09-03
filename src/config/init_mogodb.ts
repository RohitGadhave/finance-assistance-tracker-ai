import mongoose from "mongoose";
import { config } from "./env";
let isDBConnected:boolean = false;
export async function connectDB(){
  if(isDBConnected)return true;
  if (config.isMongoDbCluster) {
    config.mongoDbUrl = `mongodb+srv://${config.username}:${config.password}@${config.cluster}.mongodb.net/${config.dbName}?retryWrites=true&w=majority`;
  }
  return new Promise((resolve,reject)=>{
    console.log("mongoose db config", config.isMongoDbCluster?'mongodb+srv':config.mongoDbUrl, {cluster:config.cluster,dbName:config.dbName});
    mongoose
      .connect(config.mongoDbUrl, {
        dbName: config.dbName,
        connectTimeoutMS: 300000,
      })
      .then(() => {
        console.log("mongodb connected");
        isDBConnected = true;
        resolve(true);
      })
      .catch((error) => {
        console.error("mongoose connect error", JSON.stringify(error));
        isDBConnected = false;
        reject(false);
      });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
      console.log("Connected successfully");
      isDBConnected = true;
      resolve(true);
    });

    //connection to mongodb

    mongoose.connection.on("connected", () => {
      isDBConnected = true;
      console.log("mongodb connected to db");
      resolve(true);
    });

    mongoose.connection.on("error", (error) => {
      isDBConnected = false;
      console.error(error);
      reject(false);
      });

    mongoose.connection.on("disconnected", () => {
      isDBConnected = false;
      console.log("mongodb is disconnected");
      reject(false);
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      isDBConnected = false;
      process.exit(0);
    });
  });
}