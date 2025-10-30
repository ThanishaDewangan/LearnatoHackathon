import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { io } from '../server.js';

const router = Router();

// POST /posts → Create post
router.post('/', async (req, res) => {
  const { title, content, author } = req.body ?? {};
  if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

  const post = await prisma.post.create({ data: { title, content, author } });
  io.emit('post:new', post);
  res.status(201).json(post);
});

// GET /posts → Get all posts (sort by votes or date)
router.get('/', async (req, res) => {
  const { sort = 'date', q } = req.query as { sort?: string; q?: string };
  const orderBy = sort === 'votes'
    ? [{ votes: 'desc' as const }, { createdAt: 'desc' as const }]
    : [{ createdAt: 'desc' as const }];
  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: q, mode: Prisma.QueryMode.insensitive } }
        ]
      }
    : undefined;

  const posts = await prisma.post.findMany({
    where,
    orderBy,
    include: { _count: { select: { replies: true } } }
  });
  res.json(posts);
});

// GET /posts/:id → Get single post with replies
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({
    where: { id },
    include: { replies: { orderBy: { createdAt: 'asc' } } }
  });
  if (!post) return res.status(404).json({ error: 'not found' });
  res.json(post);
});

// POST /posts/:id/reply → Add reply
router.post('/:id/reply', async (req, res) => {
  const id = Number(req.params.id);
  const { content, author } = req.body ?? {};
  if (!content) return res.status(400).json({ error: 'content required' });

  const reply = await prisma.reply.create({ data: { content, author, postId: id } });
  io.emit('reply:new', { postId: id, reply });
  res.status(201).json(reply);
});

// POST /posts/:id/upvote → Upvote
router.post('/:id/upvote', async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.update({ where: { id }, data: { votes: { increment: 1 } } });
  io.emit('post:upvote', { id, votes: post.votes });
  res.json(post);
});

// Simple mock auth middleware: require x-role: instructor
function requireInstructor(req: any, res: any, next: any) {
  const role = (req.headers['x-role'] || '').toString().toLowerCase();
  if (role !== 'instructor') return res.status(403).json({ error: 'forbidden: instructor role required' });
  next();
}

// PATCH /posts/:id/answered → Mark as answered (instructor only)
router.patch('/:id/answered', requireInstructor, async (req, res) => {
  const id = Number(req.params.id);
  const { answered } = req.body ?? {};
  const post = await prisma.post.update({ where: { id }, data: { answered: Boolean(answered) } });
  io.emit('post:answered', { id, answered: post.answered });
  res.json(post);
});

// GET /posts/:id/similar → Suggest similar posts (simple keyword overlap)
router.get('/:id/similar', async (req, res) => {
  const id = Number(req.params.id);
  const current = await prisma.post.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ error: 'not found' });

  const text = `${current.title} ${current.content}`.toLowerCase();
  const tokens = Array.from(new Set(text.split(/[^a-z0-9]+/g).filter(w => w.length >= 4))).slice(0, 6);
  if (tokens.length === 0) return res.json([]);

  const orClauses = tokens.flatMap(t => [
    { title: { contains: t, mode: Prisma.QueryMode.insensitive } },
    { content: { contains: t, mode: Prisma.QueryMode.insensitive } }
  ]);

  const similar = await prisma.post.findMany({
    where: { id: { not: id }, OR: orClauses },
    orderBy: [{ votes: 'desc' }, { createdAt: 'desc' }],
    take: 5
  });
  res.json(similar);
});

export default router;

