import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

export function HomePage() {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-5xl mx-auto text-center space-y-12">
                    {/* Hero Section */}
                    <div className="space-y-6 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                            <Sparkles className="h-4 w-4" />
                            <span>Powered by Llama 3 & Groq</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                            Screen Resumes with <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Intelligence.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Stop manual screening. Use advanced AI to instantly rank, analyze, and justify candidate fit in seconds.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in [animation-delay:200ms]">
                        <Link to="/signup">
                            <Button size="lg" className="h-12 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-500/25">
                                Start Hiring Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:-translate-y-0.5 transition-all">
                                Welcome Back
                            </Button>
                        </Link>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mt-24 animate-fade-in [animation-delay:400ms]">
                        <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Deep Analysis</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Our AI goes beyond keywords to understand core competencies and experience depth.
                            </p>
                        </div>

                        <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Real-time Ranking</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Instantly score candidates from 1-10 with detailed justifications and warning flags.
                            </p>
                        </div>

                        <div className="group p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Privacy First</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Automatic PII redaction ensures unbiased screening and strict data compliance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
