import { CoverLetterGeneratorForm } from "./cover-letter-form";

export default function CoverLetterGeneratorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">AI Cover Letter Generator</h1>
        <p className="text-muted-foreground">
          Enter a job title and your resume, and let our AI craft a tailored cover letter for you.
        </p>
      </div>
      <CoverLetterGeneratorForm />
    </div>
  );
}
