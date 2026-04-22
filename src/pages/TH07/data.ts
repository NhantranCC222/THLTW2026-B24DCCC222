export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail: string;
  tags: string[];
  status: 'Draft' | 'Published';
  views: number;
  createdAt: string;
  author: {
    name: string;
    avatar: string;
  };
}

export interface Tag {
  id: string;
  name: string;
}

const mockTags: Tag[] = [
  { id: '1', name: 'React' },
  { id: '2', name: 'JavaScript' },
  { id: '3', name: 'Web Development' },
];

const mockPosts: Post[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `post-${i + 1}`,
  title: `Bài viết mẫu ${i + 1}`,
  slug: `bai-viet-mau-${i + 1}`,
  summary: `Đây là tóm tắt cho bài viết mẫu số ${i + 1}. Học lập trình web rất thú vị.`,
  content: `## Nội dung chi tiết bài viết ${i + 1}\n\nĐây là nội dung được viết bằng **Markdown**.\n\n- Mục 1\n- Mục 2\n\n![Image](https://picsum.photos/seed/${i + 1}/600/300)`,
  thumbnail: `https://picsum.photos/seed/${i + 1}/400/200`,
  tags: i % 2 === 0 ? ['React', 'Web Development'] : ['JavaScript'],
  status: i % 5 === 0 ? 'Draft' : 'Published',
  views: Math.floor(Math.random() * 1000),
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  author: {
    name: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
  },
}));

export const getPosts = (): Post[] => {
  if (typeof window === 'undefined') return mockPosts;
  const stored = localStorage.getItem('th07_posts');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('th07_posts', JSON.stringify(mockPosts));
  return mockPosts;
};

export const setPosts = (posts: Post[]) => {
  localStorage.setItem('th07_posts', JSON.stringify(posts));
};

export const getTags = (): Tag[] => {
  if (typeof window === 'undefined') return mockTags;
  const stored = localStorage.getItem('th07_tags');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('th07_tags', JSON.stringify(mockTags));
  return mockTags;
};

export const setTags = (tags: Tag[]) => {
  localStorage.setItem('th07_tags', JSON.stringify(tags));
};
