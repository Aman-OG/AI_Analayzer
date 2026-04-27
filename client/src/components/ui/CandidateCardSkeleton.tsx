export function CandidateCardSkeleton() {
    return (
        <div className="p-8 md:p-10 glass-card relative overflow-hidden">
            {/* Premium Shimmer Overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />

            <div className="flex items-start gap-4">
                <div className="pt-1">
                    <div className="w-5 h-5 rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="p-2.5 h-11 w-11 rounded-2xl bg-slate-200/60 dark:bg-slate-700/40" />
                        <div className="space-y-2.5">
                            <div className="h-5 w-56 bg-slate-200/60 dark:bg-slate-700/40 rounded-lg" />
                            <div className="h-3 w-36 bg-slate-100/80 dark:bg-slate-800/50 rounded-lg" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-8 mt-5">
                        <div className="text-center">
                            <div className="h-14 w-20 bg-slate-200/60 dark:bg-slate-700/40 rounded-2xl mx-auto" />
                            <div className="h-3 w-16 bg-slate-100/80 dark:bg-slate-800/50 rounded-lg mx-auto mt-3" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 flex-1 w-full max-w-full lg:max-w-xl">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-2.5">
                                    <div className="flex justify-between">
                                        <div className="h-3 w-16 bg-slate-200/60 dark:bg-slate-700/40 rounded-lg" />
                                        <div className="h-3 w-8 bg-slate-100/80 dark:bg-slate-800/50 rounded-lg" />
                                    </div>
                                    <div className="h-2 bg-slate-100/80 dark:bg-slate-800/50 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <div className="h-3 w-20 bg-slate-100/80 dark:bg-slate-800/50 rounded-lg" />
                    <div className="h-9 w-28 bg-slate-200/60 dark:bg-slate-700/40 rounded-2xl mt-2" />
                </div>
            </div>
        </div>
    );
}
