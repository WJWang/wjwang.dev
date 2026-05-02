export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl mb-4">文章不存在</h2>
        <a
          href="/articles"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          返回文章列表
        </a>
      </div>
    </main>
  );
}
