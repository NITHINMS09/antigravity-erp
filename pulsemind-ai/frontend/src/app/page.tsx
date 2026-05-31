"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Shield, BarChart3, MessageSquare, Zap, Users, ArrowRight, Sparkles, Activity, Globe, ChevronRight, Star, TrendingUp, Bell, Lock, Menu, X } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Insight Engine", desc: "Advanced NLP analyzes every feedback, detects emotions, and generates actionable intelligence in real-time.", color: "from-blue-500 to-cyan-500" },
  { icon: Shield, title: "Anonymous Reporting", desc: "Encrypted identity masking lets employees safely report issues while still receiving updates.", color: "from-purple-500 to-pink-500" },
  { icon: BarChart3, title: "Predictive Analytics", desc: "Predict burnout, resignation risk, and organizational trends before they become critical.", color: "from-emerald-500 to-teal-500" },
  { icon: Activity, title: "Burnout Detection", desc: "AI monitors stress patterns and predicts employee burnout with actionable wellness recommendations.", color: "from-orange-500 to-red-500" },
  { icon: MessageSquare, title: "Smart Resolution", desc: "AI-first complaint resolution with automatic routing, escalation, and progress tracking.", color: "from-pink-500 to-rose-500" },
  { icon: Globe, title: "Multilingual Support", desc: "Submit feedback in English, Hindi, Kannada, Tamil, Telugu, or Malayalam with auto-translation.", color: "from-indigo-500 to-violet-500" },
];

const stats = [
  { value: "98%", label: "Employee Satisfaction", icon: Star },
  { value: "3x", label: "Faster Resolution", icon: Zap },
  { value: "85%", label: "Burnout Prevented", icon: TrendingUp },
  { value: "24/7", label: "AI Monitoring", icon: Bell },
];

const pricingPlans = [
  { name: "Starter", price: "$29", period: "/user/mo", features: ["Up to 50 employees", "Basic feedback forms", "Sentiment analysis", "Email notifications", "Dashboard analytics"], popular: false },
  { name: "Professional", price: "$79", period: "/user/mo", features: ["Up to 500 employees", "All AI engines", "Burnout prediction", "Anonymous reporting", "Real-time alerts", "Department analytics", "API access"], popular: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited employees", "Custom AI models", "Dedicated support", "SLA guarantee", "SSO integration", "Audit logs", "On-premise option", "White labeling"], popular: false },
];

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/5" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">PulseMind AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</a>
            <a href="#about" className="text-gray-400 hover:text-white transition">About</a>
            <Link href="/login" className="text-gray-400 hover:text-white transition">Login</Link>
            <Link href="/register" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
          <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-[#0a0a1a]/95 backdrop-blur-xl border-t border-white/5 overflow-hidden">
              <div className="px-6 py-4 flex flex-col gap-4">
                <a href="#features" className="text-gray-300 py-2">Features</a>
                <a href="#pricing" className="text-gray-300 py-2">Pricing</a>
                <Link href="/login" className="text-gray-300 py-2">Login</Link>
                <Link href="/register" className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-center">Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI-Powered Organizational Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Employee
              <span className="block gradient-text">Feedback Into Action</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              PulseMind AI uses advanced artificial intelligence to analyze employee feedback, predict burnout, detect toxicity, and generate actionable insights for a healthier organization.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2">
                Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="px-8 py-4 rounded-xl border border-white/10 text-white font-semibold text-lg hover:bg-white/5 transition-all duration-300">
                See Features
              </a>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-20 relative">
            <div className="glass-card p-1 rounded-2xl neon-glow">
              <div className="bg-[#0d0d24] rounded-xl p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.1 }} className="stat-card p-4 text-center">
                      <stat.icon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                      <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-4 col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">Organizational Health Score</span>
                      <span className="text-xs text-emerald-400">+12% ↑</span>
                    </div>
                    <div className="flex items-end gap-1 h-24">
                      {[40, 55, 45, 60, 75, 65, 80, 70, 85, 78, 90, 88].map((h, i) => (
                        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 1 + i * 0.05, duration: 0.5 }}
                          className="flex-1 rounded-t bg-gradient-to-t from-blue-500/50 to-purple-500/50 min-w-[8px]" />
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-4">
                    <span className="text-sm font-medium text-gray-300">AI Alerts</span>
                    <div className="mt-3 space-y-2">
                      {["🔴 Toxicity detected in Sales", "🟡 Burnout risk rising in Eng", "🟢 Morale improving in Ops"].map((alert, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 + i * 0.15 }}
                          className="text-xs text-gray-400 py-1.5 px-2 rounded bg-white/5">{alert}</motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powered by <span className="gradient-text">Advanced AI</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">20+ AI engines working together to understand your organization&apos;s pulse and drive meaningful improvements.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-8 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple <span className="gradient-text">Pricing</span></h2>
            <p className="text-gray-400 text-lg">Start free, scale as you grow.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className={`glass-card p-8 relative ${plan.popular ? "border-purple-500/50 neon-glow scale-105" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-bold text-white">MOST POPULAR</div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-300 text-sm">
                      <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block text-center px-6 py-3 rounded-xl font-semibold transition-all ${plan.popular ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/25" : "border border-white/10 text-white hover:bg-white/5"}`}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your <span className="gradient-text">Organization?</span></h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">Join thousands of companies using PulseMind AI to build healthier, more productive workplaces.</p>
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all">
                Start Your Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold gradient-text">PulseMind AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Support</a>
          </div>
          <p className="text-sm text-gray-600">© 2025 PulseMind AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
