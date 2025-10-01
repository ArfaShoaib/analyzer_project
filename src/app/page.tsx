'use client';

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Wand2, Trash2, Loader2 } from 'lucide-react';
import { getImageAnalysis } from '@/lib/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for Genkit media
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        handleClear(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = () => {
    if (!imageUrl) return;

    startTransition(async () => {
      const result = await getImageAnalysis({ photoDataUri: imageUrl });
      if (result.success) {
        setAnalysis(result.data.description);
        setError('');
      } else {
        setError(result.error);
        setAnalysis('');
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: result.error,
        });
      }
    });
  };

  const handleClear = (keepImage = false) => {
    if (!keepImage) {
      setImageUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setAnalysis('');
    setError('');
  };

  const placeholderImage = PlaceHolderImages.find(img => img.id === 'upload-placeholder');

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-headline">
            ClarifAI
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Upload a photo and let AI describe its contents and events.
          </p>
        </header>

        <Card className="overflow-hidden shadow-xl border-border/80">
          <div className="grid md:grid-cols-2">
            <div className="p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r">
              <CardHeader className="p-0">
                <CardTitle>Your Image</CardTitle>
                <CardDescription>Upload a photo to be analyzed.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 mt-4 flex-grow flex items-center justify-center">
                <div className="relative aspect-video w-full max-w-full rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Uploaded preview"
                      fill
                      className="object-contain p-1 rounded-lg"
                    />
                  ) : (
                    placeholderImage && (
                        <div className="text-center text-muted-foreground flex flex-col items-center">
                            <Image 
                                src={placeholderImage.imageUrl}
                                alt={placeholderImage.description}
                                data-ai-hint={placeholderImage.imageHint}
                                width={600}
                                height={400}
                                className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-10"
                            />
                            <div className="z-10 flex flex-col items-center">
                                <Upload className="h-10 w-10 mb-2" />
                                <p className="font-semibold text-foreground">Click to upload an image</p>
                                <p className="text-xs">PNG, JPG, or WEBP (Max 4MB)</p>
                            </div>
                        </div>
                    )
                  )}
                  {isPending && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-0 mt-6 flex flex-wrap gap-2">
                <Button className="flex-1 min-w-[120px]" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Upload Photo
                </Button>
                <Button className="flex-1 min-w-[120px]" onClick={handleAnalyzeClick} disabled={!imageUrl || isPending}>
                  <Wand2 className="mr-2 h-4 w-4" /> Analyze
                </Button>
                <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => handleClear()} disabled={!imageUrl && !analysis && !error}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
              </CardFooter>
            </div>
            
            <div className="p-6 bg-muted/20 dark:bg-card/20 flex flex-col">
              <CardHeader className="p-0">
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>Here's what the AI found in your image.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 mt-4 flex-grow">
                <div className="h-full min-h-[200px] rounded-lg border bg-background p-4 text-sm relative">
                  {isPending ? (
                    <div className="space-y-3 animate-pulse">
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-2/5" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : analysis ? (
                    <p className="text-foreground/90 whitespace-pre-wrap animate-in fade-in">
                      {analysis}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Wand2 className="h-10 w-10 mb-4" />
                        <p className="font-semibold text-base text-foreground">Analysis will appear here</p>
                        <p>Upload an image and click "Analyze".</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
      <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
      />
    </main>
  );
}
