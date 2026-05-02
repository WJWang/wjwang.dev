import { ArticleCard } from '@wjwang/ui/article';
import { GeometricBackground } from '@wjwang/ui/components';
import { Hero } from '@/components/Hero';
import { Sidebar } from '@/components/Sidebar';
import { articles } from '@/lib/articles';

export default function HomePage() {
  const featured = articles.find((a) => a.featured);
  const latest = articles.filter((a) => !a.featured).slice(0, 6);

  return (
    <>
      <Hero />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <GeometricBackground />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 space-y-8">
            {featured && (
              <section>
                <h2 className="text-2xl mb-6 font-semibold">精選文章</h2>
                <ArticleCard meta={featured} variant="featured" />
              </section>
            )}
            <section>
              <h2 className="text-2xl mb-6 font-semibold">最新文章</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latest.map((a) => (
                  <ArticleCard key={a.slug} meta={a} />
                ))}
              </div>
            </section>
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>
    </>
  );
}
