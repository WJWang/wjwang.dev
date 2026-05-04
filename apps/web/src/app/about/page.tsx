// apps/web/src/app/about/page.tsx
import type { Metadata } from 'next';
import { Github, Linkedin, Mail, BookOpen } from 'lucide-react';
import { Prose } from '@wjwang/ui/article';
import { SITE, SOCIALS } from '@/lib/site-config';

export const metadata: Metadata = {
  title: '關於',
  description: `關於 ${SITE.name}`,
  alternates: { canonical: '/about' },
  // OG image inherited from app/opengraph-image.tsx
};

const ICON = { github: Github, linkedin: Linkedin, medium: BookOpen, mail: Mail };
const LABEL = { github: 'GitHub', linkedin: 'LinkedIn', medium: 'Medium', mail: 'Email' };

export default function AboutPage() {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-6 mb-8">
        <img
          src={SITE.author.avatar}
          alt={SITE.author.name}
          className="w-24 h-24 rounded-full ring-2 ring-primary/30"
        />
        <div>
          <h1 className="text-3xl font-bold">{SITE.author.name}</h1>
          <p className="text-muted-foreground mt-1">{SITE.description}</p>
        </div>
      </div>

      <Prose>
        <p>
          寫過幾篇 paper 之後就再也沒寫過的人、2020 那段時間幫忙寫了一點不重要的 code、教過幾個大學生 K8S（不確定他們有沒有真學會）、永遠的 Hacker News 沉默讀者。
        </p>
        <p>開會專業戶、深夜碼農、什麼端都寫一點的人。</p>
        <p>
          淺度學習工程師、小數據分析師、Full Stuck Engineer、工人智慧研究員、LLM 馴獸師、Agent 代孕經理。
        </p>
      </Prose>

      <div className="mt-8 flex gap-4">
        {SOCIALS.map((s) => {
          const Icon = ICON[s.kind];
          return (
            <a
              key={s.kind}
              href={s.href}
              target={s.kind === 'mail' ? undefined : '_blank'}
              rel={s.kind === 'mail' ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:border-primary transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{LABEL[s.kind]}</span>
            </a>
          );
        })}
      </div>
    </main>
  );
}
