"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRight, CheckCircle, Lock } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';

const exercises = [
    // A1
    { id: 'greetings', title: 'Saludos y Presentaciones', description: 'Practica cómo saludar y presentarte en situaciones formales e informales.', level: 'A1', href: "/dashboard/exercises/greetings" },
    { id: 'articles', title: 'Artículos y Género', description: 'Usa correctamente los artículos definidos e indefinidos.', level: 'A1' },
    { id: 'present-tense', title: 'Presente de Indicativo', description: 'Conjuga verbos regulares e irregulares en presente.', level: 'A1' },
    
    // A2
    { id: 'ser-estar', title: 'Ser vs. Estar', description: 'Domina la diferencia entre estos dos verbos esenciales.', level: 'A2' },
    { id: 'past-tense', title: 'Pretérito Perfecto', description: 'Aprende a hablar de acciones pasadas.', level: 'A2' },
    { id: 'adjectives', title: 'Adjetivos: Concordancia y Posición', description: 'Aprende a describir cosas y personas.', level: 'A2' },
    { id: 'gustar', title: 'Verbos como Gustar', description: 'Aprende a usar verbos que funcionan de manera diferente.', level: 'A2' },
    { id: 'comparisons', title: 'Comparativos y Superlativos', description: 'Compara personas, cosas y situaciones.', level: 'A2' },
   
    // B1
    { id: 'imperfect-tense', title: 'Pretérito Imperfecto', description: 'Describe situaciones y hábitos en el pasado.', level: 'B1' },
    { id: 'future-tense', title: 'Futuro Simple', description: 'Habla sobre tus planes y predicciones.', level: 'B1' },
    { id: 'por-para', title: 'Por vs. Para', description: 'Entiende las diferencias de uso.', level: 'B1' },
    { id: 'pronouns', title: 'Pronombres de Objeto Directo e Indirecto', description: 'Usa los pronombres para evitar repeticiones.', level: 'B1' },
    { id: 'commands', title: 'Imperativo (Mandatos)', description: 'Da órdenes y sugerencias formal e informalmente.', level: 'B1' },

    // B2
    { id: 'subjunctive-present', title: 'Subjuntivo Presente', description: 'Expresa deseos, dudas y emociones.', level: 'B2' },
    { id: 'conditional', title: 'Condicional Simple', description: 'Habla de situaciones hipotéticas.', level: 'B2' },
    { id: 'passive-voice', title: 'La Voz Pasiva', description: 'Aprende a usar la pasiva con "ser" y la pasiva refleja.', level: 'B2' },
    { id: 'connectors', title: 'Conectores Discursivos', description: 'Mejora la fluidez de tu discurso.', level: 'B2' },

    // C1
    { id: 'pluscuamperfecto', title: 'Pretérito Pluscuamperfecto', description: 'Habla de una acción pasada anterior a otra.', level: 'C1' },
    { id: 'subjunctive-imperfect', title: 'Subjuntivo Imperfecto', description: 'Úsalo en cláusulas subordinadas en el pasado.', level: 'C1' },
    { id: 'idioms', title: 'Expresiones Idiomáticas', description: 'Habla como un nativo con frases hechas populares.', level: 'C1' },

    // C2
    { id: 'formal-writing', title: 'Escritura Formal', description: 'Aprende a redactar correos y textos formales.', level: 'C2' },
];

export default function ExercisesPage() {
  const { completedExercises } = useAuth();
  
  const getIsLocked = (index: number) => {
    if (index === 0) return false; // First exercise is always unlocked
    const previousExercise = exercises[index - 1];
    return !completedExercises.includes(previousExercise.id);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><CheckSquare /> Ejercicios Prácticos</h1>
        <p className="text-muted-foreground">Pon a prueba tus conocimientos con estas actividades interactivas. Completa un ejercicio para desbloquear el siguiente.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise, index) => {
          const isCompleted = completedExercises.includes(exercise.id);
          const isLocked = getIsLocked(index);

          return (
            <Card key={exercise.id} className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ${isLocked ? 'bg-muted/50 opacity-60' : 'bg-card'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="pt-2">{exercise.title}</CardTitle>
                   {isCompleted ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1"/>Completado</Badge>
                   ) : (
                      <Badge variant="secondary">{exercise.level}</Badge>
                   )}
                </div>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter>
                 {isLocked ? (
                    <Button disabled className="w-full">
                        <Lock className="mr-2 h-4 w-4" /> Bloqueado
                    </Button>
                ) : (
                    <Button asChild className="w-full" disabled={!exercise.href}>
                       {exercise.href ? (
                         <Link href={exercise.href}>
                            {isCompleted ? 'Repetir Ejercicio' : 'Empezar Ejercicio'} <ArrowRight className="ml-2 h-4 w-4" />
                         </Link>
                       ) : (
                         <span className="w-full text-center">
                            {isCompleted ? 'Repetir Ejercicio' : 'Empezar Ejercicio'} <ArrowRight className="ml-2 h-4 w-4 inline" />
                         </span>
                       )}
                    </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
