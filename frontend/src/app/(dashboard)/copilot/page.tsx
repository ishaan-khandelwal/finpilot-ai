"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { copilotService, type ChatMessage } from "@/services/copilotService";
import { cn } from "@/lib/utils";
import { Bot, Send, Sparkles, User, Lightbulb } from "lucide-react";
import { format } from "date-fns";

const STARTER_QUESTIONS = [
  "What is my net profit this month?",
  "Which invoices are overdue and by how much?",
  "What are my top expense categories?",
  "How does this month compare to last month?",
  "What is my cash runway at current burn rate?",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        isUser ? "bg-accent/20" : "bg-primary/20"
      )}>
        {isUser
          ? <User className="h-3.5 w-3.5 text-accent" />
          : <Bot className="h-3.5 w-3.5 text-primary" />
        }
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[75%] space-y-1", isUser && "items-end flex flex-col")}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-accent/20 text-foreground"
            : "rounded-tl-sm bg-card border border-border text-foreground"
        )}>
          {/* Render newlines */}
          {message.content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.sources.map((s) => (
              <span key={s} className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                📄 {s}
              </span>
            ))}
          </div>
        )}
        <span className="text-[10px] text-muted-foreground px-1">
          {format(new Date(message.timestamp), "HH:mm")}
        </span>
      </div>
    </div>
  );
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: q,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await copilotService.sendMessage(q, conversationId);
      setConversationId(resp.conversation_id);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: resp.answer,
        timestamp: new Date().toISOString(),
        sources: resp.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an issue answering that. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [conversationId, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <Topbar title="Financial Copilot" description="Ask anything about your business finances" />

      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {messages.length === 0 ? (
              /* Empty state */
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Your AI Finance Analyst</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
                  Ask me anything about your invoices, cash flow, reconciliation status, or financial health.
                  I analyse your actual business data.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 w-full max-w-lg">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="flex items-start gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
                    >
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-foreground">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => <MessageBubble key={i} message={m} />)
            )}

            {loading && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-border bg-card">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border bg-background px-6 py-4">
            <div className="flex items-end gap-3 rounded-xl border border-border bg-card px-4 py-3 focus-within:border-primary/50 transition-colors">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances… (Enter to send, Shift+Enter for newline)"
                className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none overflow-hidden"
                style={{ minHeight: "24px", maxHeight: "120px" }}
              />
              <Button
                id="copilot-send"
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="h-8 w-8 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              AI analyses your actual business data — invoices, transactions, and reconciliation records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
