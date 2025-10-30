import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postsRouter from './routes/posts.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/posts', postsRouter);

export default app;

