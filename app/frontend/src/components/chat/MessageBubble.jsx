import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Fix malformed inline markdown tables by inserting proper newlines
 * Handles cases where LLM outputs tables all on one line like:
 * "| Header | Header | |---|---| | Cell | Cell | | Cell | Cell |"
 * 
 * Converts to properly formatted:
 * | Header | Header |
 * |---|---|
 * | Cell | Cell |
 * | Cell | Cell |
 */
function fixMalformedTables(text) {
  if (!text) return '';
  
  let result = text;
  
  // Step 1: Add newline before separator rows (|---|---|)
  // Matches: "| content | |---" and adds newline before the separator
  result = result.replace(/\|\s*(\|[-:]+[-:\s|]+\|)/g, '|\n$1');
  
  // Step 2: Add newline after separator rows  
  // Matches: "---|---| |" (separator followed by content) and adds newline
  result = result.replace(/([-:]+\|)\s*\|\s*(?=[A-Za-z0-9])/g, '$1\n| ');
  
  // Step 3: Fix row boundaries - when we have "| content | | content" (end of row, start of new row)
  // This catches: "stretch. | | Feeling" pattern
  result = result.replace(/\|\s*\|\s*(?=[A-Za-z])/g, '|\n| ');
  
  return result;
}

/**
 * Filter AI response to remove reasoning/thinking tags and only show user-facing content
 * Handles patterns like <reasoning>...</reasoning> or <thinking>...</thinking>
 */
function filterAIResponse(response) {
  if (!response) return '';
  
  let filtered = response;
  
  // Remove <reasoning>...</reasoning> blocks
  filtered = filtered.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');
  
  // Remove <thinking>...</thinking> blocks
  filtered = filtered.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
  
  // Remove any orphaned opening/closing tags
  filtered = filtered.replace(/<\/?reasoning>/gi, '');
  filtered = filtered.replace(/<\/?thinking>/gi, '');
  
  // Remove <answer> tags but keep content
  filtered = filtered.replace(/<answer>/gi, '');
  filtered = filtered.replace(/<\/answer>/gi, '');
  
  // Fix malformed inline tables
  filtered = fixMalformedTables(filtered);
  
  // Clean up excessive whitespace
  filtered = filtered.replace(/\n{3,}/g, '\n\n');
  
  return filtered.trim();
}

/**
 * Single message bubble component - handles both user and AI messages
 * Backend returns messages in format: { user_message, ai_response, chart_url?, timestamp }
 */
export default function MessageBubble({ message, isPending = false }) {
  // Handle the backend's message format where each entry contains both user and AI message
  const { user_message, ai_response, chart_url, timestamp, created_at } = message;
  
  // Filter AI response to remove internal reasoning
  const filteredResponse = filterAIResponse(ai_response);
  
  return (
    <div className="space-y-4">
      {/* User message */}
      {user_message && (
        <div className="flex gap-3 justify-end">
          <div className="max-w-[85%] flex flex-col items-end">
            <div className="rounded-2xl px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{user_message}</p>
            </div>
            {created_at && (
              <span className="text-xs text-purple-300/40 mt-1">
                {new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* AI response */}
      {(filteredResponse || isPending) && (
        <div className="flex gap-3 justify-start">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mt-0.5 flex-shrink-0">
            <span className="text-white text-sm font-semibold">M</span>
          </div>
          <div className="max-w-[85%]">
            {isPending ? (
              <div className="bg-white/10 backdrop-blur-sm border border-purple-400/30 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-purple-200 text-sm">Sending...</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl px-4 py-3 bg-white/10 backdrop-blur-sm border border-purple-400/30 text-purple-50">
                <ReactMarkdown
                  className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                    h1: ({ children }) => <h1 className="text-lg font-semibold my-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold my-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold my-2">{children}</h3>,
                    strong: ({ children }) => <strong className="font-semibold text-purple-100">{children}</strong>,
                    em: ({ children }) => <em className="italic text-purple-200">{children}</em>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-purple-400/50 pl-3 my-2 italic text-purple-200/80">
                        {children}
                      </blockquote>
                    ),
                    code: ({ inline, children }) =>
                      inline ? (
                        <code className="px-1 py-0.5 rounded bg-purple-500/20 text-purple-200 text-xs">{children}</code>
                      ) : (
                        <code className="block bg-purple-500/20 rounded p-2 text-xs text-purple-200 my-2 overflow-x-auto">{children}</code>
                      ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-300 hover:text-purple-200 underline"
                      >
                        {children}
                      </a>
                    ),
                    // Table components for GFM table support
                    table: ({ children }) => (
                      <div className="my-3 overflow-x-auto rounded-lg border border-purple-400/30">
                        <table className="w-full text-left text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-purple-500/20 text-purple-100 font-semibold">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-purple-400/20">
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-purple-500/10 transition-colors">
                        {children}
                      </tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-purple-100 font-semibold border-b border-purple-400/30">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-purple-50">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {filteredResponse}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
