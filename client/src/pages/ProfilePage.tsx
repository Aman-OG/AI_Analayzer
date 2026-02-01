import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, CreditCard, Sparkles } from 'lucide-react';

export function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Profile Header */}
            <div className="relative p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                    <Sparkles className="h-12 w-12 text-blue-500/10 group-hover:scale-110 transition-transform" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="h-24 w-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <User className="h-12 w-12" />
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {user.email?.split('@')[0]}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                            <Mail className="h-4 w-4" />
                            {user.email}
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                                Active User
                            </span>
                            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Premium Plan
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Account Details */}
                <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Details</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Joined On</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Email Address Verified</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Card */}
                <div className="p-8 rounded-[32px] bg-blue-600 text-white shadow-xl shadow-blue-500/20 space-y-6 relative overflow-hidden group">
                    <CreditCard className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform" />

                    <div className="relative z-10 space-y-6">
                        <h2 className="text-xl font-bold">Subscription</h2>
                        <div className="space-y-1">
                            <p className="text-blue-100 text-sm font-medium">Current Status</p>
                            <p className="text-2xl font-black">ResumeAI Professional</p>
                        </div>
                        <div className="pt-4 border-t border-blue-500">
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm font-bold">
                                    <Sparkles className="h-4 w-4 fill-white/20" />
                                    Unlimited Resume Analysis
                                </li>
                                <li className="flex items-center gap-2 text-sm font-bold">
                                    <Sparkles className="h-4 w-4 fill-white/20" />
                                    Premium Job Management
                                </li>
                                <li className="flex items-center gap-2 text-sm font-bold">
                                    <Sparkles className="h-4 w-4 fill-white/20" />
                                    Export Rankings as PDF/CSV
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
