import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { useState } from 'react';

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 h-10 w-10 transition-all"
            >
                {theme === 'light' ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                ) : theme === 'dark' ? (
                    <Moon className="h-4 w-4 text-blue-400" />
                ) : (
                    <Laptop className="h-4 w-4 text-slate-500" />
                )}
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-32 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xl animate-in fade-in zoom-in-95 duration-200 z-20">
                        <button
                            onClick={() => { setTheme('light'); setIsOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${theme === 'light' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <Sun className="h-3.5 w-3.5" />
                            Light
                        </button>
                        <button
                            onClick={() => { setTheme('dark'); setIsOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${theme === 'dark' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <Moon className="h-3.5 w-3.5" />
                            Dark
                        </button>
                        <button
                            onClick={() => { setTheme('system'); setIsOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${theme === 'system' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <Laptop className="h-3.5 w-3.5" />
                            System
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
