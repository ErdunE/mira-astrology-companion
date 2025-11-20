import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Function';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;

  const parsedResults = (() => {
    if (!results) return null;
    try {
      return typeof results === 'string' ? JSON.parse(results) : results;
    } catch {
      return results;
    }
  })();

  const isError = results && (
    (typeof results === 'string' && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );

  const statusConfig = {
    pending: { icon: Clock, color: 'text-purple-400', text: 'Pending' },
    running: { icon: Loader2, color: 'text-purple-400', text: 'Running...', spin: true },
    in_progress: { icon: Loader2, color: 'text-purple-400', text: 'Running...', spin: true },
    completed: isError
      ? { icon: AlertCircle, color: 'text-red-400', text: 'Failed' }
      : { icon: CheckCircle2, color: 'text-green-400', text: 'Success' },
    success: { icon: CheckCircle2, color: 'text-green-400', text: 'Success' },
    failed: { icon: AlertCircle, color: 'text-red-400', text: 'Failed' },
    error: { icon: AlertCircle, color: 'text-red-400', text: 'Failed' }
  }[status] || { icon: Clock, color: 'text-purple-400', text: '' };

  const Icon = statusConfig.icon;
  const formattedName = name.split('.').reverse().join(' ').toLowerCase();

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all',
          'hover:bg-purple-500/20',
          expanded ? 'bg-purple-500/20 border-purple-400/40' : 'bg-purple-500/10 border-purple-400/30'
        )}
      >
        <Icon className={cn('h-3 w-3', statusConfig.color, statusConfig.spin && 'animate-spin')} />
        <span className="text-purple-200">{formattedName}</span>
        {statusConfig.text && (
          <span className={cn('text-purple-300', isError && 'text-red-400')}>
            • {statusConfig.text}
          </span>
        )}
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={cn('h-3 w-3 text-purple-400 transition-transform ml-auto', expanded && 'rotate-90')} />
        )}
      </button>

      {expanded && !statusConfig.spin && (
        <div className="mt-1.5 ml-3 pl-3 border-l-2 border-purple-400/30 space-y-2">
          {toolCall.arguments_string && (
            <div>
              <div className="text-xs text-purple-300 mb-1">Parameters:</div>
              <pre className="bg-purple-500/10 rounded-md p-2 text-xs text-purple-200 whitespace-pre-wrap">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                  } catch {
                    return toolCall.arguments_string;
                  }
                })()}
              </pre>
            </div>
          )}
          {parsedResults && (
            <div>
              <div className="text-xs text-purple-300 mb-1">Result:</div>
              <pre className="bg-purple-500/10 rounded-md p-2 text-xs text-purple-200 whitespace-pre-wrap max-h-48 overflow-auto">
                {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : parsedResults}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mt-0.5 flex-shrink-0">
          <span className="text-white text-sm font-semibold">M</span>
        </div>
      )}
      <div className={cn('max-w-[85%]', isUser && 'flex flex-col items-end')}>
        {message.content && (
          <div
            className={cn(
              'rounded-2xl px-4 py-3',
              isUser
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                : 'bg-white/10 backdrop-blur-sm border border-purple-400/30 text-purple-50'
            )}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  h1: ({ children }) => <h1 className="text-lg font-semibold my-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold my-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold my-2">{children}</h3>,
                  strong: ({ children }) => <strong className="font-semibold text-purple-100">{children}</strong>,
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="px-1 py-0.5 rounded bg-purple-500/20 text-purple-200 text-xs">{children}</code>
                    ) : (
                      <code className="block bg-purple-500/20 rounded p-2 text-xs text-purple-200 my-2">{children}</code>
                    )
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}

        {message.tool_calls?.length > 0 && (
          <div className="space-y-1 mt-2">
            {message.tool_calls.map((toolCall, idx) => (
              <FunctionDisplay key={idx} toolCall={toolCall} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}