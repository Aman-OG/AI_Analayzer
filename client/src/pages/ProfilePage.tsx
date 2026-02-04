import { useAuth } from '../context/AuthContext';
import { Mail, Calendar, Sparkles, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { PasswordInput } from '../components/ui/PasswordInput';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { supabase } from '../lib/supabase';

export function ProfilePage() {
    const { user, updatePassword } = useAuth();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        old: '',
        new: '',
        confirm: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    // Handle hash navigation for security section
    useEffect(() => {
        if (window.location.hash === '#security') {
            const el = document.getElementById('security-section');
            el?.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    if (!user) return null;

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.new !== passwords.confirm) {
            toast.error('New passwords do not match');
            return;
        }

        if (!isPasswordValid) {
            toast.error('Please fulfill all password requirements');
            return;
        }

        setFormLoading(true);
        try {
            // 1. Verify Old Password
            // In Supabase, the safest way to verify the old password is reauthenticate
            // or trying to sign in again. 
            const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: user.email!,
                password: passwords.old,
            });

            if (reauthError) {
                throw new Error('Verification failed: Current password is incorrect');
            }

            // 2. Update to New Password
            await updatePassword(passwords.new);

            toast.success('Password updated successfully');
            setPasswords({ old: '', new: '', confirm: '' });
            setIsChangingPassword(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setFormLoading(false);
        }
    };

    const initial = user.email?.[0].toUpperCase() || 'U';

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Profile Header */}
            <div className="relative p-10 rounded-[40px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                    <Sparkles className="h-12 w-12 text-blue-500/10 group-hover:scale-110 transition-transform" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="h-28 w-28 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-500/30 transform group-hover:rotate-3 transition-transform">
                        {initial}
                    </div>
                    <div className="text-center md:text-left space-y-3">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {user.email?.split('@')[0]}
                        </h1>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                <Mail className="h-4 w-4 text-slate-500" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto">
                {/* Account Details */}
                <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Lock className="h-5 w-5 text-blue-600" />
                            Security & Account
                        </h2>
                    </div>

                    <div id="security-section" className="space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </p>
                            </div>
                        </div>

                        {!isChangingPassword ? (
                            <Button
                                onClick={() => setIsChangingPassword(true)}
                                variant="outline"
                                className="w-full h-12 rounded-xl font-bold border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Change Password
                            </Button>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="space-y-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-2 border-primary/20 animate-in slide-in-from-top-2 duration-300">
                                <PasswordInput
                                    label="Current Password"
                                    placeholder="Enter old password"
                                    value={passwords.old}
                                    onChange={e => setPasswords(prev => ({ ...prev, old: e.target.value }))}
                                    required
                                />

                                <div className="space-y-1">
                                    <PasswordInput
                                        label="New Password"
                                        placeholder="Min 8 characters"
                                        value={passwords.new}
                                        onChange={e => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                        required
                                    />
                                    <PasswordStrength
                                        password={passwords.new}
                                        onValidationChange={setIsPasswordValid}
                                    />
                                </div>

                                <PasswordInput
                                    label="Confirm New Password"
                                    placeholder="Repeat new password"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                    required
                                />

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={formLoading || (!isPasswordValid && passwords.new.length > 0)}
                                        className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold"
                                    >
                                        {formLoading ? 'Verifying...' : 'Update Password'}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setIsChangingPassword(false)}
                                        variant="ghost"
                                        className="h-11 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
