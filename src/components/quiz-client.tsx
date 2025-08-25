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
import { useAuth } from "@/context/auth-context";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type QuizState = "loading" | "ongoing" | "finished";
type AnswerStatus = "unanswered" | "correct" | "incorrect";

interface UserAnswer {
    question: string;
    options: string[];
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    feedback: string;
}

export function QuizClient() {
  const { user, updateUserLevel } = useAuth();
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [questions, setQuestions] = useState<GenerateQuizQuestionsOutput["questions"]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>("unanswered");
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
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
    setUserAnswers([...userAnswers, { 
        question: currentQuestion.question, 
        options: currentQuestion.options,
        selectedAnswer: selectedAnswer,
        correctAnswer: currentQuestion.answer,
        isCorrect,
        feedback: currentQuestion.feedback
    }]);
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
        const quizResponses = userAnswers.map(ua => `Pregunta: ${ua.question}\nRespuesta del usuario: ${ua.selectedAnswer} (Correcta: ${ua.correctAnswer})`).join("\n---\n");
        const result = await analyzeProficiencyLevel({ quizResponses: quizResponses });
        setProficiencyResult(result);
        if(user && result.proficiencyLevel) {
            updateUserLevel(result.proficiencyLevel);
            const quizResultRef = doc(db, `users/${user.uid}/quizHistory`, new Date().toISOString());
            await setDoc(quizResultRef, {
                level: result.proficiencyLevel,
                reasoning: result.reasoning,
                responses: userAnswers,
                completedAt: new Date()
            });
        }
      } catch (error) {
        console.error("Failed to analyze proficiency:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (quizState === "loading" || !currentQuestion) {
    return (
        <Card className="mt-4 shadow-xl border-none">
            <CardHeader><Skeleton className="h-6 w-3/5" /></CardHeader>
            <CardContent className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter><Skeleton className="h-12 w-full" /></CardFooter>
        </Card>
    );
  }

  if (quizState === "finished") {
    return (
      <Card className="mt-4 shadow-lg border-none">
        <CardHeader className="text-center items-center">
          <Award className="w-16 h-16 text-primary mx-auto" />
          <CardTitle className="text-3xl font-headline mt-2">¡Prueba Completada!</CardTitle>
          <CardDescription>Estos son tus resultados. ¡Excelente trabajo!</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitting ? (
            <div className="flex flex-col items-center gap-4 p-8">
              <p className="font-semibold text-lg">Analizando tus respuestas...</p>
              <Skeleton className="w-32 h-32 rounded-full" />
              <Skeleton className="h-8 w-4/5 mt-4" />
            </div>
          ) : proficiencyResult ? (
            <div className="space-y-6">
              <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-semibold tracking-wider uppercase">Tu Nivel de Proficiencia</p>
                <p className="text-7xl font-bold font-headline text-primary">{proficiencyResult.proficiencyLevel}</p>
              </div>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle className="font-headline text-lg">Análisis de la IA</AlertTitle>
                <AlertDescription className="text-base whitespace-pre-wrap">{proficiencyResult.reasoning}</AlertDescription>
              </Alert>
            </div>
          ) : <p className="text-center text-destructive">Hubo un error al analizar tus resultados.</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4">
        <div className="flex items-center gap-4 mb-4">
            <Progress value={progress} className="flex-1 h-3" />
            <span className="text-sm font-semibold text-muted-foreground">{currentQuestionIndex + 1} / {questions.length}</span>
        </div>
        <Card className="shadow-xl border-none">
            <CardHeader>
            <CardTitle className="font-headline text-2xl">Pregunta {currentQuestionIndex + 1}</CardTitle>
            <CardDescription className="text-xl pt-2 text-foreground">{currentQuestion.question}</CardDescription>
            </CardHeader>
            <CardContent>
            <RadioGroup onValueChange={setSelectedAnswer} value={selectedAnswer ?? ''} disabled={answerStatus !== 'unanswered'}>
                <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                    <Label key={index} htmlFor={`option-${index}`} 
                        className={cn("flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer text-base hover:border-primary", 
                        selectedAnswer === option && "border-primary bg-primary/10 ring-2 ring-primary",
                        answerStatus !== 'unanswered' && option === currentQuestion.answer && "border-green-500 bg-green-500/10",
                        answerStatus === 'incorrect' && selectedAnswer === option && "border-destructive bg-destructive/10"
                        )}>
                        <RadioGroupItem value={option} id={`option-${index}`} className="h-5 w-5"/>
                        <span className="flex-1">{option}</span>
                    </Label>
                ))}
                </div>
            </RadioGroup>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              {answerStatus === 'unanswered' ? (
                  <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="w-full h-12 text-lg">
                    Comprobar
                  </Button>
              ) : (
                  <Button onClick={handleNextQuestion} className="w-full h-12 text-lg">
                  {currentQuestionIndex < questions.length - 1 ? "Siguiente Pregunta" : "Finalizar Prueba"}
                  </Button>
              )}
               {answerStatus !== 'unanswered' && (
                <Alert variant={answerStatus === 'correct' ? 'default' : 'destructive'} className="w-full border-2">
                    {answerStatus === 'correct' ? <ThumbsUp className="h-5 w-5" /> : <ThumbsDown className="h-5 w-5" />}
                    <AlertTitle className="text-lg">{answerStatus === 'correct' ? '¡Correcto!' : 'Incorrecto'}</AlertTitle>
                    <AlertDescription className="text-base">
                        {currentQuestion.feedback}
                        {answerStatus === 'incorrect' && ` La respuesta correcta es: **${currentQuestion.answer}**`}
                    </AlertDescription>
                </Alert>
              )}
            </CardFooter>
        </Card>
    </div>
  );
}
