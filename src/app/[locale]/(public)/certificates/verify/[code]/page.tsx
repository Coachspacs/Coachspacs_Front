import React from "react";
import { Metadata } from "next";
import { CertificateVerifyView } from "@/components/certificate/CertificateVerifyView";

interface PageProps {
  params: Promise<{ code: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const decoded = decodeURIComponent(code || "");
  return {
    title: `Verify Certificate ${decoded} | CoachSpace Academy`,
    description: `Official verification lookup for certificate credential ${decoded} on CoachSpace Academy.`,
  };
}

export default async function CertificateVerifyCodePage({ params }: PageProps) {
  const { code } = await params;
  const decoded = decodeURIComponent(code || "");
  return <CertificateVerifyView initialCode={decoded} />;
}
