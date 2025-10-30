import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE, api, setRoleHeader } from './api';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';

export default function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sort, setSort] = useState<'date'|'votes'>('date');
  const [q, setQ] = useState('');
  const [isInstructor, setIsInstructor] = useState(false);

  const socket: Socket = useMemo(() => io(API_BASE), []);
  useEffect(() => {
    api.get('/posts', { params: { sort, q } }).then(r => setPosts(r.data));
  }, [sort, q]);

  useEffect(() => {
    setRoleHeader(isInstructor ? 'instructor' : null);
  }, [isInstructor]);

  useEffect(() => {
    socket.on('post:new', (post: any) => setPosts(prev => [post, ...prev]));
    socket.on('post:upvote', ({ id, votes }: any) => setPosts(prev => prev.map(p => p.id === id ? { ...p, votes } : p)));
    socket.on('post:answered', ({ id, answered }: any) => setPosts(prev => prev.map(p => p.id === id ? { ...p, answered } : p)));
    return () => { socket.disconnect(); };
  }, [socket]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <header className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <h1 className="text-2xl font-semibold">Learnato Forum</h1>
        <div className="flex gap-2 items-center">
          <input placeholder="Search..." className="border rounded px-3 py-2" value={q} onChange={e => setQ(e.target.value)} />
          <select className="border rounded px-3 py-2" value={sort} onChange={e => setSort(e.target.value as any)}>
            <option value="date">Newest</option>
            <option value="votes">Top</option>
          </select>
          <label className="flex items-center gap-2 text-sm border rounded px-2 py-1">
            <input type="checkbox" checked={isInstructor} onChange={e => setIsInstructor(e.target.checked)} />
            Instructor
          </label>
        </div>
      </header>

      <PostForm onCreated={(p) => setPosts(prev => [p, ...prev])} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PostList
          posts={posts}
          onSelect={(id) => setSelectedId(id)}
          onUpvote={async (id) => {
            const r = await api.post(`/posts/${id}/upvote`);
            setPosts(prev => prev.map(p => p.id === id ? r.data : p));
          }}
        />
        <PostDetail postId={selectedId} isInstructor={isInstructor} />
      </div>
    </div>
  );
}

