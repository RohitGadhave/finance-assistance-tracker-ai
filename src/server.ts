import express from 'express';
import {indexRouter} from './routes/index.route';

const app = express();

app.use(express.json());
app.use('/monitor', indexRouter);

export default app;