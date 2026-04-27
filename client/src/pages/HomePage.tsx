import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function HomePage() {
    const prefersReducedMotion = useReducedMotion();
    
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/15 dark:bg-primary/8 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-100px] right-[-200px] w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-100px] left-[-200px] w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
            
            <main className="container mx-auto px-4 py-16 md:py-24 relative z-10">
                <div className="max-w-5xl mx-auto text-center space-y-12">
                    {/* Hero Section with Staggered Animations */}
                    <div className={`space-y-6 ${prefersReducedMotion ? '' : 'animate-slide-up'}`}>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4 ${prefersReducedMotion ? '' : 'animate-fade-in animate-stagger-1'}`}>
                            <Sparkles className="h-4 w-4" />
                            <span>Powered by Llama 3 & Groq</span>
                        </div>
                        <h1 className={`text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] ${prefersReducedMotion ? '' : 'animate-fade-in animate-stagger-2'}`}>
                            Screen Resumes with <br />
                            <span className="text-primary">
                                Intelligence.
                            </span>
                        </h1>
                        <p className={`text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed ${prefersReducedMotion ? '' : 'animate-fade-in animate-stagger-3'}`}>
                            Stop manual screening. Use advanced AI to instantly rank, analyze, and justify candidate fit in seconds.
                        </p>
                    </div>

                    {/* CTA Buttons with Enhanced Hover Effects */}
                    <div className={`flex flex-col sm:flex-row gap-4 justify-center ${prefersReducedMotion ? '' : 'animate-fade-in animate-stagger-4'}`}>
                        <Link to="/signup">
                            <Button size="lg" className="h-12 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-500/25 group" ariaLabel="Start hiring now">
                                Start Hiring Now
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:-translate-y-0.5 transition-all" ariaLabel="Welcome back to your account">
                                Welcome Back
                            </Button>
                        </Link>
                    </div>

                    {/* Features Grid with Card Hover Effects */}
                    <section className={`grid md:grid-cols-3 gap-8 mt-24 ${prefersReducedMotion ? '' : 'animate-fade-in animate-stagger-5'}`} aria-label="Key features">
                        <article className={`group p-8 rounded-3xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/50 backdrop-blur-xl hover:border-blue-500/50 ${prefersReducedMotion ? '' : 'hover:scale-102'} transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10`}>
                            <div className={`h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 ${prefersReducedMotion ? '' : 'group-hover:scale-110'} transition-transform`}>
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Deep Analysis</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Our AI goes beyond keywords to understand core competencies and experience depth.
                            </p>
                        </article>

                        <article className={`group p-8 rounded-3xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/50 backdrop-blur-xl hover:border-blue-500/50 ${prefersReducedMotion ? '' : 'hover:scale-102'} transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10`}>
                            <div className={`h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 ${prefersReducedMotion ? '' : 'group-hover:scale-110'} transition-transform`}>
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Real-time Ranking</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Instantly score candidates from 1-10 with detailed justifications and warning flags.
                            </p>
                        </article>

                        <article className={`group p-8 rounded-3xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/50 backdrop-blur-xl hover:border-blue-500/50 ${prefersReducedMotion ? '' : 'hover:scale-102'} transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10`}>
                            <div className={`h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 ${prefersReducedMotion ? '' : 'group-hover:scale-110'} transition-transform`}>
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Privacy First</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Automatic PII redaction ensures unbiased screening and strict data compliance.
                            </p>
                        </article>
                    </section>
                </div>
            </main>
        </div>
    );
}
