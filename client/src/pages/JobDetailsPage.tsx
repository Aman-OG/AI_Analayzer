import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CandidateList } from '../components/CandidateList';
import { jobService, resumeService } from '../services';
import {
    Briefcase,
    Calendar,
    Users,
    Sparkles,
    ArrowLeft,
    Upload,
    Edit3
} from 'lucide-react';
import { toast } from 'sonner';

export function JobDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (id) {
            loadJob();
        }
    }, [id]);

    const loadJob = async () => {
        try {
            const data = await jobService.getJobById(id!);
            setJob(data);
        } catch (error: any) {
            toast.error('Failed to load job');
            navigate('/jobs');
        } finally {
            setLoading(false);
        }
    };

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a PDF or DOCX file');
            return;
        }
        setSelectedFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !id) return;

        setUploading(true);
        try {
            await resumeService.uploadResume(id, selectedFile);
            toast.success('Resume uploaded! AI analysis is running in the background.');
            setSelectedFile(null);
            setRefreshTrigger(prev => prev + 1);

            // Reset file input
            const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-40 rounded-3xl bg-slate-100 dark:bg-slate-800" />
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 h-96 rounded-3xl bg-slate-100 dark:bg-slate-800" />
                    <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-100 dark:bg-slate-800" />
                </div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/jobs')}
                            className="rounded-full hover:bg-white dark:hover:bg-slate-900 shadow-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-none mb-1">{job.title}</h1>
                        <Link to={`/jobs/edit/${id}`}>
                            <Button variant="ghost" size="sm" className="ml-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-bold gap-2">
                                <Edit3 className="h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                        <Briefcase className="h-3 w-3" />
                        {job.company || 'Direct Hiring'}
                        <span className="text-slate-300">•</span>
                        <Calendar className="h-3 w-3" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Job Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                        <section className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {job.descriptionText}
                            </p>
                        </section>

                        {job.mustHaveSkills?.length > 0 && (
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Strict Requirements</h3>
                                <div className="flex flex-wrap gap-2">
                                    {job.mustHaveSkills.map((skill: string, idx: number) => (
                                        <span key={idx} className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Quick Upload Action */}
                    <div className="p-8 rounded-3xl bg-blue-600 shadow-xl shadow-blue-500/20 text-white space-y-6 relative overflow-hidden group">
                        <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-white/10 group-hover:scale-110 transition-transform" />

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">New Applicant?</h3>
                            <p className="text-blue-100 text-sm mb-6">Upload a resume to instantly see how they rank against your requirements.</p>

                            <div className="space-y-3">
                                <label
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${isDragging
                                        ? 'bg-blue-500 border-white shadow-inner scale-[0.98]'
                                        : 'border-blue-400/50 hover:bg-blue-500/10'
                                        }`}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                        <div className={`p-3 rounded-2xl bg-white/10 mb-3 transition-transform ${isDragging ? 'scale-110' : ''}`}>
                                            <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-blue-100'}`} />
                                        </div>
                                        {selectedFile ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-white truncate max-w-[200px]">{selectedFile.name}</p>
                                                <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest">Selected</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-blue-50">
                                                    {isDragging ? 'Drop it here!' : 'Click or Drop Resume'}
                                                </p>
                                                <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest">PDF or DOCX</p>
                                            </div>
                                        )}
                                    </div>
                                    <input id="resume-upload" type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                                </label>

                                <Button
                                    className="w-full h-14 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-black text-base shadow-lg transition-transform hover:-translate-y-1"
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploading}
                                >
                                    {uploading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                                            <span>Analyzing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5" />
                                            <span>Rank Candidate</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Candidates */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="h-6 w-6 text-blue-600" />
                            Ranked Candidates
                        </h2>
                    </div>

                    <CandidateList jobId={id!} refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
}
