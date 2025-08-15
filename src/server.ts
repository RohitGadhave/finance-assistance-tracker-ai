import express, { Request, Response } from "express";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { apiRouter } from "./routes/index.route";
import "./config/init_mogodb";

import path from "path";
import { fileURLToPath } from 'url';

import cookieParser from "cookie-parser";
import { config } from "./config/env";
import csrf from "csurf";
import { userFromCookie } from "./middlewares/cookies.middleware";
import { ChatTopicModel } from "./models/chat-topic.model";

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Set view engine to EJS
app.set("view engine", "ejs");
// 2. Set the directory where your .ejs files will live
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(cookieParser(config.cookieSecretKey));
app.use(userFromCookie(config.cookieUserKey));
// CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use(express.static(path.join(__dirname, 'public/www')));


app.get('/1', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/www', 'chat.html'));
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
