import { ResumeBuilderForm } from "./resume-builder-form";

export default function ResumeBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">AI Resume Builder</h1>
        <p className="text-muted-foreground">
          Paste your resume below and let our AI reformat it into a professional, industry-standard template.
        </p>
      </div>
      <ResumeBuilderForm />
    </div>
  );
}
