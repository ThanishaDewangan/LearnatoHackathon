import { useState } from 'react';
import { api } from '../api';

export default function PostForm({ onCreated }: { onCreated: (post:any)=>void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const canSubmit = title.trim() && content.trim();

  return (
    <form
      className="bg-white rounded border p-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const r = await api.post('/posts', { title, content, author: author || undefined });
        onCreated(r.data);
        setTitle(''); setContent(''); setAuthor('');
      }}
    >
      <div className="font-medium">New Post</div>
      <input className="w-full border rounded px-3 py-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Your name (optional)" value={author} onChange={e => setAuthor(e.target.value)} />
      <textarea className="w-full border rounded px-3 py-2" placeholder="Content" rows={3} value={content} onChange={e => setContent(e.target.value)} />
      <button disabled={!canSubmit} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">Post</button>
    </form>
  );
}

