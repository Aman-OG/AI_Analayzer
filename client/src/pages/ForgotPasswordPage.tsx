import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { ArrowLeft, Mail, LayoutDashboard, KeyRound } from 'lucide-react';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            toast.success('Password reset link sent to your email!');
            setSent(true);
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans selection:bg-blue-100 selection:text-blue-700">
            <div className="w-full max-w-[440px] space-y-8 animate-fade-in">
                {/* Branding */}
                <div className="text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-4 animate-bounce-slow">
                        <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Recover access</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">We'll help you get back into your account.</p>
                </div>

                <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                    {sent && (
                        <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[2px] z-10 animate-in fade-in duration-500" />
                    )}

                    {!sent ? (
                        <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-500/20 group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Sending...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <KeyRound className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                        <span>Send Recovery Link</span>
                                    </div>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 relative z-10">
                            <div className="h-20 w-20 rounded-3xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-2 animate-bounce-slow">
                                <Mail className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Check your email</h2>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                                    We've sent a password recovery link to <span className="text-blue-600 font-bold">{email}</span>. Please check your inbox and spam folder.
                                </p>
                            </div>
                            <Button
                                onClick={() => setSent(false)}
                                variant="outline"
                                className="w-full h-12 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-600 font-bold hover:bg-slate-50"
                            >
                                Didn't receive it? Try again
                            </Button>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to secure login
                    </Link>
                </div>
            </div>
        </div>
    );
}
