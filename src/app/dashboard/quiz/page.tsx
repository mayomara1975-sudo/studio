import { QuizClient } from '@/components/quiz-client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TestTube2 } from 'lucide-react';

export default function QuizPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><TestTube2 /> Prueba de Nivel</h1>
            <p className="text-muted-foreground">Responde las siguientes preguntas para determinar tu nivel de competencia.</p>
        </div>
        <QuizClient />
    </div>
  );
}
