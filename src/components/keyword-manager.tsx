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
  keyword: z.string().min(1, "Keyword cannot be empty.").max(50, "Keyword too long."),
  reply: z.string().min(1, "Reply cannot be empty.").max(500, "Reply too long."),
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
        // Ensure createdAt is a Date object
        const validatedRules = parsedRules.map(rule => ({...rule, createdAt: new Date(rule.createdAt)}));
        setRules(validatedRules);
        onRulesChange(validatedRules);
      } catch (error) {
        console.error("Failed to parse stored keyword rules:", error);
        localStorage.removeItem('whatsappAutoreplyKeywordRules'); // Clear corrupted data
      }
    } else if (initialRules.length > 0) {
       setRules(initialRules); // Use initial rules if no stored rules
       onRulesChange(initialRules);
    }
  }, []); // Removed onRulesChange and initialRules from dependencies to avoid loops/ re-initialization issues.

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
        title: "Error",
        description: "This keyword already exists.",
        variant: "destructive",
      });
      return;
    }
    setRules(prevRules => [newRule, ...prevRules]);
    form.reset();
    toast({
      title: "Success",
      description: "Keyword rule added.",
      className: "bg-primary text-primary-foreground",
    });
  };

  const deleteRule = (id: string) => {
    setRules(prevRules => prevRules.filter(rule => rule.id !== id));
    toast({
      title: "Rule Deleted",
      description: "The keyword rule has been removed.",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
          <Settings2 className="w-7 h-7 mr-2 text-primary" />
          Keyword Auto-Replies
        </CardTitle>
        <CardDescription>Define keywords and their corresponding automatic replies.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(addRule)} className="space-y-6 mb-8 p-4 border rounded-md bg-muted/20 shadow-inner">
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Keyword</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., price, hours, info" {...field} className="bg-background" />
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
                  <FormLabel className="font-semibold">Automatic Reply</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Our price list can be found at..." {...field} className="bg-background min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto" aria-label="Add Keyword Rule">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Rule
            </Button>
          </form>
        </Form>

        <Separator className="my-6" />

        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageSquareText className="w-5 h-5 mr-2 text-primary" />
          Current Rules ({rules.length})
        </h3>
        {rules.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No keyword rules defined yet.</p>
        ) : (
          <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 border rounded-md bg-card shadow hover:shadow-md transition-shadow duration-200 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-primary break-all">Keyword: <span className="font-normal text-foreground">{rule.keyword}</span></p>
                      <p className="text-sm text-muted-foreground mt-1 break-all">Reply: <span className="text-foreground">{rule.reply}</span></p>
                      <p className="text-xs text-muted-foreground mt-2">Added: {rule.createdAt.toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRule(rule.id)}
                      className="text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                      aria-label={`Delete rule for keyword ${rule.keyword}`}
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
