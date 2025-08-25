"use client";

import { useState } from "react";
import { correctUserText, CorrectUserTextOutput } from "@/ai/flows/correct-user-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { PenSquare, Lightbulb, Sparkles } from "lucide-react";

export default function CorrectorPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<CorrectUserTextOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCorrection = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const correctionResult = await correctUserText({ text: inputText });
      setResult(correctionResult);
    } catch (error) {
      console.error("Failed to correct text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><PenSquare /> Corrector de Texto</h1>
        <p className="text-muted-foreground">Escribe un texto en español y la IA lo corregirá y te dará sugerencias.</p>
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Textarea
            placeholder="Escribe tu texto aquí... Por ejemplo: 'Ayer, yo ha ido al mercado y compró manzanas.'"
            className="min-h-[200px] text-base"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleCorrection} disabled={isLoading || !inputText.trim()} className="mt-4">
            {isLoading ? "Corrigiendo..." : "Corregir Texto"}
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-32 w-full" /></CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-32 w-full" /></CardContent>
            </Card>
        </div>
      )}

      {result && (
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline"><Sparkles className="text-primary"/>Texto Corregido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{result.correctedText}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline"><Lightbulb className="text-primary"/>Sugerencias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{result.feedback}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
