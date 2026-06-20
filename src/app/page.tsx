"use client";

import { useState } from "react";

const EXAMPLE_EMAILS = [
  {
    label: "Upset customer",
    text: `Hi,

I've been a customer for 3 years and this is absolutely unacceptable. I placed order #48291 two weeks ago and it still hasn't arrived. I've sent 3 emails and called twice — no response.

I need this delivered before Friday for an important event. If I don't hear back today I'm disputing the charge with my bank and leaving a review on every platform I can find.

This is not how you treat loyal customers.

- Sarah Mitchell`,
  },
  {
    label: "Billing question",
    text: `Hello,

I noticed my subscription renewed last week for $149/month, but I thought I was on the $99/month plan we agreed on in November. Could you please clarify what I'm being charged for and whether there's been a price increase?

I'd also like to understand what features are included in each tier before deciding whether to keep the subscription at this rate.

Thanks,
David Chen`,
  },
  {
    label: "Feature request + praise",
    text: `Hi team,

Just wanted to say your platform has saved us SO much time — our team went from spending 6 hours a week on reporting to under 1 hour. Amazing product.

One thing that would make it even better: could you add a way to export reports directly to Google Sheets? Right now we have to download CSV and re-upload, which is a bit clunky.

Also wondering if there's a mobile app in the roadmap?

Keep up the great work!
Priya`,
  },
];

type TriageResult = {
  category: string;
  priority: string;
  sentiment: string;
  summary: string;
  keyIssues: string[];
  suggestedAction: string;
  draftReply: string;
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  neutral: "bg-gray-100 text-gray-800",
  negative: "bg-orange-100 text-orange-800",
  angry: "bg-red-100 text-red-800",
};

const CATEGORY_ICONS: Record<string, string> = {
  billing: "💳",
  support: "🛠️",
  complaint: "⚠️",
  refund: "↩️",
  inquiry: "❓",
  praise: "⭐",
  other: "📧",
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function loadExample(text: string) {
    setEmail(text);
    setResult(null);
    setError("");
  }

  async function copyReply() {
    if (!result) return;
    await navigator.clipboard.writeText(result.draftReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">DC</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900">DigiCube</span>
              <span className="text-slate-400 mx-2">·</span>
              <span className="text-slate-600 text-sm">AI Email Triage</span>
            </div>
          </div>
          <a
            href="https://github.com/shameerthaha/digicube-ai-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View Source
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            AI-Powered Email Triage
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Paste any customer email. Get instant priority classification, key issue extraction, and a professional reply draft — in under 3 seconds.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
              Instant classification
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
              Priority scoring
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full inline-block"></span>
              Draft reply generated
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Customer Email</h2>
                <span className="text-xs text-slate-400">Try an example →</span>
              </div>

              {/* Example pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {EXAMPLE_EMAILS.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => loadExample(ex.text)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-full transition-colors cursor-pointer"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <textarea
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Paste a customer email here..."
                  className="w-full h-64 p-4 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full mt-4 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      Triage Email
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div>
            {!result && !loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <div className="text-5xl mb-3">📬</div>
                  <p className="font-medium text-slate-500">Results appear here</p>
                  <p className="text-sm mt-1">Paste an email or try an example</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Analyzing with Claude AI...</p>
                  <p className="text-sm text-slate-400 mt-1">Usually takes 2–4 seconds</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Priority + Category + Sentiment badges */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wide ${PRIORITY_COLORS[result.priority]}`}
                    >
                      {result.priority} priority
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      {CATEGORY_ICONS[result.category]} {result.category}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${SENTIMENT_COLORS[result.sentiment]}`}
                    >
                      {result.sentiment}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium">{result.summary}</p>
                </div>

                {/* Key Issues */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Key Issues
                  </h3>
                  <ul className="space-y-2">
                    {result.keyIssues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Action */}
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                  <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
                    Suggested Action
                  </h3>
                  <p className="text-sm text-amber-900">{result.suggestedAction}</p>
                </div>

                {/* Draft Reply */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Draft Reply
                    </h3>
                    <button
                      onClick={copyReply}
                      className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 rounded-lg p-4">
                    {result.draftReply}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer pitch */}
        <div className="mt-16 text-center border-t border-slate-200 pt-10">
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            This is a live demo by{" "}
            <a href="https://digicube.ai" className="text-blue-600 hover:underline font-medium">
              DigiCube
            </a>
            . We build AI automation systems like this for your business — custom-built, deployed in days, not months.
          </p>
          <a
            href="mailto:hello@digicube.ai"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Talk to us about your use case →
          </a>
        </div>
      </div>
    </main>
  );
}
