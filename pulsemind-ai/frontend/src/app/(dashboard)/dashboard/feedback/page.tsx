"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Brain, AlertTriangle, Star, Smile, Frown, Meh, Angry, Zap, Shield, Mic, MicOff, Upload, Globe, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { feedbackAPI, analyticsAPI } from "@/lib/api";

const categories = [
  { value: "COMPLAINT", label: "Complaint", icon: "🔴", desc: "Report an issue" },
  { value: "SUGGESTION", label: "Suggestion", icon: "💡", desc: "Share an idea" },
  { value: "SATISFACTION", label: "Satisfaction", icon: "✅", desc: "Share positive experience" },
  { value: "WELLNESS", label: "Wellness", icon: "💚", desc: "Mental health report" },
  { value: "TOXICITY_REPORT", label: "Toxicity Report", icon: "⚠️", desc: "Report toxic behavior" },
  { value: "WORKPLACE_ISSUE", label: "Workplace Issue", icon: "🏢", desc: "Facility/environment" },
  { value: "HR_ISSUE", label: "HR Issue", icon: "👤", desc: "HR-related concern" },
  { value: "TECHNICAL_ISSUE", label: "Technical Issue", icon: "🔧", desc: "Tech/tool problems" },
];

const priorities = [
  { value: "LOW", label: "Low", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "MEDIUM", label: "Medium", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "HIGH", label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: "CRITICAL", label: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const moods = ["😊", "🙂", "😐", "😤", "😫", "😡", "😰", "🤔", "😢"];
const languages = [
  { code: "en", label: "English" }, { code: "hi", label: "Hindi" }, { code: "kn", label: "Kannada" },
  { code: "ta", label: "Tamil" }, { code: "te", label: "Telugu" }, { code: "ml", label: "Malayalam" },
];

export default function FeedbackPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({
    category: "", priority: "MEDIUM", title: "", content: "", isAnonymous: false,
    starRating: 0, moodEmoji: "", stressLevel: 5, satisfactionScore: 50, language: "en",
  });

  const update = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));

  const analyzeText = async () => {
    if (!form.content || form.content.length < 10) return;
    setAnalyzing(true);
    try {
      const { data } = await analyticsAPI.analyze(form.content, form.category);
      setAiAnalysis(data);
    } catch { setAiAnalysis({ sentiment: 0, emotion: "NEUTRAL", urgencyScore: 0.3, keywords: ["General"], suggestions: ["AI analysis unavailable"] }); }
    setAnalyzing(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await feedbackAPI.create(form);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Feedback Submitted!</h2>
          <p className="text-gray-400">AI is analyzing your feedback. You&apos;ll receive insights shortly.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Submit Feedback</h1>
        <p className="text-gray-400">Your voice matters. Share your thoughts and let AI help improve the workplace.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-white/5 text-gray-500"}`}>{s}</div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-purple-500" : "bg-white/10"}`} />}
          </div>
        ))}
        <span className="text-sm text-gray-400 ml-2">{step === 1 ? "Category & Details" : step === 2 ? "Content & Ratings" : "Review & Submit"}</span>
      </div>

      {/* Step 1: Category */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Select Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map(cat => (
                <button key={cat.value} onClick={() => update("category", cat.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${form.category === cat.value ? "border-purple-500/50 bg-purple-500/10" : "border-white/5 bg-white/[0.02] hover:bg-white/5"}`}>
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="text-sm font-medium text-white mt-2">{cat.label}</p>
                  <p className="text-xs text-gray-500">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Priority Level</h3>
            <div className="flex gap-3">
              {priorities.map(p => (
                <button key={p.value} onClick={() => update("priority", p.value)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.priority === p.value ? p.color : "border-white/5 text-gray-400 hover:bg-white/5"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">Anonymous Submission</h3>
              <button onClick={() => update("isAnonymous", !form.isAnonymous)}
                className={`w-12 h-6 rounded-full transition-all ${form.isAnonymous ? "bg-purple-500" : "bg-white/10"}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${form.isAnonymous ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
            {form.isAnonymous && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Shield className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-purple-300">Your identity will be encrypted. You can still receive updates anonymously.</p>
              </div>
            )}
          </div>

          <button onClick={() => step === 1 && form.category && setStep(2)} disabled={!form.category}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-30 transition-all hover:shadow-lg hover:shadow-purple-500/25">
            Continue
          </button>
        </motion.div>
      )}

      {/* Step 2: Content */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Title</label>
              <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Brief summary of your feedback" className="input-glass" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Detailed Feedback</label>
              <textarea value={form.content} onChange={e => update("content", e.target.value)} onBlur={analyzeText} placeholder="Share your experience in detail..."
                className="input-glass min-h-[150px] resize-none" rows={6} />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 text-sm">
                <Upload className="w-4 h-4" /> Attach File
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 text-sm">
                <Mic className="w-4 h-4" /> Voice Note
              </button>
              <select value={form.language} onChange={e => update("language", e.target.value)}
                className="px-3 py-2 rounded-xl border border-white/10 bg-transparent text-gray-400 text-sm outline-none">
                {languages.map(l => <option key={l.code} value={l.code} className="bg-[#0d0d24]">{l.label}</option>)}
              </select>
            </div>
          </div>

          {/* AI Analysis Preview */}
          {(analyzing || aiAnalysis) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-medium text-gray-300">AI Analysis Preview</h3>
                {analyzing && <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />}
              </div>
              {aiAnalysis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500">Sentiment</p>
                    <p className={`text-sm font-bold ${aiAnalysis.sentiment > 0 ? "text-emerald-400" : aiAnalysis.sentiment < 0 ? "text-red-400" : "text-gray-400"}`}>
                      {aiAnalysis.sentiment > 0.3 ? "Positive" : aiAnalysis.sentiment < -0.3 ? "Negative" : "Neutral"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500">Emotion</p>
                    <p className="text-sm font-bold text-purple-400">{aiAnalysis.emotion}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500">Urgency</p>
                    <p className={`text-sm font-bold ${aiAnalysis.urgencyScore > 0.7 ? "text-red-400" : aiAnalysis.urgencyScore > 0.4 ? "text-amber-400" : "text-emerald-400"}`}>
                      {aiAnalysis.urgencyScore > 0.7 ? "High" : aiAnalysis.urgencyScore > 0.4 ? "Medium" : "Low"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500">Keywords</p>
                    <p className="text-sm font-bold text-cyan-400">{aiAnalysis.keywords?.slice(0, 2).join(", ")}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Ratings */}
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Star Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => update("starRating", s)}>
                    <Star className={`w-8 h-8 transition-all ${form.starRating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">How are you feeling?</label>
              <div className="flex gap-2 flex-wrap">
                {moods.map(m => (
                  <button key={m} onClick={() => update("moodEmoji", m)}
                    className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${form.moodEmoji === m ? "bg-purple-500/20 border border-purple-500/50 scale-110" : "bg-white/5 hover:bg-white/10"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Stress Level</label>
                <span className="text-sm font-bold text-white">{form.stressLevel}/10</span>
              </div>
              <input type="range" min={1} max={10} value={form.stressLevel} onChange={e => update("stressLevel", parseInt(e.target.value))}
                className="w-full h-2 rounded-full bg-white/10 appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer" />
              <div className="flex justify-between text-xs text-gray-600 mt-1"><span>Relaxed</span><span>Very Stressed</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition">Back</button>
            <button onClick={() => form.title && form.content && setStep(3)} disabled={!form.title || !form.content}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-30 transition-all hover:shadow-lg">Continue</button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Review Your Feedback</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Category</p><p className="text-sm text-white font-medium">{categories.find(c => c.value === form.category)?.label}</p></div>
              <div><p className="text-xs text-gray-500">Priority</p><p className="text-sm text-white font-medium">{form.priority}</p></div>
              <div><p className="text-xs text-gray-500">Anonymous</p><p className="text-sm text-white font-medium">{form.isAnonymous ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-gray-500">Mood</p><p className="text-sm">{form.moodEmoji || "Not selected"}</p></div>
              <div><p className="text-xs text-gray-500">Stress Level</p><p className="text-sm text-white font-medium">{form.stressLevel}/10</p></div>
              <div><p className="text-xs text-gray-500">Rating</p><p className="text-sm text-yellow-400">{"⭐".repeat(form.starRating)}</p></div>
            </div>
            <div><p className="text-xs text-gray-500 mb-1">Title</p><p className="text-sm text-white">{form.title}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Content</p><p className="text-sm text-gray-300">{form.content}</p></div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition">Back</button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Submit Feedback</>}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
