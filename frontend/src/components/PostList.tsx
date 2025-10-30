export default function PostList({ posts, onSelect, onUpvote }: { posts: any[], onSelect: (id:number)=>void, onUpvote:(id:number)=>void }) {
  return (
    <div className="bg-white rounded border">
      <div className="p-3 border-b font-medium">Questions</div>
      <ul className="divide-y">
        {posts.map(p => (
          <li key={p.id} className="p-3 flex items-start justify-between gap-3">
            <div className="cursor-pointer" onClick={() => onSelect(p.id)}>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{p.content}</div>
              <div className="text-xs text-gray-500 mt-1">Votes: {p.votes} • Replies: {p._count?.replies ?? 0}{p.answered ? ' • Answered' : ''} {p.author ? `• Posted by: ${p.author}` : ''}</div>
            </div>
            <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm" onClick={() => onUpvote(p.id)}>Upvote</button>
          </li>
        ))}
        {posts.length === 0 && <li className="p-3 text-sm text-gray-500">No posts yet</li>}
      </ul>
    </div>
  );
}

