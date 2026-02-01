import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, LogOut, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

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
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <Briefcase className="h-6 w-6 text-violet-600" />
                    <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        AI Resume Analyzer
                    </span>
                </Link>

                <div className="flex items-center space-x-4">
                    {user && (
                        <>
                            <Link to="/jobs">
                                <Button variant="ghost" size="sm">
                                    My Jobs
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </>
                    )}

                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </nav>
    );
}
