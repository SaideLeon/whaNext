"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, MessageSquareText, Settings2 } from 'lucide-react';
import type { KeywordRule } from '@/types';

const keywordRuleSchema = z.object({
  keyword: z.string().min(1, "A palavra-chave não pode estar vazia.").max(50, "Palavra-chave muito longa."),
  reply: z.string().min(1, "A resposta não pode estar vazia.").max(500, "Resposta muito longa."),
});

type KeywordRuleFormData = z.infer<typeof keywordRuleSchema>;

interface KeywordManagerProps {
  onRulesChange: (rules: KeywordRule[]) => void;
  initialRules?: KeywordRule[];
}

export function KeywordManager({ onRulesChange, initialRules = [] }: KeywordManagerProps) {
  const [rules, setRules] = useState<KeywordRule[]>(initialRules);
  const { toast } = useToast();

  const form = useForm<KeywordRuleFormData>({
    resolver: zodResolver(keywordRuleSchema),
    defaultValues: {
      keyword: '',
      reply: '',
    },
  });

  useEffect(() => {
    const storedRules = localStorage.getItem('whatsappAutoreplyKeywordRules');
    if (storedRules) {
      try {
        const parsedRules = JSON.parse(storedRules) as KeywordRule[];
        const validatedRules = parsedRules.map(rule => ({...rule, createdAt: new Date(rule.createdAt)}));
        setRules(validatedRules);
        onRulesChange(validatedRules);
      } catch (error) {
        console.error("Falha ao analisar as regras de palavras-chave armazenadas:", error);
        localStorage.removeItem('whatsappAutoreplyKeywordRules'); 
      }
    } else if (initialRules.length > 0) {
       setRules(initialRules); 
       onRulesChange(initialRules);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    localStorage.setItem('whatsappAutoreplyKeywordRules', JSON.stringify(rules));
    onRulesChange(rules);
  }, [rules, onRulesChange]);

  const addRule: SubmitHandler<KeywordRuleFormData> = (data) => {
    const newRule: KeywordRule = {
      id: Date.now().toString(),
      keyword: data.keyword.toLowerCase().trim(),
      reply: data.reply.trim(),
      createdAt: new Date(),
    };
    if (rules.some(rule => rule.keyword === newRule.keyword)) {
      toast({
        title: "Erro",
        description: "Esta palavra-chave já existe.",
        variant: "destructive",
      });
      return;
    }
    setRules(prevRules => [newRule, ...prevRules]);
    form.reset();
    toast({
      title: "Sucesso",
      description: "Regra de palavra-chave adicionada.",
      className: "bg-primary text-primary-foreground",
    });
  };

  const deleteRule = (id: string) => {
    setRules(prevRules => prevRules.filter(rule => rule.id !== id));
    toast({
      title: "Regra Excluída",
      description: "A regra de palavra-chave foi removida.",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
          <Settings2 className="w-7 h-7 mr-2 text-primary" />
          Respostas Automáticas por Palavra-chave
        </CardTitle>
        <CardDescription>Defina palavras-chave e suas respostas automáticas correspondentes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(addRule)} className="space-y-6 mb-8 p-4 border rounded-md bg-muted/20 shadow-inner">
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Palavra-chave</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: preço, horário, informações" {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Resposta Automática</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ex: Nossa lista de preços pode ser encontrada em..." {...field} className="bg-background min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto" aria-label="Adicionar Regra de Palavra-chave">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Regra
            </Button>
          </form>
        </Form>

        <Separator className="my-6" />

        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageSquareText className="w-5 h-5 mr-2 text-primary" />
          Regras Atuais ({rules.length})
        </h3>
        {rules.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhuma regra de palavra-chave definida ainda.</p>
        ) : (
          <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 border rounded-md bg-card shadow hover:shadow-md transition-shadow duration-200 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-primary break-all">Palavra-chave: <span className="font-normal text-foreground">{rule.keyword}</span></p>
                      <p className="text-sm text-muted-foreground mt-1 break-all">Resposta: <span className="text-foreground">{rule.reply}</span></p>
                      <p className="text-xs text-muted-foreground mt-2">Adicionada em: {rule.createdAt.toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRule(rule.id)}
                      className="text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                      aria-label={`Excluir regra para a palavra-chave ${rule.keyword}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
