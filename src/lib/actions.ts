'use server';

import { analyzeUploadedImage, type AnalyzeUploadedImageInput } from '@/ai/flows/analyze-uploaded-image';

export async function getImageAnalysis(input: AnalyzeUploadedImageInput): Promise<{ success: boolean; data?: { description: string; }; error?: string; }> {
  if (!input.photoDataUri) {
    return { success: false, error: 'Image data is missing.' };
  }

  try {
    const result = await analyzeUploadedImage(input);
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'An error occurred during analysis. Please try again.' };
  }
}
