import { ProfileForm } from "./profile-form";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Update your personal information and career details.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
