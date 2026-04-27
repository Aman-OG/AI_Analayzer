import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { LayoutDashboard, User, Mail, ArrowRight, Sparkles, Github } from 'lucide-react';
import { PasswordInput } from '../components/ui/PasswordInput';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/jobs`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || `${provider} registration failed`);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid) {
            toast.error('Please fulfill all password requirements');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            });

            if (error) throw error;

            toast.success('Account created! Please check your email.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans selection:bg-blue-100 selection:text-blue-700 relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="absolute top-[-200px] right-1/3 w-[700px] h-[500px] bg-primary/15 dark:bg-primary/8 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-150px] left-1/4 w-[500px] h-[400px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className={`w-full max-w-[480px] space-y-8 relative z-10 ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
                {/* Branding */}
                <div className={`text-center space-y-2 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-1'}`}>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-4`}>
                        <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create your account</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Join 500+ recruiters using AI to find talent.</p>
                </div>

                <div className={`p-8 rounded-[32px] bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/40 backdrop-blur-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none ${prefersReducedMotion ? '' : 'animate-scale-in animate-stagger-2'}`}>
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className={`space-y-2 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-3'}`}>
                            <label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                Name
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={`space-y-2 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-4'}`}>
                            <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="someone@gmail.com"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={`space-y-1 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-5'}`}>
                            <PasswordInput
                                label="Password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <PasswordStrength
                                password={password}
                                onValidationChange={setIsPasswordValid}
                            />
                        </div>

                        <Button
                            type="submit"
                            className={`w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-500/20 group mt-4 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-6'} transition-all hover:-translate-y-0.5`}
                            disabled={loading || (!isPasswordValid && password.length > 0)}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Creating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Sparkles className="h-5 w-5 fill-white/20" />
                                    <span>Get Started Now</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-400">
                                <span className="bg-white/80 dark:bg-slate-900/80 px-4">OR REGISTER WITH</span>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 gap-3 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-7'}`}>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => handleOAuthLogin('google')}
                                className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google Account
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => handleOAuthLogin('github')}
                                className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <Github className="mr-2 h-4 w-4" />
                                GitHub Account
                            </Button>
                        </div>
                    </form>
                </div>

                <p className={`text-center text-slate-500 font-medium ${prefersReducedMotion ? '' : 'animate-fade-in animate-stagger-8'}`}>
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-black hover:underline underline-offset-4">
                        Sign in instead
                    </Link>
                </p>
            </div>
        </div>
    );
}
