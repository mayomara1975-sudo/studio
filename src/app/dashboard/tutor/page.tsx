"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2, Mic, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { provideAutomatedFeedback, ProvideAutomatedFeedbackOutput } from '@/ai/flows/provide-automated-feedback';

interface Message {
  text: string;
  isUser: boolean;
  feedback?: ProvideAutomatedFeedbackOutput;
}

export default function TutorPage() {
  const { user, userLevel } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const feedbackResult = await provideAutomatedFeedback({
        answer: input,
        question: 'Conversación abierta',
        level: userLevel || 'A1',
      });
      const aiMessage: Message = {
        text: feedbackResult.correctedAnswer || "¡Entendido! Sigue practicando.",
        isUser: false,
        feedback: feedbackResult
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting feedback:", error);
      const errorMessage: Message = { text: "Lo siento, no pude procesar tu mensaje. Inténtalo de nuevo.", isUser: false };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><MessageSquare /> Tutor Personal</h1>
        <p className="text-muted-foreground">Habla con un tutor de IA en tiempo real para practicar tu español.</p>
      </div>

      <Card className="flex-1 flex flex-col shadow-lg">
        <CardHeader>
          <CardTitle>Chat de Práctica</CardTitle>
          <CardDescription>Tu nivel actual es {userLevel || "indefinido"}. ¡Empecemos a conversar!</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-end gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  {!message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/profemar-avatar.png" alt="Profemar" data-ai-hint="teacher robot"/>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 max-w-lg ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p>{message.text}</p>
                    {!message.isUser && message.feedback?.feedback && (
                       <Card className="mt-2 bg-background/50">
                        <CardHeader className="p-2">
                          <CardTitle className="text-sm font-headline">Sugerencia</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 text-sm">
                           <p>{message.feedback.feedback}</p>
                        </CardContent>
                       </Card>
                    )}
                  </div>
                   {message.isUser && (
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "U"} data-ai-hint="person"/>
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                   )}
                </div>
              ))}
               {isLoading && (
                  <div className="flex items-end gap-2 justify-start">
                     <Avatar className="h-8 w-8">
                      <AvatarImage src="/profemar-avatar.png" alt="Profemar" data-ai-hint="teacher robot"/>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 max-w-lg bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
                disabled={isLoading}
              />
               <Button type="button" variant="ghost" size="icon" disabled={isLoading}>
                <Mic className="h-5 w-5" />
                <span className="sr-only">Usar micrófono</span>
              </Button>
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
