"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Loader2, User, Mic, PlayCircle, PauseCircle, Square } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { provideAutomatedFeedback, ProvideAutomatedFeedbackOutput } from '@/ai/flows/provide-automated-feedback';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { cn } from '@/lib/utils';

// Speech Recognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  audioUrl?: string;
  isPlaying?: boolean;
}

export default function TutorPage() {
  const { user, userLevel } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Setup Speech Recognition
  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening even after a pause
    recognition.lang = 'es-ES';
    recognition.interimResults = true; // Get results as they come in

    recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        setInput(finalTranscript + interimTranscript);
        if(finalTranscript.trim()){
            handleSendMessage(finalTranscript.trim());
            recognitionRef.current?.stop();
        }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
        setIsRecording(false);
    }

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
      if (isRecording) {
          recognitionRef.current?.stop();
      } else {
          setInput('');
          recognitionRef.current?.start();
          setIsRecording(true);
      }
  }
  
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

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessageId = new Date().toISOString();
    const userMessage: Message = { id: userMessageId, text, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const feedbackResult = await provideAutomatedFeedback({
        answer: text,
        question: 'Conversación abierta',
        level: userLevel || 'A1',
      });
      
      const aiMessageText = feedbackResult.correctedAnswer || "No he entendido bien, ¿puedes repetirlo?";
      const aiMessageId = new Date().toISOString() + 'ai';
      const aiMessage: Message = {
        id: aiMessageId,
        text: aiMessageText,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Generate audio for AI response
      setAudioLoading(aiMessageId);
      const ttsResult = await textToSpeech({ text: aiMessageText });
      setMessages((prev) => prev.map(m => m.id === aiMessageId ? {...m, audioUrl: ttsResult.audio} : m));

    } catch (error) {
      console.error("Error in conversation:", error);
      const errorMessageId = new Date().toISOString() + 'error';
      const errorMessage: Message = { id: errorMessageId, text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.", isUser: false };
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
        <p className="text-muted-foreground">Habla o escribe para practicar tu español. El tutor te corregirá y te responderá con voz.</p>
      </div>

      <Card className="flex-1 flex flex-col shadow-lg">
        <CardHeader>
          <CardTitle>Chat de Práctica</CardTitle>
          <CardDescription>Tu nivel actual es {userLevel || "indefinido"}. ¡Empecemos a conversar!</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground p-8">
                        <MessageSquare size={48} className="mx-auto mb-4" />
                        <p>Aún no hay mensajes. ¡Pulsa el micrófono y di "hola" para empezar!</p>
                    </div>
                )}
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  {!message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/profemar-avatar.png" alt="Profemar" data-ai-hint="teacher robot"/>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 max-w-lg ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p>{message.text}</p>
                    {!message.isUser && (
                        <div className="mt-2 flex flex-col items-start gap-2">
                        {audioLoading === message.id ? (
                             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin"/>
                                <span>Generando audio...</span>
                             </div>
                        ) : message.audioUrl && (
                             <Button variant="ghost" size="sm" onClick={() => playAudio(message.audioUrl!, message.id)} className="text-xs h-7">
                                {message.isPlaying ? <PauseCircle className="mr-2"/> : <PlayCircle className="mr-2"/>}
                                {message.isPlaying ? 'Pausar' : 'Escuchar'}
                            </Button>
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
               {isLoading && !isRecording && (
                  <div className="flex items-start gap-3 justify-start">
                     <Avatar className="h-8 w-8">
                      <AvatarImage src="/profemar-avatar.png" alt="Profemar" data-ai-hint="teacher robot"/>
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 max-w-lg bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input);}} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Escuchando..." : "Escribe tu mensaje o usa el micrófono..."}
                className="flex-1"
                disabled={isLoading || isRecording}
              />
               <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={toggleRecording} disabled={!SpeechRecognition || isLoading} title="Usar micrófono">
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                <span className="sr-only">{isRecording ? "Dejar de grabar" : "Grabar voz"}</span>
              </Button>
              <Button type="submit" size="icon" disabled={isLoading || isRecording || !input.trim()}>
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
