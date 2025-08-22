import serverless from "serverless-http";
import app from "../../src/server";

export const handler = serverless(app);
