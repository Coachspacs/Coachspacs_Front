import { redirect } from 'next/navigation';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale || 'en'}/student/cart`);
}
