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
      onToggle(parsedState); // Notify parent of initial state from storage
    } else if (initialState !== undefined) {
       setIsEnabled(initialState); // Use initial prop if no stored state
       onToggle(initialState);
    }
  }, []); // Removed onToggle and initialState from dependencies to avoid loops/re-initialization issues.


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
          AI Smart Replies
        </CardTitle>
        <CardDescription>Enable AI to generate replies if no keyword matches.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-2 p-4 border rounded-md bg-muted/20 shadow-inner">
          <Label htmlFor="ai-reply-switch" className="text-base font-medium">
            Enable Smart AI Replies
          </Label>
          <Switch
            id="ai-reply-switch"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            aria-label="Toggle AI Smart Replies"
          />
        </div>
        {isEnabled && (
          <p className="text-sm text-muted-foreground mt-3 p-1">
            When enabled, if an incoming message doesn't match any keywords, our AI will attempt to generate an appropriate response.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
