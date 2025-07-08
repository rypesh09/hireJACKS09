import { JobRecommendationsForm } from "./job-recommendations-form";

export default function JobRecommendationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">AI Job Recommendations</h1>
        <p className="text-muted-foreground">
          Let our AI analyze your resume and job history to suggest the perfect roles for you.
        </p>
      </div>
      <JobRecommendationsForm />
    </div>
  );
}
