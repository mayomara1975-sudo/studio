"use client";

import { useState, useEffect } from "react";
import { generateQuizQuestions, GenerateQuizQuestionsOutput } from "@/ai/flows/generate-quiz-questions";
import { analyzeProficiencyLevel, AnalyzeProficiencyLevelOutput } from "@/ai/flows/analyze-proficiency-level";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThumbsUp, ThumbsDown, Award, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizState = "loading" | "ongoing" | "finished";
type AnswerStatus = "unanswered" | "correct" | "incorrect";

export function QuizClient() {
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [questions, setQuestions] = useState<GenerateQuizQuestionsOutput["questions"]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>("unanswered");
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [proficiencyResult, setProficiencyResult] = useState<AnalyzeProficiencyLevelOutput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const data = await generateQuizQuestions({
          topic: "general spanish proficiency",
          proficiencyLevel: "A1-C2",
          numberOfQuestions: 15,
        });
        setQuestions(data.questions);
        setQuizState("ongoing");
      } catch (error) {
        console.error("Failed to generate quiz questions:", error);
      }
    }
    loadQuiz();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / (questions.length || 1)) * 100;

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = selectedAnswer === currentQuestion.answer;
    setAnswerStatus(isCorrect ? "correct" : "incorrect");
    setUserAnswers([...userAnswers, `Q: ${currentQuestion.question}\nA: ${selectedAnswer}`]);
  };

  const handleNextQuestion = async () => {
    setAnswerStatus("unanswered");
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizState("finished");
      setIsSubmitting(true);
      try {
        const result = await analyzeProficiencyLevel({ quizResponses: userAnswers.join("\n---\n") });
        setProficiencyResult(result);
      } catch (error) {
        console.error("Failed to analyze proficiency:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (quizState === "loading" || !currentQuestion) {
    return (
        <Card className="mt-4">
            <CardHeader><Skeleton className="h-6 w-3/5" /></CardHeader>
            <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
            <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
        </Card>
    );
  }

  if (quizState === "finished") {
    return (
      <Card className="mt-4 shadow-lg">
        <CardHeader className="text-center">
          <Award className="w-16 h-16 text-primary mx-auto" />
          <CardTitle className="text-2xl font-headline mt-2">¡Prueba Completada!</CardTitle>
          <CardDescription>Aquí están tus resultados.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitting ? (
            <div className="flex flex-col items-center gap-4 p-8">
              <p className="font-semibold">Analizando tus respuestas...</p>
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="h-6 w-3/4 mt-2" />
            </div>
          ) : proficiencyResult ? (
            <div className="space-y-4">
              <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-semibold tracking-wider uppercase">Tu Nivel de Proficiencia</p>
                <p className="text-6xl font-bold font-headline text-primary">{proficiencyResult.proficiencyLevel}</p>
              </div>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle className="font-headline">Justificación de la IA</AlertTitle>
                <AlertDescription>{proficiencyResult.reasoning}</AlertDescription>
              </Alert>
            </div>
          ) : <p className="text-center text-destructive">Hubo un error al analizar tus resultados.</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4">
        <div className="flex items-center gap-4 mb-2">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm text-muted-foreground">{currentQuestionIndex + 1} / {questions.length}</span>
        </div>
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="font-headline">Pregunta {currentQuestionIndex + 1}</CardTitle>
            <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
            </CardHeader>
            <CardContent>
            <RadioGroup onValueChange={setSelectedAnswer} value={selectedAnswer ?? ''} disabled={answerStatus !== 'unanswered'}>
                {currentQuestion.options.map((option, index) => (
                <Label key={index} htmlFor={`option-${index}`} className={cn("flex items-center space-x-3 p-4 rounded-md border transition-all cursor-pointer", selectedAnswer === option && "border-primary bg-primary/10")}>
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <span className="flex-1">{option}</span>
                </Label>
                ))}
            </RadioGroup>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              {answerStatus === 'unanswered' ? (
                  <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="w-full">
                  Comprobar
                  </Button>
              ) : (
                  <Button onClick={handleNextQuestion} className="w-full">
                  {currentQuestionIndex < questions.length - 1 ? "Siguiente Pregunta" : "Finalizar Prueba"}
                  </Button>
              )}
               {answerStatus !== 'unanswered' && (
                <Alert variant={answerStatus === 'correct' ? 'default' : 'destructive'} className="w-full">
                    {answerStatus === 'correct' ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                    <AlertTitle>{answerStatus === 'correct' ? '¡Correcto!' : 'Incorrecto'}</AlertTitle>
                    <AlertDescription>
                        {currentQuestion.feedback}
                        {answerStatus === 'incorrect' && ` La respuesta correcta es: ${currentQuestion.answer}`}
                    </AlertDescription>
                </Alert>
              )}
            </CardFooter>
        </Card>
    </div>
  );
}
