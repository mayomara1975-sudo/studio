"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2, User, Mic, PlayCircle, PauseCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { provideAutomatedFeedback, ProvideAutomatedFeedbackOutput } from '@/ai/flows/provide-automated-feedback';
import { textToSpeech, TextToSpeechOutput } from '@/ai/flows/text-to-speech';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  feedback?: ProvideAutomatedFeedbackOutput;
  audioUrl?: string;
  isPlaying?: boolean;
}

export default function TutorPage() {
  const { user, userLevel } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const playAudio = (audioUrl: string, messageId: string) => {
    if (audioRef.current && audioRef.current.src === audioUrl && !audioRef.current.paused) {
        audioRef.current.pause();
        setMessages(prev => prev.map(m => m.id === messageId ? {...m, isPlaying: false} : m));
        return;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
       setMessages(prev => prev.map(m => ({...m, isPlaying: false})));
    }

    const newAudio = new Audio(audioUrl);
    audioRef.current = newAudio;
    newAudio.play();
    setMessages(prev => prev.map(m => m.id === messageId ? {...m, isPlaying: true} : m));
    newAudio.onended = () => {
         setMessages(prev => prev.map(m => m.id === messageId ? {...m, isPlaying: false} : m));
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageId = new Date().toISOString();
    const userMessage: Message = { id: userMessageId, text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const feedbackResult = await provideAutomatedFeedback({
        answer: input,
        question: 'Conversación abierta',
        level: userLevel || 'A1',
      });
      
      const aiMessageText = feedbackResult.correctedAnswer || "¡Entendido! Sigue practicando.";
      const aiMessageId = new Date().toISOString() + 'ai';
      const aiMessage: Message = {
        id: aiMessageId,
        text: aiMessageText,
        isUser: false,
        feedback: feedbackResult
      };
      setMessages((prev) => [...prev, aiMessage]);

      setAudioLoading(aiMessageId);
      const ttsResult = await textToSpeech({ text: aiMessageText });
      setMessages((prev) => prev.map(m => m.id === aiMessageId ? {...m, audioUrl: ttsResult.audio} : m));
      setAudioLoading(null);

    } catch (error) {
      console.error("Error getting feedback:", error);
      const errorMessageId = new Date().toISOString() + 'error';
      const errorMessage: Message = { id:errorMessageId, text: "Lo siento, no pude procesar tu mensaje. Inténtalo de nuevo.", isUser: false };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setAudioLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><MessageSquare /> Tutor Personal</h1>
        <p className="text-muted-foreground">Habla con un tutor de IA en tiempo real para practicar tu español. ¡Ahora con voz!</p>
      </div>

      <Card className="flex-1 flex flex-col shadow-lg">
        <CardHeader>
          <CardTitle>Chat de Práctica</CardTitle>
          <CardDescription>Tu nivel actual es {userLevel || "indefinido"}. ¡Empecemos a conversar!</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-end gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  {!message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/profemar-avatar.png" alt="Profemar" data-ai-hint="teacher robot"/>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 max-w-lg ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p>{message.text}</p>
                    {!message.isUser && (
                        <div className="mt-2">
                        {audioLoading === message.id && (
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                <span>Generando audio...</span>
                             </div>
                        )}
                        {message.audioUrl && (
                             <Button variant="ghost" size="sm" onClick={() => playAudio(message.audioUrl!, message.id)}>
                                {message.isPlaying ? <PauseCircle className="mr-2"/> : <PlayCircle className="mr-2"/>}
                                {message.isPlaying ? 'Pausar' : 'Escuchar'}
                            </Button>
                        )}
                        {message.feedback?.feedback && (
                           <Card className="mt-2 bg-background/50">
                            <CardHeader className="p-2">
                            <CardTitle className="text-sm font-headline">Sugerencia</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 text-sm">
                            <p className="whitespace-pre-wrap">{message.feedback.feedback}</p>
                            </CardContent>
                           </Card>
                        )}
                        </div>
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
               {isLoading && !messages.some(m => !m.isUser) && (
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
               <Button type="button" variant="ghost" size="icon" disabled={true} title="Próximamente">
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
