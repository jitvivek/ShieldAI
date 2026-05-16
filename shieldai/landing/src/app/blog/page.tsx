import Footer from '@/components/Footer';

const POSTS = [
  {
    slug: 'what-is-prompt-injection',
    title: 'What Is Prompt Injection? A Complete Guide for Developers',
    excerpt: 'Prompt injection is to LLMs what SQL injection was to databases. Learn how it works and how to prevent it.',
    date: 'May 15, 2026',
    readTime: '6 min',
  },
  {
    slug: 'prompt-injection-hindi-hinglish',
    title: 'Prompt Injection in Hindi & Hinglish: The Blind Spot in LLM Security',
    excerpt: 'Every major LLM security tool fails on Hindi prompts. Here\'s why, and how ShieldAI fixes it.',
    date: 'May 15, 2026',
    readTime: '8 min',
  },
  {
    slug: 'prevent-injection-langchain',
    title: 'How to Prevent Prompt Injection in LangChain Applications',
    excerpt: 'Add real-time prompt scanning to your LangChain app with a single callback handler.',
    date: 'May 15, 2026',
    readTime: '5 min',
  },
  {
    slug: 'owasp-top10-llm-india',
    title: 'OWASP Top 10 for LLMs: An Indian Perspective',
    excerpt: 'Mapping every OWASP LLM risk to the Indian context — Aadhaar, DPDP Act, RBI, and more.',
    date: 'May 15, 2026',
    readTime: '8 min',
  },
  {
    slug: 'dpdp-act-llm-compliance',
    title: 'DPDP Act Compliance for LLM Applications',
    excerpt: 'What developers need to know about India\'s data protection law and how it applies to AI.',
    date: 'May 15, 2026',
    readTime: '7 min',
  },
];

export const metadata = {
  title: 'Blog — ShieldAI',
  description: 'Guides, tutorials, and insights on LLM security and prompt injection detection.',
};

export default function BlogPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-shield-900 to-shield-700 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="mt-3 text-shield-100">Guides, tutorials, and insights on LLM security.</p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-8">
          {POSTS.map((post) => (
            <article key={post.slug} className="rounded-xl border p-6 transition hover:border-shield-500 hover:shadow-md">
              <div className="text-xs text-gray-400">{post.date} · {post.readTime} read</div>
              <h2 className="mt-2 text-xl font-bold">
                <a href={`/blog/${post.slug}`} className="hover:text-shield-600">{post.title}</a>
              </h2>
              <p className="mt-2 text-gray-600">{post.excerpt}</p>
              <a href={`/blog/${post.slug}`} className="mt-3 inline-block text-sm font-medium text-shield-600 hover:underline">
                Read more →
              </a>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
