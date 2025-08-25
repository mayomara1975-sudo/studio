import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Book, CheckSquare, PenSquare, TestTube2 } from 'lucide-react';

const features = [
  {
    title: "Prueba de Nivel",
    description: "Descubre tu nivel de español con nuestra prueba de IA.",
    href: "/dashboard/quiz",
    icon: TestTube2,
    cta: "Empezar prueba"
  },
  {
    title: "Lecciones Interactivas",
    description: "Aprende con lecciones personalizadas y dinámicas.",
    href: "/dashboard/lessons",
    icon: Book,
    cta: "Ver lecciones"
  },
  {
    title: "Ejercicios Prácticos",
    description: "Mejora tus habilidades con ejercicios de conversación.",
    href: "/dashboard/exercises",
    icon: CheckSquare,
    cta: "Practicar ahora"
  },
  {
    title: "Corrector de Texto",
    description: "Obtén feedback instantáneo en tus textos.",
    href: "/dashboard/corrector",
    icon: PenSquare,
    cta: "Corregir texto"
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">¡Hola, bienvenido a ProfeAI!</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu progreso y las actividades disponibles.</p>
      </div>

      <Card className="bg-primary/10 border-primary shadow-lg">
        <CardHeader>
          <CardTitle>Tu Nivel Actual</CardTitle>
          <CardDescription>Completa la prueba de nivel para empezar tu aventura de aprendizaje.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-primary">--</div>
            <Button asChild>
              <Link href="/dashboard/quiz">
                Hacer la prueba <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
              <feature.icon className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={feature.href}>{feature.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
