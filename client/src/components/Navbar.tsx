import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, LogOut, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || 'Logout failed');
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className={`sticky top-0 z-50 border-b border-slate-200/30 dark:border-slate-700/30 bg-white/60 backdrop-blur-2xl dark:bg-slate-950/60 supports-[backdrop-filter]:bg-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] ${prefersReducedMotion ? 'transition-all duration-100' : 'transition-all duration-300'}`}>
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 group">
                    <Briefcase className={`h-6 w-6 text-blue-600 ${prefersReducedMotion ? '' : 'group-hover:scale-110'} transition-transform duration-200`} />
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        AI Resume Analyzer
                    </span>
                </Link>

                <div className="flex items-center space-x-4">
                    {user && (
                        <>
                            <Link to="/jobs">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className={`relative group transition-all duration-200`}
                                >
                                    My Jobs
                                    {/* Underline animation: slide from left */}
                                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 ${prefersReducedMotion ? '' : 'group-hover:w-full'} transition-all duration-300 ease-out rounded-full`}></span>
                                </Button>
                            </Link>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleLogout}
                                className="transition-all duration-200 hover:text-red-600"
                                ariaLabel="Logout"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </>
                    )}

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleTheme}
                        className={`transition-all duration-200 ${prefersReducedMotion ? '' : 'hover:rotate-180'}`}
                        ariaLabel={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5 transition-transform duration-300" />
                        ) : (
                            <Moon className="h-5 w-5 transition-transform duration-300" />
                        )}
                    </Button>
                </div>
            </div>
        </nav>
    );
}
