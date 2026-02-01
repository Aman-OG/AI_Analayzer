import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, Briefcase, FileText, Shield } from 'lucide-react';
import { useState } from 'react';
import { ThemeSwitcher } from '../ThemeSwitcher';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-700">
            {/* Glassmorphic Navbar */}
            <nav className="sticky top-0 z-40 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                <LayoutDashboard className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">ResumeAI</span>
                        </Link>

                        {/* Main Navigation */}
                        {user && (
                            <div className="hidden md:flex items-center gap-1">
                                <Link to="/jobs">
                                    <Button variant="ghost" className="text-slate-600 dark:text-slate-400 font-bold hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl px-4">
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        Positions
                                    </Button>
                                </Link>
                                <Link to="/analysis/history">
                                    <Button variant="ghost" className="text-slate-600 dark:text-slate-400 font-bold hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl px-4">
                                        <FileText className="mr-2 h-4 w-4" />
                                        History
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        {user ? (
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    className="h-12 pl-2 pr-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all gap-3"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                                            {user.email?.split('@')[0]}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-medium mt-1">
                                            Premium Plan
                                        </span>
                                    </div>
                                </Button>

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-in fade-in zoom-in-95 duration-200 z-20">
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                                            </div>
                                            <Link to="/profile">
                                                <Button variant="ghost" className="w-full justify-start h-11 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl">
                                                    <User className="mr-3 h-4 w-4" />
                                                    My Profile
                                                </Button>
                                            </Link>
                                            <Link to="/profile#security">
                                                <Button variant="ghost" className="w-full justify-start h-11 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl">
                                                    <Shield className="mr-3 h-4 w-4" />
                                                    Security Settings
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start h-11 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                                onClick={handleSignOut}
                                            >
                                                <LogOut className="mr-3 h-4 w-4" />
                                                Sign Out
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link to="/login">
                                    <Button variant="ghost" className="font-bold rounded-xl px-6">Sign In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl px-6 shadow-lg shadow-blue-500/20">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-10">
                {children}
            </main>
        </div>
    );
}

// Add click outside handler later if needed for dropdown
