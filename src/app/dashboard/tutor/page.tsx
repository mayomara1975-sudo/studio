import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function TutorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><MessageSquare /> Tutor Personal</h1>
        <p className="text-muted-foreground">Habla con un tutor de IA en tiempo real.</p>
      </div>

      <Card className="flex flex-col items-center justify-center text-center h-96 border-dashed border-2">
        <CardHeader>
          <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="mt-4 font-headline text-2xl">Próximamente</CardTitle>
          <CardDescription className="max-w-md mx-auto">La función de tutor personal con IA en tiempo real está en desarrollo. ¡Estamos trabajando para que puedas practicar tu conversación muy pronto!</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
