import type { ReactNode } from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';

export type CalloutVariant = 'info' | 'warn' | 'success' | 'danger' | 'tip';

export interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const STYLE: Record<CalloutVariant, { ring: string; icon: typeof Info; iconColor: string }> = {
  info:    { ring: 'border-l-blue-500',    icon: Info,          iconColor: 'text-blue-500' },
  warn:    { ring: 'border-l-yellow-500',  icon: AlertTriangle, iconColor: 'text-yellow-500' },
  success: { ring: 'border-l-primary',     icon: CheckCircle2,  iconColor: 'text-primary' },
  danger:  { ring: 'border-l-destructive', icon: XCircle,       iconColor: 'text-destructive' },
  tip:     { ring: 'border-l-accent',      icon: Lightbulb,     iconColor: 'text-accent' },
};

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const s = STYLE[variant];
  const Icon = s.icon;
  return (
    <aside
      className={cn(
        'my-6 p-4 rounded-md border border-border bg-card',
        'border-l-4',
        s.ring,
      )}
      role="note"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', s.iconColor)} aria-hidden />
        <div className="flex-1">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-foreground/90">{children}</div>
        </div>
      </div>
    </aside>
  );
}
