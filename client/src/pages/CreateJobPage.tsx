
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '@/services/jobService';
import JobForm from '@/components/JobForm';
import type { JobFormData } from '@/lib/validators';
import type { CreateJobData } from '@/types';
import { toast } from 'sonner';
import { useError } from '@/contexts/ErrorContext';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const CreateJobPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useError();
  const navigate = useNavigate();

  const handleCreateJob = async (formData: JobFormData) => {
    setIsLoading(true);
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
      toast.success("Job Created Successfully", {
        description: `“${createData.title}” is now live.`,
      });
      navigate('/jobs');
    } catch (error: any) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />

      <main className="container mx-auto max-w-3xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/jobs')}
            className="hover:bg-muted group text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Jobs
          </Button>
        </div>

        <Card className="glass shadow-2xl border-border/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 p-8 border-b border-border/40">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl font-black text-foreground">Create New Job</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                  Detailed job descriptions lead to more accurate AI analysis.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <JobForm
              onSubmit={handleCreateJob}
              isLoading={isLoading}
              submitButtonText="Create Job Posting"
              onCancel={() => navigate('/jobs')}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateJobPage;
