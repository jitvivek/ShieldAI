import Footer from '@/components/Footer';

// In a real app, this would fetch from a CMS or MDX files
const POSTS: Record<string, { title: string; content: string }> = {
  'what-is-prompt-injection': {
    title: 'What Is Prompt Injection? A Complete Guide for Developers',
    content: 'Full blog content would be loaded from MDX files or a CMS in production.',
  },
};

export function generateStaticParams() {
  return [
    { slug: 'what-is-prompt-injection' },
    { slug: 'prompt-injection-hindi-hinglish' },
    { slug: 'prevent-injection-langchain' },
    { slug: 'owasp-top10-llm-india' },
    { slug: 'dpdp-act-llm-compliance' },
  ];
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug];

  return (
    <main>
      <section className="bg-gradient-to-br from-shield-900 to-shield-700 py-16 text-center text-white">
        <h1 className="text-3xl font-bold">{post?.title ?? slug.replace(/-/g, ' ')}</h1>
      </section>
      <article className="prose mx-auto max-w-3xl px-6 py-16">
        <p className="text-gray-600">
          {post?.content ?? 'Blog post content is loaded from marketing/blog-posts/ markdown files in production.'}
        </p>
        <div className="mt-8 rounded-xl bg-shield-50 p-6">
          <h3 className="font-bold text-shield-800">Try ShieldAI</h3>
          <p className="mt-2 text-sm text-gray-600">
            Paste any prompt at <a href="https://shieldai.dev" className="text-shield-600 underline">shieldai.dev</a> to
            see real-time detection — no login required.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
