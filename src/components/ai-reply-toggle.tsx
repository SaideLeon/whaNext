"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bot } from 'lucide-react';

interface AiReplyToggleProps {
  onToggle: (enabled: boolean) => void;
  initialState?: boolean;
}

export function AiReplyToggle({ onToggle, initialState = false }: AiReplyToggleProps) {
  const [isEnabled, setIsEnabled] = useState(initialState);

  useEffect(() => {
    const storedState = localStorage.getItem('whatsappAutoreplyAiEnabled');
    if (storedState !== null) {
      const parsedState = storedState === 'true';
      setIsEnabled(parsedState);
      onToggle(parsedState); 
    } else if (initialState !== undefined) {
       setIsEnabled(initialState); 
       onToggle(initialState);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem('whatsappAutoreplyAiEnabled', String(checked));
    onToggle(checked);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
          <Bot className="w-7 h-7 mr-2 text-primary" />
          Respostas Inteligentes com IA
        </CardTitle>
        <CardDescription>Ative a IA para gerar respostas se nenhuma palavra-chave corresponder.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-2 p-4 border rounded-md bg-muted/20 shadow-inner">
          <Label htmlFor="ai-reply-switch" className="text-base font-medium">
            Ativar Respostas Inteligentes com IA
          </Label>
          <Switch
            id="ai-reply-switch"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            aria-label="Alternar Respostas Inteligentes com IA"
          />
        </div>
        {isEnabled && (
          <p className="text-sm text-muted-foreground mt-3 p-1">
            Quando ativado, se uma mensagem recebida não corresponder a nenhuma palavra-chave, nossa IA tentará gerar uma resposta apropriada.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
