"use client";

import { useState, useCallback, useEffect } from 'react';
import { WhatsAppConnector } from '@/components/whatsapp-connector';
import { KeywordManager } from '@/components/keyword-manager';
import { AiReplyToggle } from '@/components/ai-reply-toggle';
import { callGenerateKeywordReplies, callGenerateSmartReply } from '@/app/actions';
import type { KeywordRule } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Inbox } from 'lucide-react';

interface MessageLog {
  id: string;
  type: 'incoming' | 'outgoing' | 'info';
  text: string;
  timestamp: Date;
}

export function AppDashboard() {
  const [keywordRules, setKeywordRules] = useState<KeywordRule[]>([]);
  const [isAiReplyEnabled, setIsAiReplyEnabled] = useState<boolean>(false);
  const [isWhatsAppReady, setIsWhatsAppReady] = useState<boolean>(false);
  const [messageLog, setMessageLog] = useState<MessageLog[]>([]);
  const { toast } = useToast();

  const addMessageToLog = useCallback((text: string, type: MessageLog['type']) => {
    setMessageLog(prev => [...prev, { id: Date.now().toString(), text, type, timestamp: new Date() }]);
  }, []);

  const handleKeywordRulesChange = useCallback((rules: KeywordRule[]) => {
    setKeywordRules(rules);
  }, []);

  const handleAiReplyToggle = useCallback((enabled: boolean) => {
    setIsAiReplyEnabled(enabled);
    addMessageToLog(`AI Smart Replies ${enabled ? 'enabled' : 'disabled'}.`, 'info');
  }, [addMessageToLog]);

  const handleWhatsAppReady = useCallback((isReady: boolean) => {
    setIsWhatsAppReady(isReady);
    addMessageToLog(isReady ? 'WhatsApp connection established.' : 'WhatsApp disconnected.', 'info');
  }, [addMessageToLog]);

  const processIncomingMessage = useCallback(async (messageText: string) => {
    if (!isWhatsAppReady) {
      toast({ title: "WhatsApp Not Ready", description: "Cannot process message, WhatsApp is not connected.", variant: "destructive" });
      return;
    }

    addMessageToLog(`Received: "${messageText}"`, 'incoming');

    // 1. Try keyword-based reply
    if (keywordRules.length > 0) {
      const keywords = keywordRules.map(r => r.keyword);
      const replies = keywordRules.map(r => r.reply);
      try {
        const keywordReplyResult = await callGenerateKeywordReplies({ message: messageText, keywords, replies });
        if (keywordReplyResult.reply) {
          addMessageToLog(`Auto-replying (keyword): "${keywordReplyResult.reply}"`, 'outgoing');
          // Here you would actually send the message via whatsapp-web.js
          return; 
        }
      } catch (error) {
        console.error("Error with keyword reply AI:", error);
        toast({ title: "Keyword AI Error", description: "Could not process keyword-based reply.", variant: "destructive" });
      }
    }

    // 2. If no keyword match and AI smart replies are enabled
    if (isAiReplyEnabled) {
      addMessageToLog('No keyword match. Attempting AI smart reply...', 'info');
      try {
        const smartReplyResult = await callGenerateSmartReply({ message: messageText });
        if (smartReplyResult.reply) {
          addMessageToLog(`Auto-replying (AI): "${smartReplyResult.reply}"`, 'outgoing');
          // Here you would actually send the message via whatsapp-web.js
        } else {
          addMessageToLog('AI could not generate a smart reply.', 'info');
        }
      } catch (error) {
        console.error("Error with smart reply AI:", error);
        toast({ title: "Smart Reply AI Error", description: "Could not generate smart reply.", variant: "destructive" });
         addMessageToLog('Error generating AI smart reply.', 'info');
      }
    } else {
       if (!keywordRules.some(rule => messageText.toLowerCase().includes(rule.keyword.toLowerCase()))) {
         addMessageToLog('No keyword match and AI replies are disabled. No reply sent.', 'info');
       }
    }
  }, [keywordRules, isAiReplyEnabled, isWhatsAppReady, toast, addMessageToLog]);
  
  // Simulate an incoming message for testing purposes
  useEffect(() => {
    if (isWhatsAppReady) {
      const testMessageTimer = setTimeout(() => {
        // processIncomingMessage("Can you tell me the price?");
      }, 5000); // Simulate a message 5 seconds after connection
      return () => clearTimeout(testMessageTimer);
    }
  }, [isWhatsAppReady, processIncomingMessage]);


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <WhatsAppConnector onMessage={processIncomingMessage} onReady={handleWhatsAppReady} />
      <KeywordManager onRulesChange={handleKeywordRulesChange} initialRules={keywordRules} />
      <AiReplyToggle onToggle={handleAiReplyToggle} initialState={isAiReplyEnabled} />
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-headline">
            Message Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/20 shadow-inner">
            {messageLog.length === 0 ? (
              <p className="text-muted-foreground text-center">No messages yet.</p>
            ) : (
              messageLog.map(msg => (
                <div key={msg.id} className={`mb-2 p-2 rounded-md text-sm ${
                  msg.type === 'incoming' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                  msg.type === 'outgoing' ? 'bg-green-100 dark:bg-green-900/30 text-right ml-auto max-w-[80%]' :
                  'bg-gray-100 dark:bg-gray-700/30 text-muted-foreground italic'
                }`}>
                  <div className="flex items-center mb-1">
                    {msg.type === 'incoming' && <Inbox className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />}
                    {msg.type === 'outgoing' && <Send className="w-4 h-4 mr-2 text-green-600 dark:text-green-400 ml-auto order-2" />}
                    <span className={`font-medium ${msg.type === 'outgoing' ? 'order-1' : ''}`}>
                      {msg.type === 'incoming' ? 'Received' : msg.type === 'outgoing' ? 'Sent' : 'System'}
                    </span>
                  </div>
                  <p className={`${msg.type === 'outgoing' ? '' : ''}`}>{msg.text}</p>
                  <p className={`text-xs text-muted-foreground mt-1 ${msg.type === 'outgoing' ? '' : ''}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
