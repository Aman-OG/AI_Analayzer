import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { jobService } from '../services';
import { toast } from 'sonner';
import { ArrowLeft, X, Save, Sparkles, Plus } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function EditJobPage() {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [descriptionText, setDescriptionText] = useState('');
    const [mustHaveSkills, setMustHaveSkills] = useState<string[]>([]);
    const [focusAreas, setFocusAreas] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [focusInput, setFocusInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const prefersReducedMotion = useReducedMotion();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchJob();
        }
    }, [id]);

    const fetchJob = async () => {
        try {
            const job = await jobService.getJobById(id!);
            setTitle(job.title);
            setCompany(job.company || '');
            setDescriptionText(job.descriptionText);
            setMustHaveSkills(job.mustHaveSkills || []);
            setFocusAreas(job.focusAreas || []);
        } catch (error: any) {
            toast.error('Failed to load job details');
            navigate('/jobs');
        } finally {
            setFetching(false);
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !mustHaveSkills.includes(skillInput.trim())) {
            setMustHaveSkills([...mustHaveSkills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setMustHaveSkills(mustHaveSkills.filter((s) => s !== skill));
    };

    const addFocusArea = () => {
        if (focusInput.trim() && !focusAreas.includes(focusInput.trim())) {
            setFocusAreas([...focusAreas, focusInput.trim()]);
            setFocusInput('');
        }
    };

    const removeFocusArea = (area: string) => {
        setFocusAreas(focusAreas.filter((a) => a !== area));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await jobService.updateJob(id!, {
                title,
                company: company || 'My Company',
                descriptionText,
                mustHaveSkills,
                focusAreas,
            });

            toast.success('Job updated successfully!');
            navigate(`/jobs/${id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update job');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-[600px] bg-slate-100 dark:bg-slate-900/50 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className={`max-w-4xl mx-auto space-y-8 ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
            {/* Header */}
            <div className={`flex items-center gap-4 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-1'}`}>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/jobs/${id}`)}
                    className="rounded-full hover:bg-white dark:hover:bg-slate-900 shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-none mb-1">Edit Position</h1>
                    <p className="text-slate-500 text-sm">Update job requirements and screening criteria</p>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className={`space-y-3 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-2'}`}>
                <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">Editing Job Details</span>
                    <span className="text-slate-500">All changes saved automatically</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-primary w-full" />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 group/form">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={`p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-3'}`}>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Information</h2>
                        
                        <div className={`space-y-2 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-4'}`}>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Job Title</label>
                            <Input
                                placeholder="e.g. Senior Software Engineer"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-12 rounded-xl border-slate-200"
                                required
                            />
                        </div>

                        <div className={`space-y-2 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-5'}`}>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Company</label>
                            <Input
                                placeholder="e.g. Acme Corp"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="h-12 rounded-xl border-slate-200"
                            />
                        </div>

                        <div className={`space-y-2 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-6'}`}>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Detailed Description</label>
                            <Textarea
                                placeholder="Paste the full job description here..."
                                value={descriptionText}
                                onChange={(e) => setDescriptionText(e.target.value)}
                                className="min-h-[300px] rounded-2xl resize-none border-slate-200 leading-relaxed"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Requirements */}
                <div className={`space-y-6 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-4'}`}>
                    {/* Skills Tagging */}
                    <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-4 sticky top-20">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2">
                            <Sparkles className="h-4 w-4" />
                            <span>Selection Criteria</span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Must-Have Skills</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="React, AWS..."
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        className="h-10 rounded-lg text-sm"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addSkill}
                                        size="icon"
                                        className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {mustHaveSkills.map((skill, idx) => (
                                        <div key={skill} className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border text-sm font-medium ${prefersReducedMotion ? '' : 'animate-fade-in'}`} style={{ animationDelay: prefersReducedMotion ? '0ms' : `${idx * 50}ms` }}>
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-500">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Focus Areas</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Communication..."
                                        value={focusInput}
                                        onChange={(e) => setFocusInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFocusArea())}
                                        className="h-10 rounded-lg text-sm"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addFocusArea}
                                        size="icon"
                                        className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {focusAreas.map((area, idx) => (
                                        <div key={area} className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 dark:bg-slate-900/50 border text-sm font-medium ${prefersReducedMotion ? '' : 'animate-fade-in'}`} style={{ animationDelay: prefersReducedMotion ? '0ms' : `${idx * 50}ms` }}>
                                            {area}
                                            <button type="button" onClick={() => removeFocusArea(area)} className="text-slate-400 hover:text-red-500">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`space-y-3 ${prefersReducedMotion ? '' : 'animate-slide-up animate-stagger-5'}`}>
                        <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1">
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 animate-spin" />
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Save className="h-5 w-5" />
                                    <span>Save Changes</span>
                                </div>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full text-slate-500 font-medium transition-all hover:-translate-y-0.5"
                            onClick={() => navigate(`/jobs/${id}`)}
                        >
                            Discard Changes
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
