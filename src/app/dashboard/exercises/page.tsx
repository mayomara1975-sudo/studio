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
  }
];

export default function ExercisesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><CheckSquare /> Ejercicios Prácticos</h1>
        <p className="text-muted-foreground">Pon a prueba tus conocimientos con estas actividades.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise) => (
          <Card key={exercise.title} className="flex flex-col shadow-lg">
            <CardHeader>
              <Badge variant="outline" className="w-fit">{exercise.level}</Badge>
              <CardTitle className="pt-2">{exercise.title}</CardTitle>
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
         <Card className="flex flex-col items-center justify-center text-center border-dashed">
            <CardHeader>
              <CardTitle>Próximamente</CardTitle>
              <CardDescription>Estamos preparando más ejercicios para ti.</CardDescription>
            </CardHeader>
          </Card>
      </div>
    </div>
  );
}
