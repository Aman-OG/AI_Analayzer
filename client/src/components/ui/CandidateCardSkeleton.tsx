export function CandidateCardSkeleton() {
    return (
        <div className="p-6 glass-card relative overflow-hidden animate-pulse">
            <div className="flex items-start gap-4">
                <div className="pt-1">
                    <div className="w-4 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="p-2.5 h-10 w-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-2">
                            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
                            <div className="h-2 w-32 bg-slate-100 dark:bg-slate-900 rounded-md" />
                        </div>
                    </div>

                    <div className="flex items-center gap-8 mt-4">
                        <div className="text-center">
                            <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto" />
                            <div className="h-2 w-10 bg-slate-100 dark:bg-slate-900 rounded-md mx-auto mt-2" />
                        </div>

                        <div className="grid grid-cols-3 gap-6 flex-1 max-w-md">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between">
                                        <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
                                        <div className="h-2 w-6 bg-slate-100 dark:bg-slate-900 rounded-md" />
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="h-2 w-16 bg-slate-100 dark:bg-slate-900 rounded-md" />
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl mt-2" />
                </div>
            </div>
        </div>
    );
}
