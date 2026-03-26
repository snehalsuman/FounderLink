import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket, TrendingUp, Users, Shield, ArrowRight,
  CheckCircle, Zap, Globe, MessageSquare, BarChart2,
  Star, ChevronRight, Lock, Bell, Search
} from 'lucide-react';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 overflow-x-hidden">

      {/* ───────────────── NAVBAR ───────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-900/90 backdrop-blur-xl border-b border-dark-500 shadow-lg' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
              <span className="text-white font-bold text-sm">FL</span>
            </div>
            <span className="text-xl font-bold text-white">FounderLink</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How it works</a>
            <a href="#roles" className="text-sm text-gray-400 hover:text-white transition-colors">For you</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-dark-700">
              Log in
            </Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-1.5 rounded-lg">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-800/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-8">
              <Zap size={12} className="text-accent-light" />
              <span className="text-xs font-medium text-accent-light">The #1 platform for startup founders</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              Connect.<br />
              Build. <span className="text-accent-light">Scale.</span><br />
              <span className="text-gray-500">Together.</span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-lg">
              FounderLink bridges the gap between ambitious founders, strategic investors, and talented co-founders — all in one powerful platform.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/register" className="btn-primary text-base px-7 py-3.5 flex items-center gap-2 rounded-xl">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-7 py-3.5 rounded-xl">
                Sign In
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[
                  { bg: 'bg-purple-500', letter: 'S' },
                  { bg: 'bg-blue-500',   letter: 'J' },
                  { bg: 'bg-green-500',  letter: 'A' },
                  { bg: 'bg-yellow-500', letter: 'M' },
                ].map((a, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${a.bg} border-2 border-dark-900 flex items-center justify-center text-xs font-bold text-white`}>
                    {a.letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Trusted by 2,400+ founders worldwide</p>
              </div>
            </div>
          </div>

          {/* Right — App preview mockup */}
          <div className="relative hidden lg:flex justify-end">
            <div className="relative w-full max-w-[420px]">
              {/* Glow */}
              <div className="absolute inset-0 bg-accent/10 blur-2xl rounded-3xl scale-110" />

              {/* Browser chrome mockup */}
              <div className="relative bg-dark-800 rounded-2xl border border-dark-500 shadow-2xl shadow-black/40 overflow-hidden">
                {/* Title bar */}
                <div className="bg-dark-700 px-4 py-3 border-b border-dark-500 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 bg-dark-600 rounded-md h-5 flex items-center px-3">
                    <span className="text-gray-500 text-xs">app.founderlink.io/dashboard</span>
                  </div>
                </div>

                {/* Dashboard */}
                <div className="p-5 space-y-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">Welcome back, Sarah!</p>
                      <p className="text-gray-500 text-xs">Your portfolio · 3 active startups</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center">
                        <Bell size={13} className="text-gray-400" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">S</div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Connections', value: '24', color: 'text-accent-light' },
                      { label: 'Investors',   value: '8',  color: 'text-green-400' },
                      { label: 'Funding',     value: '$2.4M', color: 'text-yellow-400' },
                    ].map((s) => (
                      <div key={s.label} className="bg-dark-700 rounded-lg p-2.5 border border-dark-500">
                        <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Startup cards */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Startups</p>
                    <div className="space-y-2">
                      {[
                        { name: 'TechFlow AI',  stage: 'Series A', pct: 82, color: 'bg-accent' },
                        { name: 'GreenMint',    stage: 'Seed',     pct: 42, color: 'bg-green-500' },
                      ].map((s) => (
                        <div key={s.name} className="bg-dark-700 rounded-lg p-3 border border-dark-500">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-white text-xs font-medium">{s.name}</span>
                            <span className="text-gray-500 text-xs">{s.stage}</span>
                          </div>
                          <div className="w-full h-1.5 bg-dark-500 rounded-full overflow-hidden">
                            <div className={`h-1.5 ${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-600 text-xs">Funding progress</span>
                            <span className="text-gray-400 text-xs font-medium">{s.pct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Activity</p>
                    <div className="space-y-2">
                      {[
                        { msg: 'New investor interest in TechFlow AI', time: '2m',  dot: 'bg-green-400' },
                        { msg: 'Team invite accepted by Alex Chen',    time: '1h',  dot: 'bg-accent-light' },
                      ].map((a) => (
                        <div key={a.msg} className="flex items-start gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${a.dot} mt-1.5 shrink-0`} />
                          <p className="text-gray-400 text-xs flex-1">{a.msg}</p>
                          <span className="text-gray-600 text-xs shrink-0">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge — top right */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs rounded-full px-3 py-1.5 shadow-xl font-medium flex items-center gap-1.5 animate-bounce">
                <span>🎉</span> New investor!
              </div>

              {/* Floating badge — bottom left */}
              <div className="absolute -bottom-4 -left-4 bg-dark-700 border border-dark-400 rounded-xl px-3 py-2.5 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">R</div>
                  <div>
                    <p className="font-semibold text-xs text-white">Rahul S. joined</p>
                    <p className="text-gray-500 text-xs">Co-Founder · just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── STATS BAR ───────────────── */}
      <section className="border-y border-dark-500 bg-dark-800/50 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2,400+', label: 'Founders',      icon: <Rocket size={18} className="text-accent-light" /> },
            { value: '800+',   label: 'Investors',     icon: <TrendingUp size={18} className="text-green-400" /> },
            { value: '340+',   label: 'Deals Closed',  icon: <BarChart2 size={18} className="text-yellow-400" /> },
            { value: '1,200+', label: 'Team Members',  icon: <Users size={18} className="text-purple-400" /> },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {s.icon}
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── TEAM PHOTO SECTION ───────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
              alt="Startup team collaborating"
              className="relative w-full rounded-2xl border border-dark-500 shadow-2xl object-cover h-80"
            />
            {/* Overlay badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-dark-900/80 backdrop-blur-md border border-dark-400 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Rocket size={18} className="text-accent-light" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">"Raised $1.2M in 3 weeks"</p>
                  <p className="text-gray-400 text-xs">Priya Sharma, Founder of NexaBot</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-yellow-400" fill="currentColor" />)}
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-6">
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-xs font-medium text-green-400">Built for real founders</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-5">Where great startups find their team and funding</h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              FounderLink is built by founders, for founders. We understand what it takes to build a company from scratch — and we've designed every feature to remove friction from the hardest parts of the journey.
            </p>
            <div className="space-y-4">
              {[
                { icon: <Users size={16} />, color: 'text-accent-light', bg: 'bg-accent/10', text: 'A curated network of verified founders, investors & co-founders' },
                { icon: <Shield size={16} />, color: 'text-green-400', bg: 'bg-green-500/10', text: 'Admin-reviewed startup listings — quality over quantity' },
                { icon: <MessageSquare size={16} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', text: 'Real-time messaging and notifications built in' },
                { icon: <BarChart2 size={16} />, color: 'text-purple-400', bg: 'bg-purple-500/10', text: 'Track your funding progress and investor pipeline' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0 ${item.color}`}>
                    {item.icon}
                  </div>
                  <p className="text-gray-300 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section id="features" className="py-24 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-4">
              <Zap size={12} className="text-accent-light" />
              <span className="text-xs font-medium text-accent-light">Platform Features</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to succeed</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              From discovery to deal closure, FounderLink gives you the tools to build meaningful connections and grow your startup.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageSquare size={22} />,
                color: 'text-accent-light',
                bg: 'bg-accent/10 border-accent/20',
                hoverBorder: 'hover:border-accent/50',
                title: 'Real-time Messaging',
                desc: 'Connect directly with investors and co-founders through our secure messaging system. Build relationships that close deals.',
                features: ['Instant notifications', 'Conversation threads', 'Notification badges'],
              },
              {
                icon: <Search size={22} />,
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10 border-yellow-500/20',
                hoverBorder: 'hover:border-yellow-500/50',
                title: 'Smart Discovery',
                desc: 'Advanced filters to find the right startups, investors, and co-founders. Filter by industry, stage, location, and funding range.',
                features: ['Stage-based filters', 'Industry categories', 'Funding range sliders'],
              },
              {
                icon: <Lock size={22} />,
                color: 'text-green-400',
                bg: 'bg-green-500/10 border-green-500/20',
                hoverBorder: 'hover:border-green-500/50',
                title: 'Secure & Verified',
                desc: 'Admin-reviewed listings and role-based access control ensure you only interact with verified, legitimate users.',
                features: ['Admin approval flow', 'JWT authentication', 'Role-based access'],
              },
            ].map((f) => (
              <div key={f.title} className={`bg-dark-800 rounded-2xl border border-dark-500 ${f.hoverBorder} p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group`}>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${f.bg} ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{f.desc}</p>
                <ul className="space-y-2">
                  {f.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle size={13} className={f.color} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How FounderLink works</h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm">Get from zero to funded in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px bg-gradient-to-r from-accent/40 via-dark-400 to-accent/40" />

            {[
              {
                step: '01',
                icon: <Users size={22} />,
                color: 'text-accent-light',
                glow: 'shadow-accent/25',
                bg: 'bg-accent/10 border-accent/30',
                title: 'Create your profile',
                desc: 'Sign up in minutes. Choose your role — founder, investor, or co-founder — and tell your story.',
              },
              {
                step: '02',
                icon: <Globe size={22} />,
                color: 'text-green-400',
                glow: 'shadow-green-500/20',
                bg: 'bg-green-500/10 border-green-500/30',
                title: 'Discover & connect',
                desc: 'Browse verified startups and investors. Send messages, follow startups, and grow your network.',
              },
              {
                step: '03',
                icon: <BarChart2 size={22} />,
                color: 'text-yellow-400',
                glow: 'shadow-yellow-500/20',
                bg: 'bg-yellow-500/10 border-yellow-500/30',
                title: 'Close deals & grow',
                desc: 'Track investment interest, manage your team, and close funding rounds — all within the platform.',
              },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className={`w-20 h-20 rounded-2xl border ${step.bg} flex items-center justify-center mx-auto mb-5 shadow-xl ${step.glow}`}>
                  <span className={step.color}>{step.icon}</span>
                </div>
                <div className={`text-xs font-bold ${step.color} mb-2 tracking-widest`}>STEP {step.step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── ROLES ───────────────── */}
      <section id="roles" className="py-24 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Built for everyone in the ecosystem</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">Whether you're building, funding, or joining — FounderLink has a place for you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: 'Founder',
                icon: <Rocket size={28} />,
                color: 'text-accent-light',
                bg: 'bg-accent/10',
                border: 'border-accent/20 hover:border-accent/60',
                gradient: 'from-accent/15 to-transparent',
                tagline: 'Launch your vision',
                desc: 'Create your startup profile, attract investors, build your team, and manage everything from one powerful dashboard.',
                perks: ['Startup profile & listing', 'Investor discovery', 'Team management', 'Real-time messaging'],
                cta: 'Start as Founder',
              },
              {
                role: 'Investor',
                icon: <TrendingUp size={28} />,
                color: 'text-green-400',
                bg: 'bg-green-500/10',
                border: 'border-green-500/20 hover:border-green-500/60',
                gradient: 'from-green-500/15 to-transparent',
                tagline: 'Discover opportunities',
                desc: 'Browse curated, admin-approved startups. Filter by stage, industry, and funding needs. Follow the ones that match your thesis.',
                perks: ['Curated startup feed', 'Stage & industry filters', 'Follow & track startups', 'Direct founder messaging'],
                cta: 'Join as Investor',
              },
              {
                role: 'Co-Founder',
                icon: <Users size={28} />,
                color: 'text-yellow-400',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/20 hover:border-yellow-500/60',
                gradient: 'from-yellow-500/15 to-transparent',
                tagline: 'Find your team',
                desc: 'Join innovative startups, bring your skills to the table, and grow alongside visionary founders who need your expertise.',
                perks: ['Browse open positions', 'Skills-based matching', 'Startup team access', 'Co-manage startups'],
                cta: 'Join as Co-Founder',
              },
            ].map((r) => (
              <div key={r.role} className={`relative bg-dark-800 rounded-2xl border ${r.border} p-7 overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl`}>
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${r.gradient} pointer-events-none`} />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl ${r.bg} flex items-center justify-center mb-5 ${r.color}`}>
                    {r.icon}
                  </div>
                  <div className={`text-xs font-bold ${r.color} mb-1 uppercase tracking-wider`}>{r.role}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{r.tagline}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{r.desc}</p>
                  <ul className="space-y-2 mb-7">
                    {r.perks.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-gray-500">
                        <ChevronRight size={13} className={r.color} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className={`inline-flex items-center gap-2 text-sm font-medium ${r.color} hover:opacity-75 transition-opacity`}>
                    {r.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CTA BANNER ───────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-accent/25 via-dark-700 to-purple-900/20 rounded-3xl border border-accent/30 p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-purple-700/15 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-accent/20">
                <Rocket size={28} className="text-accent-light" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Ready to launch your startup?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of founders, investors, and co-founders already building the future on FounderLink.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/register" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 rounded-xl">
                  Create your free account <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3.5 rounded-xl">
                  Sign In
                </Link>
              </div>
              <p className="text-gray-600 text-sm mt-5">No credit card required · Free to join</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="border-t border-dark-500 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-md shadow-accent/30">
              <span className="text-white font-bold text-xs">FL</span>
            </div>
            <span className="text-white font-semibold">FounderLink</span>
          </div>
          <p className="text-gray-600 text-sm">© 2025 FounderLink. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#features"    className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">How it works</a>
            <Link to="/login"       className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
