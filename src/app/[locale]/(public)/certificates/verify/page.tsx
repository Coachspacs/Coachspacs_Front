import React from "react";
import { Metadata } from "next";
import { CertificateVerifyView } from "@/components/certificate/CertificateVerifyView";

export const metadata: Metadata = {
  title: "Verify Certificate | CoachSpace Academy",
  description: "Verify the authenticity of CoachSpace Academy certificates and credentials.",
};

export default function CertificateVerifyPage() {
  return <CertificateVerifyView />;
}
