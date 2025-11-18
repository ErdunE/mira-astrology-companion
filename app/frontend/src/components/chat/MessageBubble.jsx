import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock } from 'lucide-react';
import { toast } from "sonner";

const FunctionDisplay = ({ toolCall, compact }) => {
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
    pending: { icon: Clock, color: 'text-amber-300', text: 'Pending' },
    running: { icon: Loader2, color: 'text-blue-300', text: 'Running...', spin: true },
    in_progress: { icon: Loader2, color: 'text-blue-300', text: 'Running...', spin: true },
    completed: isError ? 
      { icon: AlertCircle, color: 'text-red-400', text: 'Failed' } : 
      { icon: CheckCircle2, color: 'text-green-400', text: 'Success' },
    success: { icon: CheckCircle2, color: 'text-green-400', text: 'Success' },
    failed: { icon: AlertCircle, color: 'text-red-400', text: 'Failed' },
    error: { icon: AlertCircle, color: 'text-red-400', text: 'Failed' }
  }[status] || { icon: Zap, color: 'text-purple-300', text: '' };
  
  const Icon = statusConfig.icon;
  const formattedName = name.split('.').reverse().join(' ').toLowerCase();
  
  return (
    <div className="mt-1.5 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border backdrop-blur-md transition-all ${
          expanded ? "bg-white/20 border-white/40" : "bg-white/10 border-white/30"
        }`}
      >
        <Icon className={`h-2.5 w-2.5 ${statusConfig.color} ${statusConfig.spin ? "animate-spin" : ""}`} />
        <span className="text-white/90 text-xs">{formattedName}</span>
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={`h-2.5 w-2.5 text-white/50 transition-transform ${
            expanded ? "rotate-90" : ""
          }`} />
        )}
      </button>
      
      {expanded && !statusConfig.spin && (
        <div className="mt-1 ml-2 pl-2 border-l border-white/20 space-y-1">
          {toolCall.arguments_string && (
            <div>
              <div className="text-xs text-white/60 mb-0.5">Parameters:</div>
              <pre className="bg-white/10 backdrop-blur-md rounded p-1.5 text-xs text-white/70 whitespace-pre-wrap border border-white/20 max-h-20 overflow-auto">
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
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message, compact = false }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} rounded-lg bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 flex items-center justify-center mt-0.5 flex-shrink-0 shadow-lg shadow-blue-500/30`}>
          <div className={`${compact ? 'h-1.5 w-1.5' : 'h-2 w-2'} rounded-full bg-white`} />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "flex flex-col items-end" : ""}`}>
        {message.content && (
          <div className={`rounded-xl backdrop-blur-xl border ${
            compact ? 'px-3 py-2' : 'px-4 py-3'
          } ${
            isUser 
              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30 text-white" 
              : "bg-white/5 border-white/10 text-white"
          }`}>
            {isUser ? (
              <p className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed`}>{message.content}</p>
            ) : (
              <ReactMarkdown 
                className={`${compact ? 'text-xs' : 'text-sm'} prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`}
                components={{
                  code: ({ inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="relative group/code">
                        <pre className="bg-[#0a0e27]/80 backdrop-blur-md text-white rounded-lg p-2 overflow-x-auto my-1 border border-white/10">
                          <code className={className} {...props}>{children}</code>
                        </pre>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover/code:opacity-100 bg-white/10 hover:bg-white/20"
                          onClick={() => {
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                            toast.success('Code copied');
                          }}
                        >
                          <Copy className="h-2.5 w-2.5 text-white" />
                        </Button>
                      </div>
                    ) : (
                      <code className="px-1 py-0.5 rounded bg-white/10 text-blue-300 text-xs">
                        {children}
                      </code>
                    );
                  },
                  a: ({ children, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">
                      {children}
                    </a>
                  ),
                  p: ({ children }) => <p className="my-0.5 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-0.5 ml-3 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="my-0.5 ml-3 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  h1: ({ children }) => <h1 className={`${compact ? 'text-sm' : 'text-base'} font-semibold my-1 text-blue-300`}>{children}</h1>,
                  h2: ({ children }) => <h2 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold my-1 text-blue-300`}>{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xs font-semibold my-1 text-blue-300">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-blue-400/50 pl-2 my-1 text-white/80">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        
        {message.tool_calls?.length > 0 && (
          <div className="space-y-1 mt-1">
            {message.tool_calls.map((toolCall, idx) => (
              <FunctionDisplay key={idx} toolCall={toolCall} compact={compact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}