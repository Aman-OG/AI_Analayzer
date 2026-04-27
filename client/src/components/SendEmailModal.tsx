import React, { useState } from 'react';
import { Mail, X, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Button } from './ui/button';

interface SendEmailModalProps {
    candidateName: string;
    suggestedEmail?: string | null;
    status: 'interviewed' | 'rejected';
    onConfirm: (email: string | null) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function SendEmailModal({ candidateName, suggestedEmail, status, onConfirm, onCancel, isLoading }: SendEmailModalProps) {
    const [email, setEmail] = useState(suggestedEmail || '');
    const isInterview = status === 'interviewed';

    const handleConfirm = () => {
        onConfirm(email.trim() || null);
    };

    const handleSkip = () => {
        onConfirm(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className={`p-6 border-b ${isInterview ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner ${isInterview ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'}`}>
                            <Mail className="h-6 w-6" />
                        </div>
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                        {isInterview ? 'Send Interview Invite?' : 'Send Rejection Email?'}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Status changed to <span className={`font-bold ${isInterview ? 'text-blue-500' : 'text-rose-500'}`}>{isInterview ? 'Interviewed' : 'Rejected'}</span>. Would you like to notify {candidateName}?
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                            Candidate Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g., candidate@example.com"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all outline-none"
                        />
                        {!suggestedEmail && (
                            <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-2">
                                <AlertCircle className="h-3 w-3" />
                                We couldn't auto-detect the email from the resume.
                            </p>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                        <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">Email Preview:</p>
                        {isInterview ? (
                            <p className="italic">"Dear {candidateName}, we were impressed by your background and would like to invite you to an interview..."</p>
                        ) : (
                            <p className="italic">"Dear {candidateName}, while we were impressed by your background, we have decided to move forward with other candidates..."</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Button
                            onClick={handleConfirm}
                            disabled={!email.trim() || !email.includes('@') || isLoading}
                            className={`w-full h-11 rounded-xl font-bold shadow-lg transition-all ${
                                isInterview 
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' 
                                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                            }`}
                        >
                            {isLoading ? (
                                'Updating Status...'
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Email & Update Status
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            disabled={isLoading}
                            className="w-full h-11 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Skip Email, Just Update Status
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
