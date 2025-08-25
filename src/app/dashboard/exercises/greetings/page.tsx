"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { provideAutomatedFeedback } from '@/ai/flows/provide-automated-feedback';
import { useAuth } from '@/context/auth-context';
import { Loader2, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';

const scenarios = [
    { 
        title: "Encuentro Formal", 
        situation: "Estás en una conferencia y quieres presentarte a un ponente que admiras. ¿Cómo te presentarías profesionalmente?",
        question: "Escribe tu presentación formal."
    },
    { 
        title: "Saludo Informal", 
        situation: "Te encuentras con un amigo que no veías hace tiempo en una cafetería. ¿Cómo lo saludarías?",
        question: "Escribe tu saludo informal."
    }
];

type FeedbackState = {
    text: string;
    isCorrect: boolean | null;
    corrected: string | null;
} | null;

export default function GreetingsExercisePage() {
    const { userLevel } = useAuth();
    const [responses, setResponses] = useState<string[]>(Array(scenarios.length).fill(''));
    const [feedbacks, setFeedbacks] = useState<FeedbackState[]>(Array(scenarios.length).fill(null));
    const [loading, setLoading] = useState<boolean[]>(Array(scenarios.length).fill(false));

    const handleResponseChange = (index: number, value: string) => {
        const newResponses = [...responses];
        newResponses[index] = value;
        setResponses(newResponses);
    };

    const checkAnswer = async (index: number) => {
        if (!responses[index]) return;

        const newLoading = [...loading];
        newLoading[index] = true;
        setLoading(newLoading);

        try {
            const result = await provideAutomatedFeedback({
                answer: responses[index],
                question: scenarios[index].question,
                level: userLevel || 'A1'
            });

            const newFeedbacks = [...feedbacks];
            newFeedbacks[index] = {
                text: result.feedback,
                isCorrect: !result.correctedAnswer,
                corrected: result.correctedAnswer || null,
            };
            setFeedbacks(newFeedbacks);

        } catch (error) {
            console.error("Error checking answer:", error);
            const newFeedbacks = [...feedbacks];
            newFeedbacks[index] = {
                text: "Hubo un error al procesar tu respuesta. Inténtalo de nuevo.",
                isCorrect: false,
                corrected: null
            };
            setFeedbacks(newFeedbacks);
        } finally {
            newLoading[index] = false;
            setLoading(newLoading);
        }
    };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Ejercicio: Saludos y Presentaciones</h1>
        <p className="text-muted-foreground">Lee los escenarios y responde de la forma más natural posible.</p>
      </div>

      <div className="space-y-6">
        {scenarios.map((scenario, index) => (
            <Card key={index} className="shadow-lg">
                <CardHeader>
                    <CardTitle>{scenario.title}</CardTitle>
                    <CardDescription>{scenario.situation}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-2">
                        <Label htmlFor={`response-${index}`}>{scenario.question}</Label>
                        <Input 
                            id={`response-${index}`} 
                            placeholder="Escribe tu respuesta aquí..."
                            value={responses[index]}
                            onChange={(e) => handleResponseChange(index, e.target.value)}
                            disabled={loading[index] || feedbacks[index] !== null}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4">
                     <Button onClick={() => checkAnswer(index)} disabled={loading[index] || feedbacks[index] !== null || !responses[index]}>
                        {loading[index] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Revisar mi respuesta
                    </Button>
                    {feedbacks[index] && (
                        <Alert variant={feedbacks[index]?.isCorrect ? 'default' : 'destructive'}>
                             {feedbacks[index]?.isCorrect ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                            <AlertTitle>{feedbacks[index]?.isCorrect ? "¡Muy bien!" : "Algunas sugerencias"}</AlertTitle>
                            <AlertDescription>
                                {feedbacks[index]?.text}
                                {feedbacks[index]?.corrected && (
                                    <div className="mt-2">
                                        <strong>Corrección: </strong>
                                        <span className="font-mono p-1 bg-primary/10 rounded">{feedbacks[index]?.corrected}</span>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
