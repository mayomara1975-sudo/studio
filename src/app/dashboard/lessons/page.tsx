"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function LessonsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><BookOpen /> Lección: Ser vs. Estar</h1>
        <p className="text-muted-foreground">Aprende gramática y vocabulario de forma dinámica.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <Badge variant="secondary" className="w-fit mb-2">Gramática A2</Badge>
          <CardTitle className="text-2xl font-headline">Ser vs. Estar</CardTitle>
          <CardDescription>Una de las dudas más comunes para los estudiantes de español.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-base leading-relaxed">
          <p>
            Ambos verbos, <strong>Ser</strong> y <strong>Estar</strong>, se traducen como "to be" en inglés, pero se usan en contextos diferentes. Dominar su uso es fundamental para hablar español con naturalidad.
          </p>
          
          <Separator />

          <div>
            <h3 className="font-bold text-lg font-headline mb-2">Cuándo usar "Ser"</h3>
            <p className="text-muted-foreground mb-4">
              Usamos <strong>Ser</strong> para hablar de características inherentes, permanentes o que definen a alguien o algo. Es la esencia.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Identidad y descripción:</strong> <em>Yo <strong>soy</strong> profesor. Ella <strong>es</strong> alta e inteligente.</em></li>
              <li><strong>Origen:</strong> <em><strong>Somos</strong> de México.</em></li>
              <li><strong>Material:</strong> <em>La mesa <strong>es</strong> de madera.</em></li>
              <li><strong>Hora y fecha:</strong> <em><strong>Son</strong> las tres de la tarde. Hoy <strong>es</strong> martes.</em></li>
              <li><strong>Relaciones:</strong> <em>Él <strong>es</strong> mi hermano.</em></li>
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-bold text-lg font-headline mb-2">Cuándo usar "Estar"</h3>
            <p className="text-muted-foreground mb-4">
              Usamos <strong>Estar</strong> para hablar de estados temporales, localizaciones y condiciones. Es el estado.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Localización:</strong> <em>El libro <strong>está</strong> en la mesa. Madrid <strong>está</strong> en España.</em></li>
              <li><strong>Estado de ánimo y salud:</strong> <em><strong>Estoy</strong> cansado. ¿Cómo <strong>estás</strong>?</em></li>
              <li><strong>Condiciones temporales:</strong> <em>La sopa <strong>está</strong> caliente. La puerta <strong>está</strong> abierta.</em></li>
              <li><strong>Gerundio (presente progresivo):</strong> <em><strong>Estoy</strong> estudiando español.</em></li>
            </ul>
          </div>
        </CardContent>
         <CardFooter>
            <Button asChild>
                <Link href="/dashboard/exercises">Iniciar los ejercicios</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
