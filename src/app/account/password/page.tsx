import type { Metadata } from "next";

import NewPasswordForm from "@/components/Auth/NewPasswordForm";
import InfoPage from "@/components/InfoPage/InfoPage";
import { hikeBySlug } from "@/lib/hikes";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

/** Landing page of the reset-password email (and "Change password" for signed-in members). */
export default function NewPasswordPage() {
  return (
    <InfoPage title="Choose a new password" description="Pick something long and unique to Great Hikes." image={hikeBySlug("fiordland-national-park")!.photo.src}>
      <NewPasswordForm />
    </InfoPage>
  );
}
