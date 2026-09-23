import { NextRequest, NextResponse } from "next/server";
import { AiCopywritingService, CopywritingRequest } from "@/services/cms/aiCopywritingService";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CopywritingRequest;

    if (!body || !body.sectionKey) {
      return NextResponse.json(
        { success: false, error: "sectionKey is required" },
        { status: 400 }
      );
    }

    const suggestions = await AiCopywritingService.generateSuggestions(body);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error: any) {
    console.error("[API:ai-copywrite] Error generating suggestions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI copywriting suggestions",
      },
      { status: 500 }
    );
  }
}
