import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRight } from "lucide-react";
import { Badge } from '@/components/ui/badge';

const exercises = [
  {
    title: "Saludos y Presentaciones",
    description: "Practica cómo saludar y presentarte en situaciones formales e informales.",
    level: "A1",
    href: "/dashboard/exercises/greetings"
  },
  {
    title: "Ser vs. Estar",
    description: "Domina la diferencia entre estos dos verbos esenciales.",
    level: "A2",
    href: "/dashboard/lessons" // Temporarily points to lessons, should be a new page.
  }
];

export default function ExercisesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><CheckSquare /> Ejercicios Prácticos</h1>
        <p className="text-muted-foreground">Pon a prueba tus conocimientos con estas actividades interactivas.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise) => (
          <Card key={exercise.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="pt-2">{exercise.title}</CardTitle>
                <Badge variant="secondary">{exercise.level}</Badge>
              </div>
              <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={exercise.href}>
                  Empezar Ejercicio <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
         <Card className="flex flex-col items-center justify-center text-center border-dashed border-2">
            <CardHeader>
              <CardTitle>Próximamente</CardTitle>
              <CardDescription>Estamos preparando más ejercicios para ti.</CardDescription>
            </CardHeader>
          </Card>
      </div>
    </div>
  );
}
