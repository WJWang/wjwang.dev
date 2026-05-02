import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface CodeBlockProps {
  language: string;
  children: string;
  filename?: string;
  highlightLines?: number[];
}

export function CodeBlock({ language, children, filename, highlightLines }: CodeBlockProps) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-border bg-card">
      {filename && (
        <div className="px-4 py-2 border-b border-border bg-secondary text-sm text-muted-foreground font-mono">
          {filename}
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.875rem' }}
        wrapLines={highlightLines && highlightLines.length > 0}
        lineProps={(lineNumber: number) =>
          highlightLines?.includes(lineNumber)
            ? { style: { background: 'rgba(0,255,136,0.08)', display: 'block' } }
            : { style: { display: 'block' } }
        }
        showLineNumbers={false}
      >
        {children.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}
