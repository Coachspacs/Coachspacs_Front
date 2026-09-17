import { redirect } from "next/navigation";

export default async function InstructorOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/instructor/dashboard`);
}
