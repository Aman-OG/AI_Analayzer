
// src/pages/HomePage.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Briefcase, FileText, BarChart2 } from 'lucide-react';

const featureData = [
  {
    title: 'Effortless Job Management',
    description: 'Create, edit, and track all your job openings in one centralized place.',
    icon: <Briefcase className="text-5xl text-indigo-500 mb-4" />,
  },
  {
    title: 'Smart Resume Analysis',
    description: 'Leverage AI to quickly analyze resumes and identify top candidates.',
    icon: <FileText className="text-5xl text-indigo-500 mb-4" />,
  },
  {
    title: 'Actionable Insights',
    description: 'Gain valuable insights into your hiring process and candidate pipeline.',
    icon: <BarChart2 className="text-5xl text-indigo-500 mb-4" />,
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-16 px-4 space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center glass p-12 md:p-16 rounded-3xl shadow-2xl border border-border/50 backdrop-blur-xl transition-all duration-700 hover:shadow-indigo-500/10 group">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full group-hover:bg-indigo-500/20 transition-colors" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full group-hover:bg-purple-500/20 transition-colors" />

        <h1 className="text-4xl md:text-7xl font-black mb-6 text-foreground tracking-tight leading-none relative z-10">
          Welcome,{' '}
          <span className="text-primary drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            {user?.email?.split('@')[0] || 'Guest'}
          </span>
          !
        </h1>
        <p className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto px-4 leading-relaxed relative z-10 font-medium">
          The ultimate AI-first platform to simplify recruitment, from crafting job descriptions to automated candidate ranking.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
          <Button
            asChild
            size="lg"
            className="px-10 py-7 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 rounded-2xl font-bold"
          >
            <Link to="/jobs">
              <Briefcase className="mr-2 h-6 w-6" />
              Manage Jobs
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="px-10 py-7 text-lg border-border/50 hover:bg-muted/50 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 rounded-2xl font-bold"
          >
            <Link to="/jobs">
              Analyze Resumes
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Unlock Your Hiring Potential
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {featureData.map((feature, idx) => (
            <div
              key={idx}
              className="transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-2"
            >
              <Card className="h-full text-center p-8 glass shadow-lg rounded-2xl transition-all duration-300 hover:shadow-indigo-500/20">
                <CardHeader>
                  {feature.icon}
                  <CardTitle className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="relative text-center py-20 glass rounded-3xl shadow-2xl border border-border/40 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-purple-500/5 opacity-50" />
        <h3 className="text-4xl font-black mb-4 text-foreground relative z-10">
          Ready to Modernize Your Hiring?
        </h3>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto relative z-10 font-medium">
          Join hundreds of recruiters saving hours every week with automated analysis.
        </p>
        <Link to="/jobs" className="relative z-10">
          <Button
            size="lg"
            className="px-12 py-8 text-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl hover:shadow-primary/40 transition-all hover:scale-110 active:scale-95 rounded-2xl font-black"
          >
            Go to Dashboard
          </Button>
        </Link>
      </section>
    </div>
  );
}
