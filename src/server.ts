import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { apiRouter } from "./routes/index.route";

const app = express();

app.use(express.json());
app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
