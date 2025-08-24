import serverless from "serverless-http";
// import app from "../../src/server";
import app from "../../dist/server";
export const handler = serverless(app);
