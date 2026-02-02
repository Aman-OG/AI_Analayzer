import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
    Plus,
    Search,
    Briefcase,
    Users,
    Calendar,
    ArrowUpRight,
    Trash2,
    Edit3
} from 'lucide-react';
import { jobService } from '../services';
import { toast } from 'sonner';

export function JobsListPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, []);

    async function fetchJobs() {
        try {
            const data = await jobService.getAllJobs();
            setJobs(data || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteJob = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this job and all its candidates?')) {
            return;
        }

        try {
            await jobService.deleteJob(id);
            toast.success('Job deleted successfully');
            fetchJobs();
        } catch (error: any) {
            toast.error('Failed to delete job');
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Job Repository</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage your job postings and analyze applicant resumes.
                    </p>
                </div>
                <Link to="/jobs/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 px-6 h-11 rounded-xl">
                        <Plus className="mr-2 h-4 w-4" />
                        New Position
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by title or company..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredJobs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <div
                            key={job._id}
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            className="group cursor-pointer block h-full"
                        >
                            <div className="h-full p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden">
                                {/* Subtle Background Icon */}
                                <Briefcase className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-100 dark:text-slate-800 transition-colors group-hover:text-blue-500/10" />

                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                                onClick={(e) => handleDeleteJob(e, job._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Link
                                                to={`/jobs/edit/${job._id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-center p-2"
                                                title="Edit Job"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {job.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                                            {job.company || 'Direct Hiring'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4" />
                                            <span>{job.candidateCount || 0} Candidates</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                                        View Details
                                        <ArrowUpRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mx-auto mb-4">
                        <Briefcase className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No positions found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first job posting to start analyzing resumes.</p>
                    <Link to="/jobs/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl">
                            Create a Position
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
