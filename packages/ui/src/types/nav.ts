// packages/ui/src/types/nav.ts
export interface NavItem {
  label: string;
  href: string;
}

export type SocialKind = 'github' | 'linkedin' | 'medium' | 'mail';

export interface SocialLink {
  kind: SocialKind;
  href: string;
}
