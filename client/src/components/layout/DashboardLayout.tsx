import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, Briefcase, Moon, Sun, Laptop, BarChart3 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname.startsWith(path);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-700">
            {/* Glassmorphic Navbar with Enhanced Styling */}
            <nav className="sticky top-0 z-[100] w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 supports-[backdrop-filter]:bg-white/60 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/50 transition-all duration-300">
                <div className="w-full px-4 md:px-8 lg:px-12 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link to={user ? "/jobs" : "/"} className="flex items-center gap-3 group">
                            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                                <LayoutDashboard className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">ResumeAI</span>
                        </Link>

                        {/* Main Navigation with Link Hover Animations */}
                        {user && (
                            <div className="hidden md:flex items-center gap-1">
                                <Link to="/jobs">
                                    <Button 
                                        variant="ghost" 
                                        className={`font-bold rounded-xl px-4 transition-all duration-200 relative group ${
                                            isActive('/jobs')
                                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30 shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                                        }`}
                                    >
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        Positions
                                        {/* Underline animation */}
                                        <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 ease-out ${
                                            isActive('/jobs') ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}></span>
                                    </Button>
                                </Link>
                                <Link to="/analytics">
                                    <Button 
                                        variant="ghost" 
                                        className={`font-bold rounded-xl px-4 transition-all duration-200 relative group ${
                                            isActive('/analytics')
                                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30 shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                                        }`}
                                    >
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Analytics
                                        {/* Underline animation */}
                                        <span className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 ease-out ${
                                            isActive('/analytics') ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}></span>
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <Button
                                    variant="ghost"
                                    className="h-12 pl-2 pr-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 gap-3"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                                        {(user.user_metadata?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                                            {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                                        </span>
                                    </div>
                                </Button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-in fade-in zoom-in-95 duration-200 z-50">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                                        </div>

                                        <div className="px-2 mb-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Appearance</p>
                                            <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <ThemeButton mode="light" icon={<Sun className="h-3.5 w-3.5" />} />
                                                <ThemeButton mode="dark" icon={<Moon className="h-3.5 w-3.5" />} />
                                                <ThemeButton mode="system" icon={<Laptop className="h-3.5 w-3.5" />} />
                                            </div>
                                        </div>

                                        <Link to="/profile">
                                            <Button variant="ghost" className="w-full justify-start h-11 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200">
                                                <User className="mr-3 h-4 w-4" />
                                                My Profile
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-11 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                                            onClick={handleSignOut}
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link to="/login">
                                    <Button variant="ghost" className="font-bold rounded-xl px-6 transition-all duration-200 hover:-translate-y-0.5">Sign In</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl px-6 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="w-full px-4 md:px-8 lg:px-12 py-10 animate-fade-in">
                {children}
            </main>
        </div>
    );

    function ThemeButton({ mode, icon }: { mode: 'light' | 'dark' | 'system', icon: React.ReactNode }) {
        const { theme, setTheme } = useTheme();
        const isActive = theme === mode;

        return (
            <button
                onClick={() => {
                    setTheme(mode);
                    setIsProfileOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-1.5 py-2 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
            >
                {icon}
                <span className="text-[10px] font-black uppercase tracking-tighter">{mode}</span>
            </button>
        );
    }
}
