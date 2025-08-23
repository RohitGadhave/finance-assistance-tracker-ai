import express, { Request, Response } from "express";
import csrf from "csurf";
import cors from "cors";

import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { apiRouter } from "./routes/index.route";
import "./config/init_mogodb";

import path from "path";

import cookieParser from "cookie-parser";
import { config } from "./config/env";
import { userFromCookie } from "./middlewares/cookies.middleware";
import { ChatTopicModel } from "./models/chat-topic.model";
import { getPath } from "./utils/utils";

const app = express();
app.use(cors());
// 1. Set view engine to EJS
app.set("view engine", "ejs");
// 2. Set the directory where your .ejs files will live
app.set("views", getPath("src/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecretKey));
app.use(userFromCookie(config.cookieUserKey));
// CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use(express.static(getPath('src/public/www')));


app.get('/1', (req, res) => {
  res.sendFile(path.join(getPath('src/public/www'), 'chat.html'));
});
app.get("/", (req: Request|any, res: Response) => {
  const user = req?.user ?? {};
  res.render("index", { title: "AI Finance BABA", userLoggedIn: req?.user || false, csrfToken: req.csrfToken(),user });
});
app.get('/check', (req:any, res) => {
  res.send(`Signed Session ID: ${req?.user}`);
});
app.get('/clear', (req, res) => {
  res.clearCookie(config.cookieUserKey);
  res.send('Cookie cleared!');
});
app.get('/csrf-token', csrfProtection, (req, res) => {
    // res.json({ csrfToken: req.csrfToken() });
    res.json({ csrfToken: '' });
});
app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
