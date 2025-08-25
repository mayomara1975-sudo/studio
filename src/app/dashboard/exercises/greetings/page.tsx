"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { provideAutomatedFeedback } from '@/ai/flows/provide-automated-feedback';
import { useAuth } from '@/context/auth-context';
import { Loader2, Sparkles, ThumbsUp, ThumbsDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const lessonParts = [
    {
        type: 'intro',
        title: "Lección: Saludos y Presentaciones",
        content: "En esta lección, aprenderás las diferencias clave entre saludos formales e informales en español, y cuándo usar cada uno. Dominar esto es esencial para causar una buena primera impresión."
    },
    {
        type: 'concept',
        title: "Saludos Informales (Tú)",
        content: "Se usan con amigos, familiares, compañeros cercanos y personas de tu misma edad. Muestran cercanía y confianza.",
        examples: [
            "**Hola, ¿qué tal?** - El saludo más común y versátil.",
            "**¿Cómo estás?** - Pregunta directa por el estado de la otra persona.",
            "**¿Qué pasa?** - Muy informal, similar a 'What's up?'.",
            "**Buenas.** - Forma corta y casual de decir buenos días/tardes."
        ]
    },
    {
        type: 'concept',
        title: "Saludos Formales (Usted)",
        content: "Se usan en situaciones profesionales, con personas mayores, figuras de autoridad o personas que no conoces. Muestran respeto y cortesía.",
        examples: [
            "**Buenos días / Buenas tardes / Buenas noches.** - El estándar de oro de los saludos formales.",
            "**¿Cómo está usted?** - La versión formal de '¿cómo estás?'.",
            "**Es un placer conocerle.** - Para cuando te presentan a alguien.",
            "**Estimado/a [Apellido]:** - Para la comunicación escrita formal."
        ]
    },
    {
        type: 'exercise',
        title: "Ejercicio 1: Encuentro en la calle",
        situation: "Vas caminando y te encuentras con un amigo de la infancia que no ves hace años. ¿Cómo lo saludarías?",
        question: "Escribe un saludo informal y afectuoso."
    },
    {
        type: 'exercise',
        title: "Ejercicio 2: Reunión de trabajo",
        situation: "Estás en una reunión para conocer a un cliente importante por primera vez. ¿Cómo te presentarías?",
        question: "Escribe una presentación formal y profesional."
    },
    {
        type: 'summary',
        title: "¡Excelente Trabajo!",
        content: "Has completado la lección sobre saludos y presentaciones. Recuerda: la clave es observar el contexto y la relación que tienes con la persona. ¡Sigue practicando!",
    }
];

type FeedbackState = {
    text: string;
    isCorrect: boolean | null;
    corrected: string | null;
} | null;

const exerciseId = "greetings";

export default function GreetingsLessonPage() {
    const { userLevel, completeExercise } = useAuth();
    const router = useRouter();
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [responses, setResponses] = useState<{[key: number]: string}>({});
    const [feedbacks, setFeedbacks] = useState<{[key: number]: FeedbackState}>({});
    const [loading, setLoading] = useState<{[key: number]: boolean}>({});

    const currentPart = lessonParts[currentPartIndex];
    const progress = ((currentPartIndex + 1) / lessonParts.length) * 100;
    const isFinalStep = currentPartIndex === lessonParts.length - 1;

    useEffect(() => {
        if (isFinalStep) {
            completeExercise(exerciseId);
        }
    }, [isFinalStep, completeExercise]);

    const handleResponseChange = (index: number, value: string) => {
        setResponses(prev => ({...prev, [index]: value}));
    };

    const checkAnswer = async (index: number) => {
        if (!responses[index]) return;

        setLoading(prev => ({...prev, [index]: true}));
        
        try {
            const result = await provideAutomatedFeedback({
                answer: responses[index],
                question: (lessonParts[index] as any).question,
                level: userLevel || 'A1'
            });

            setFeedbacks(prev => ({
                ...prev,
                [index]: {
                    text: result.feedback,
                    isCorrect: !result.correctedAnswer,
                    corrected: result.correctedAnswer || null,
                }
            }));
        } catch (error) {
            console.error("Error checking answer:", error);
            setFeedbacks(prev => ({
                ...prev,
                [index]: {
                    text: "Hubo un error al procesar tu respuesta. Inténtalo de nuevo.",
                    isCorrect: false,
                    corrected: null
                }
            }));
        } finally {
             setLoading(prev => ({...prev, [index]: false}));
        }
    };
    
    const goToNextPart = () => {
        if (isFinalStep) {
            router.push('/dashboard/exercises');
            return;
        }
        if (currentPartIndex < lessonParts.length - 1) {
            setCurrentPartIndex(currentPartIndex + 1);
        }
    };

    const goToPreviousPart = () => {
        if (currentPartIndex > 0) {
            setCurrentPartIndex(currentPartIndex - 1);
        }
    };

    const formatText = (text: string) => {
        const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <span dangerouslySetInnerHTML={{ __html: boldedText }} />;
    };

    const renderPart = () => {
        switch (currentPart.type) {
            case 'intro':
            case 'summary':
                return (
                    <div className="text-center">
                        <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
                        <p className="text-lg">{currentPart.content}</p>
                    </div>
                );
            case 'concept':
                return (
                    <div>
                        <p className="text-muted-foreground mb-4">{currentPart.content}</p>
                        <div className="space-y-3">
                            {(currentPart as any).examples.map((ex: string, i: number) => (
                                <p key={i} className="p-3 bg-muted rounded-md">{formatText(ex)}</p>
                            ))}
                        </div>
                    </div>
                );
            case 'exercise':
                const feedback = feedbacks[currentPartIndex];
                const isLoading = loading[currentPartIndex];
                const response = responses[currentPartIndex];
                return (
                    <div>
                        <p className="text-muted-foreground mb-2">{(currentPart as any).situation}</p>
                        <label htmlFor={`response-${currentPartIndex}`} className="font-semibold block mb-2">{(currentPart as any).question}</label>
                        <Input 
                            id={`response-${currentPartIndex}`} 
                            placeholder="Escribe tu respuesta aquí..."
                            value={response || ''}
                            onChange={(e) => handleResponseChange(currentPartIndex, e.target.value)}
                            disabled={isLoading || !!feedback}
                        />
                         <Button onClick={() => checkAnswer(currentPartIndex)} disabled={isLoading || !!feedback || !response} className="mt-4">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Revisar mi respuesta
                        </Button>
                        {feedback && (
                            <Alert variant={feedback.isCorrect ? 'default' : 'destructive'} className="mt-4">
                                {feedback.isCorrect ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                                <AlertTitle>{feedback.isCorrect ? "¡Muy bien!" : "Algunas sugerencias"}</AlertTitle>
                                <AlertDescription>
                                    <p className="whitespace-pre-wrap">{feedback.text}</p>
                                    {feedback.corrected && (
                                        <div className="mt-2">
                                            <strong>Corrección: </strong>
                                            <span className="font-mono p-1 bg-primary/10 rounded">{feedback.corrected}</span>
                                        </div>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                );
            default:
                return null;
        }
    }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Lección Interactiva</h1>
        <p className="text-muted-foreground">Saludos y Presentaciones</p>
      </div>

        <Card className="shadow-lg w-full max-w-3xl mx-auto">
            <CardHeader>
                <Progress value={progress} className="mb-4"/>
                <div className="flex justify-between items-center">
                    <Badge variant="secondary">{currentPart.type === 'exercise' ? 'Ejercicio' : 'Teoría'}</Badge>
                    <CardTitle>{currentPart.title}</CardTitle>
                    <span className="text-sm text-muted-foreground">{currentPartIndex + 1} / {lessonParts.length}</span>
                </div>
            </CardHeader>
            <Separator/>
            <CardContent className="p-6 min-h-[250px] flex items-center justify-center">
                {renderPart()}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousPart} disabled={currentPartIndex === 0}>
                    <ArrowLeft className="mr-2"/> Anterior
                </Button>
                 <Button onClick={goToNextPart} disabled={currentPart.type === 'exercise' && !feedbacks[currentPartIndex]}>
                    {isFinalStep ? 'Finalizar y Volver' : 'Siguiente'} <ArrowRight className="ml-2"/>
                </Button>
            </CardFooter>
        </Card>

    </div>
  );
}
