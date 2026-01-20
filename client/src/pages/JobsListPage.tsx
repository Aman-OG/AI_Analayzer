
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you are using React Router
import jobService from '@/services/jobService'; // Now using your actual service
import type { JobDescription, CreateJobData } from '../types'; // Now using your actual types
import type { JobFormData } from '../lib/validators'; // Now using your actual types
import JobForm from '@/components/JobForm'; // Now using your actual form component

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  // DialogFooter, // Removed as JobForm handles its own footer/buttons
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner'; // Now using your actual toast
import {
  MoreHorizontal,
  Trash2,
  PlusCircle,
  Loader2,
  // Eye, // Replaced by FileText for consistency
  Briefcase,
  X,
  Search,
  FileText, // For "View Details"
  // Edit3, // For "Edit" if you add that functionality
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/Loading';
import { useError } from '@/contexts/ErrorContext';

const JobsListPage = () => {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isCreateJobDialogOpen, setIsCreateJobDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobDescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showError } = useError();

  const navigate = useNavigate();

  // Fetch all jobs
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await jobService.getAllJobs();
      setJobs(data);
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Create job handler
  const handleCreateJobSubmit = async (formData: JobFormData) => {
    setIsFormLoading(true);
    const createData: CreateJobData = {
      title: formData.title,
      descriptionText: formData.descriptionText,
      mustHaveSkills: formData.mustHaveSkills
        ? formData.mustHaveSkills.split(',').map(s => s.trim()).filter(s => s)
        : [],
      focusAreas: formData.focusAreas
        ? formData.focusAreas.split(',').map(s => s.trim()).filter(s => s)
        : [],
    };
    try {
      await jobService.createJob(createData);
      toast.success("Job Created!", {
        description: `“${createData.title}” was added.`,
      });
      setIsCreateJobDialogOpen(false);
      fetchJobs(); // Refresh the list
    } catch (error: any) {
      showError(error);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Delete job handler
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setIsFormLoading(true);
    try {
      await jobService.deleteJob(jobToDelete._id);
      toast.success("Job Deleted", {
        description: `"${jobToDelete.title}" has been removed.`,
      });
      setJobToDelete(null);
      fetchJobs(); // Refresh the list
    } catch (error: any) {
      showError(error, { jobId: jobToDelete._id });
    } finally {
      setIsFormLoading(false);
    }
  };


  // Filtered jobs based on search term
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Main page content
  return (
    <div className="min-h-screen bg-background transition-colors duration-500 py-8 px-4 md:px-8 lg:px-12 border-1 border-border/50 rounded-lg">
      <main className="container mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 pb-6 border-b border-border">
          <div className="flex items-center gap-4 group">
            <Briefcase className="h-10 w-10 text-primary transition-transform group-hover:scale-110 duration-300" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Job Postings</h1>
              <p className="text-muted-foreground text-sm font-medium">Manage your company's open positions.</p>
            </div>
          </div>
          <Dialog
            open={isCreateJobDialogOpen}
            onOpenChange={setIsCreateJobDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95 rounded-xl px-8 py-6 text-lg font-bold">
                <PlusCircle className="mr-2 h-6 w-6" />
                Create New Job
              </Button>
            </DialogTrigger>
            <DialogPortal>
              <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
              <DialogContent className="sm:max-w-[600px] glass border-border/50 shadow-2xl rounded-2xl p-0 overflow-hidden fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
                <DialogHeader className="p-8 pb-4 bg-muted/20 border-b border-border/40">
                  <DialogTitle className="text-3xl font-bold text-foreground">Create New Job</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-base">
                    Fill in the details below to post a new job opening.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-8">
                  <JobForm
                    onSubmit={handleCreateJobSubmit}
                    isLoading={isFormLoading}
                    submitButtonText="Publish Job"
                    onCancel={() => setIsCreateJobDialogOpen(false)}
                  />
                </div>
                <DialogClose className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-muted transition-colors">
                  <X className="h-5 w-5 text-muted-foreground" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </header>

        {/* Search and Filters */}
        {(jobs.length > 0 || isLoading) && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/2 lg:w-1/3 pl-10 pr-4 py-6 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 shadow-sm transition-all text-lg"
                disabled={isLoading}
                aria-label="Search job postings by title"
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <Card className="shadow-xl border-border bg-card rounded-xl overflow-hidden p-6">
            <div className="flex items-center gap-2 mb-6">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Retrieving job postings...</span>
            </div>
            <TableSkeleton rows={8} columns={3} />
          </Card>
        ) : filteredJobs.length === 0 ? (

          <Card className="text-center shadow-lg border-border bg-card rounded-xl overflow-hidden">
            <CardHeader className="pt-12 pb-8 bg-muted/30">
              <Briefcase className="mx-auto h-20 w-20 text-muted-foreground/30 mb-4" />
              <CardTitle className="mt-4 text-3xl font-semibold text-foreground">No Job Postings Found</CardTitle>
              {searchTerm ? (
                <CardDescription className="mt-2 text-muted-foreground text-base">
                  Try adjusting your search term or create a new job.
                </CardDescription>
              ) : (
                <CardDescription className="mt-2 text-muted-foreground text-base">
                  Get started by clicking the "Create New Job" button.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="py-8">
              <p className="text-muted-foreground">
                Once you add jobs, they’ll appear here. Let's build your team!
              </p>
            </CardContent>
            {!searchTerm && (
              <CardFooter className="pb-10 pt-0 flex justify-center">
                <Button size="lg" onClick={() => setIsCreateJobDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all rounded-lg px-6 py-3">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Your First Job
                </Button>
              </CardFooter>
            )}
          </Card>
        ) : (
          <Card className="glass shadow-2xl border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-border/40 bg-muted/20">
              <CardTitle className="text-2xl font-bold text-foreground">Manage Your Postings</CardTitle>
              <CardDescription className="text-muted-foreground text-sm font-medium">
                View, manage, or delete your active job postings below.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[60%] min-w-[300px] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Job Title
                      </TableHead>
                      <TableHead className="min-w-[180px] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Date Created
                      </TableHead>
                      {/* Removed Status and Applicants columns as they might not be in your actual JobDescription type */}
                      {/* If you have these fields, you can add the TableHead and TableCell back */}
                      <TableHead className="text-right min-w-[100px] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/40 animate-staggered">
                    {filteredJobs.map(job => (
                      <TableRow key={job._id} className="hover:bg-muted/30 transition-colors duration-150">
                        <TableCell
                          className="font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer px-6 py-4 whitespace-nowrap"
                          onClick={() => navigate(`/jobs/${job._id}`)} // Ensure this route exists
                        >
                          {job.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(job.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long', // Changed back to 'long' as in original user code
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-right px-6 py-4 whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 data-[state=open]:bg-muted text-muted-foreground hover:text-foreground">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 shadow-lg rounded-md border-border bg-card">
                              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => navigate(`/jobs/${job._id}`)} className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 text-sm text-foreground">
                                <FileText className="mr-2 h-4 w-4 text-primary" /> View Details
                              </DropdownMenuItem>
                              {/* Add Edit option here if needed
                              <DropdownMenuItem onClick={() => { /* handle edit logic for job * / }} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1.5 text-sm text-slate-700">
                                <Edit3 className="mr-2 h-4 w-4 text-blue-500" /> Edit Job
                              </DropdownMenuItem> */}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600 hover:!bg-red-50 hover:!text-red-700 cursor-pointer px-2 py-1.5 text-sm"
                                onClick={() => setJobToDelete(job)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {filteredJobs.length > 5 && (
                    <TableCaption className="py-4 text-sm text-muted-foreground">
                      End of job list. {jobs.length} total postings.
                    </TableCaption>
                  )}
                </Table>
              </div>
            </CardContent>
            {filteredJobs.length > 0 && (
              <CardFooter className="px-6 py-4 border-t border-border text-sm text-muted-foreground">
                Showing {filteredJobs.length} of {jobs.length} job postings.
              </CardFooter>
            )}
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!jobToDelete}
          onOpenChange={open => !open && setJobToDelete(null)}
        >
          <AlertDialogContent className="glass border-border/50 shadow-2xl rounded-2xl p-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-foreground">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-base">
                This action cannot be undone. This will permanently delete the
                job posting for <span className="font-bold text-foreground">"{jobToDelete?.title}"</span> and remove all associated candidate data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-3">
              <AlertDialogCancel className="rounded-xl px-6 border-border/50 hover:bg-muted transition-colors" disabled={isFormLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteJob}
                disabled={isFormLoading}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl px-8 shadow-lg shadow-destructive/20 transition-all hover:scale-105 active:scale-95"
              >
                {isFormLoading
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Trash2 className="mr-2 h-4 w-4" />
                }
                Delete Job
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default JobsListPage;

// Add these to your tailwind.config.js if you want the dialog animations:
// (This is just an example, shadcn/ui might handle this automatically)
/*
module.exports = {
  // ...
  theme: {
    extend: {
      keyframes: {
        'content-show': {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        'content-show': 'content-show 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')], // Ensure you have this plugin
};
*/
