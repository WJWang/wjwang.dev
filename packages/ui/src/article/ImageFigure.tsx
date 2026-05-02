import { cn } from '../lib/utils';

export interface ImageFigureProps {
  src: string;
  alt?: string;
  caption?: string;
  ratio?: '16/9' | '4/3' | '1/1' | string;
}

export function ImageFigure({ src, alt = '', caption, ratio }: ImageFigureProps) {
  const style = ratio ? { aspectRatio: ratio } : undefined;
  return (
    <figure className="my-6">
      <div
        className={cn('overflow-hidden rounded-lg border border-border bg-card', ratio && 'w-full')}
        style={style}
      >
        <img
          src={src}
          alt={alt}
          className={cn('w-full h-auto block', ratio && 'h-full object-cover')}
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}
