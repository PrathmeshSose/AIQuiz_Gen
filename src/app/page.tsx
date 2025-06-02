'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { summarizeContent, type SummarizeContentOutput } from '@/ai/flows/summarize-content';
import { generateQuizQuestions, type GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions';
import { ClipboardType, FileText, Link as LinkIcon, Loader2, BookText, ListChecks, Settings2 } from 'lucide-react';

type QuizQuestion = GenerateQuizQuestionsOutput['questions'][0];

export default function QuizifyPage() {
  const [activeTab, setActiveTab] = useState<string>('paste');
  const [rawContent, setRawContent] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);

  const { toast } = useToast();

  const handleTxtUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        try {
          const text = await file.text();
          setRawContent(text);
          toast({ title: 'TXT file loaded successfully!', description: 'Content loaded into the text area.' });
        } catch (error) {
          console.error('Error reading TXT file:', error);
          toast({ title: 'Error reading file', description: 'Could not read the TXT file.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'Invalid file type', description: 'Please upload a .txt file.', variant: 'destructive' });
      }
      // Reset file input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  const handleSummarizeContent = async () => {
    if (!rawContent.trim()) {
      toast({ title: 'Content is empty', description: 'Please provide some content to summarize.', variant: 'destructive' });
      return;
    }
    setIsLoadingSummary(true);
    setSummary(''); // Clear previous summary
    setQuizQuestions([]); // Clear previous quiz
    setUserAnswers({}); // Clear previous answers
    try {
      const result: SummarizeContentOutput = await summarizeContent({ content: rawContent });
      setSummary(result.summary);
      toast({ title: 'Content summarized successfully!' });
    } catch (error) {
      console.error('Error summarizing content:', error);
      toast({ title: 'Summarization failed', description: 'Could not summarize the content. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!summary.trim()) {
      toast({ title: 'Summary is empty', description: 'Please summarize content first to generate a quiz.', variant: 'destructive' });
      return;
    }
    setIsLoadingQuiz(true);
    setQuizQuestions([]); // Clear previous quiz
    setUserAnswers({}); // Clear previous answers
    try {
      // As per user request, quiz is generated from summarized content
      const result: GenerateQuizQuestionsOutput = await generateQuizQuestions({ content: summary });
      if (result.questions && result.questions.length > 0) {
        setQuizQuestions(result.questions);
        toast({ title: 'Quiz generated successfully!' });
      } else {
        setQuizQuestions([]);
        toast({ title: 'Quiz Generation', description: 'No questions were generated. The summary might be too short or unsuitable.', variant: 'default' });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({ title: 'Quiz generation failed', description: 'Could not generate the quiz. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleQuizAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center">
          <Settings2 className="mr-3 h-10 w-10" /> Quizify AI
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload content, get summaries, and generate interactive quizzes effortlessly.
        </p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <ClipboardType className="mr-2 h-6 w-6 text-accent" /> 1. Provide Your Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="paste" className="text-xs sm:text-sm">
                <ClipboardType className="mr-1 sm:mr-2 h-4 w-4" /> Paste Text
              </TabsTrigger>
              <TabsTrigger value="txt" className="text-xs sm:text-sm">
                <FileText className="mr-1 sm:mr-2 h-4 w-4" /> Upload .TXT
              </TabsTrigger>
              <TabsTrigger value="pdf" className="text-xs sm:text-sm">
                <FileText className="mr-1 sm:mr-2 h-4 w-4" /> Upload .PDF
              </TabsTrigger>
              <TabsTrigger value="url" className="text-xs sm:text-sm">
                <LinkIcon className="mr-1 sm:mr-2 h-4 w-4" /> Enter URL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="paste">
              <Textarea
                placeholder="Paste your content here..."
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                rows={10}
                className="border-primary focus:ring-primary"
              />
            </TabsContent>
            <TabsContent value="txt">
              <Input type="file" accept=".txt" onChange={handleTxtUpload} className="cursor-pointer file:text-primary file:font-semibold hover:file:bg-accent/10" />
              <p className="text-sm text-muted-foreground mt-2">
                Upload a plain text (.txt) file. The content will appear in the 'Paste Text' tab.
              </p>
            </TabsContent>
            <TabsContent value="pdf">
              <Input type="file" accept=".pdf" className="cursor-pointer file:text-primary file:font-semibold hover:file:bg-accent/10" disabled/>
              <p className="text-sm text-muted-foreground mt-2">
                PDF processing is coming soon! For now, please copy the text from your PDF and paste it into the &quot;Paste Text&quot; tab.
              </p>
            </TabsContent>
            <TabsContent value="url">
              <Input type="url" placeholder="https://example.com" className="border-primary focus:ring-primary" disabled/>
              <p className="text-sm text-muted-foreground mt-2">
                Direct URL processing is coming soon! For now, please copy the relevant content from the webpage and paste it into the &quot;Paste Text&quot; tab.
              </p>
            </TabsContent>
          </Tabs>
          <Button
            onClick={handleSummarizeContent}
            disabled={!rawContent.trim() || isLoadingSummary || isLoadingQuiz}
            className="mt-6 w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isLoadingSummary ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <BookText className="mr-2 h-5 w-5" />
            )}
            Summarize Content
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card className="mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <BookText className="mr-2 h-6 w-6 text-accent" /> 2. Content Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary/50 rounded-md border border-primary/20 max-h-60 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </div>
            <Button
              onClick={handleGenerateQuiz}
              disabled={isLoadingQuiz || !summary.trim()}
              className="mt-6 w-full sm:w-auto bg-accent hover:bg-accent/90"
            >
              {isLoadingQuiz ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <ListChecks className="mr-2 h-5 w-5" />
              )}
              Generate Quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {quizQuestions.length > 0 && (
        <Card className="mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
               <ListChecks className="mr-2 h-6 w-6 text-accent" /> 3. Interactive Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {quizQuestions.map((q, index) => (
                <div key={index} className="p-4 border border-primary/30 rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
                  <p className="font-semibold mb-3 text-base text-primary">
                    {index + 1}. {q.question}
                  </p>
                  <RadioGroup
                    onValueChange={(value) => handleQuizAnswerChange(index, value)}
                    value={userAnswers[index] || ''}
                    className="space-y-2"
                  >
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/10 transition-colors">
                        <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} className="border-primary text-primary focus:ring-primary"/>
                        <Label htmlFor={`q${index}-opt${optIndex}`} className="text-sm cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {userAnswers[index] && userAnswers[index] === q.answer && (
                     <p className="text-xs mt-2 text-green-600 font-medium">Correct Answer: {q.answer}</p>
                  )}
                   {userAnswers[index] && userAnswers[index] !== q.answer && (
                     <p className="text-xs mt-2 text-red-600 font-medium">Correct Answer: {q.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
       <footer className="text-center mt-12 py-4 text-sm text-muted-foreground border-t">
        Powered by AI & Next.js | Quizify AI &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
