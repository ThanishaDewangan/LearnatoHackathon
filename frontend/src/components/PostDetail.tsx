import { useEffect, useMemo, useState } from 'react';
import { api, API_BASE } from '../api';
import { io } from 'socket.io-client';

export default function PostDetail({ postId, isInstructor }: { postId: number | null, isInstructor: boolean }) {
  const [post, setPost] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [similar, setSimilar] = useState<any[]>([]);
  const socket = useMemo(() => io(API_BASE), []);

  useEffect(() => {
    if (!postId) { setPost(null); return; }
    api.get(`/posts/${postId}`).then(r => setPost(r.data));
  }, [postId]);

  useEffect(() => {
    if (!postId) { setSimilar([]); return; }
    api.get(`/posts/${postId}/similar`).then(r => setSimilar(r.data));
  }, [postId]);

  useEffect(() => {
    socket.on('reply:new', (payload: any) => {
      if (payload.postId === postId) {
        setPost((prev: any) => prev ? { ...prev, replies: [...prev.replies, payload.reply] } : prev);
      }
    });
    return () => { socket.disconnect(); };
  }, [socket, postId]);

  if (!postId) return <div className="bg-white rounded border p-3">Select a post</div>;
  if (!post) return <div className="bg-white rounded border p-3">Loading...</div>;

  return (
    <div className="bg-white rounded border p-3 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-lg">{post.title}</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</div>
          {post.author && <div className="text-xs text-gray-500 mt-1">Posted by: {post.author}</div>}
          {post.answered && <div className="text-xs text-green-700 mt-1">Marked as Answered</div>}
        </div>
        <button
          className="px-2 py-1 rounded border text-xs"
          disabled={!isInstructor}
          onClick={async () => {
            const r = await api.patch(`/posts/${postId}/answered`, { answered: !post.answered });
            setPost((prev:any) => ({ ...prev, answered: r.data.answered }));
          }}
        >
          {post.answered ? 'Unmark' : 'Mark Answered'}{!isInstructor ? ' (Instructor only)' : ''}
        </button>
      </div>

      <div>
        <div className="font-medium mb-2">Replies</div>
        <ul className="space-y-2">
          {post.replies.map((r:any) => (
            <li key={r.id} className="border rounded p-2">
              <div className="text-sm">{r.content}</div>
              <div className="text-xs text-gray-500 mt-1">{r.author ?? 'Anonymous'}</div>
            </li>
          ))}
          {post.replies.length === 0 && <li className="text-sm text-gray-500">No replies yet</li>}
        </ul>
      </div>

      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          const r = await api.post(`/posts/${postId}/reply`, { content: reply });
          setPost((prev:any) => prev ? { ...prev, replies: [...prev.replies, r.data] } : prev);
          setReply('');
        }}
      >
        <input className="flex-1 border rounded px-3 py-2" placeholder="Write a reply..." value={reply} onChange={e => setReply(e.target.value)} />
        <button className="px-3 py-2 rounded bg-black text-white">Reply</button>
      </form>

      <div>
        <div className="font-medium mt-4 mb-2">Similar Posts</div>
        <ul className="space-y-2">
          {similar.map((s:any) => (
            <li key={s.id} className="border rounded p-2 text-sm">
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-gray-500">Votes: {s.votes}{s.author ? ` • Posted by: ${s.author}` : ''}</div>
            </li>
          ))}
          {similar.length === 0 && <li className="text-sm text-gray-500">No suggestions</li>}
        </ul>
      </div>
    </div>
  );
}

