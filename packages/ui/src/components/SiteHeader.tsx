'use client';

import { useState, type ReactNode } from 'react';
import { Github, Linkedin, Mail, Menu, X, BookOpen } from 'lucide-react';
import type { NavItem, SocialLink, SocialKind } from '../types/nav';
import { cn } from '../lib/utils';

const SOCIAL_ICON: Record<SocialKind, typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  medium: BookOpen,
  mail: Mail,
};

const SOCIAL_LABEL: Record<SocialKind, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  medium: 'Medium Blog',
  mail: 'Email',
};

export interface SiteHeaderProps {
  nav: NavItem[];
  socials: SocialLink[];
  searchSlot?: ReactNode;
  avatarSrc?: string;
  brand?: string;
}

export function SiteHeader({
  nav,
  socials,
  searchSlot,
  avatarSrc = '/avatar.jpg',
  brand = 'WJWang',
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={avatarSrc} alt={brand} className="w-10 h-10 rounded-full ring-2 ring-primary/20" />
            <span className="font-semibold text-lg">{brand}</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {searchSlot}
            {socials.map((s) => {
              const Icon = SOCIAL_ICON[s.kind];
              return (
                <a
                  key={s.kind + s.href}
                  href={s.href}
                  target={s.kind === 'mail' ? undefined : '_blank'}
                  rel={s.kind === 'mail' ? undefined : 'noopener noreferrer'}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={SOCIAL_LABEL[s.kind]}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          <div className="md:hidden flex items-center gap-1">
            {searchSlot}
            <button
              onClick={() => setOpen((v) => !v)}
              className="p-2"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {nav.map((item) => (
                <a key={item.href} href={item.href} className="text-foreground hover:text-primary transition-colors">
                  {item.label}
                </a>
              ))}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                {socials.map((s) => {
                  const Icon = SOCIAL_ICON[s.kind];
                  return (
                    <a
                      key={s.kind + s.href}
                      href={s.href}
                      target={s.kind === 'mail' ? undefined : '_blank'}
                      rel={s.kind === 'mail' ? undefined : 'noopener noreferrer'}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={SOCIAL_LABEL[s.kind]}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
