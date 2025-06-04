
'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { summarizeContent, type SummarizeContentOutput } from '@/ai/flows/summarize-content';
import { generateQuizQuestions, type GenerateQuizQuestionsInput, type GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions';
import { extractTextFromPdf, type ExtractTextFromPdfOutput } from '@/ai/flows/extract-text-from-pdf-flow';
import { extractContentFromUrl, type ExtractContentFromUrlInput, type ExtractContentFromUrlOutput } from '@/ai/flows/extract-content-from-url-flow';
import { 
  ClipboardType, FileText, Link as LinkIcon, Loader2, BookText, ListChecks, Settings2, HelpCircle, Gauge, ListOrdered, BookOpenCheck, Printer, CheckCircle2, AlertCircle, Check, X, Send
} from 'lucide-react';

type QuizQuestion = GenerateQuizQuestionsOutput['questions'][0];

export default function QuizifyPage() {
  const [activeTab, setActiveTab] = useState<string>('paste');
  const [rawContent, setRawContent] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  
  const [quizSettings, setQuizSettings] = useState<Partial<GenerateQuizQuestionsInput>>({
    subject: '',
    difficulty: 'medium',
    numQuestions: 5,
    questionFormat: 'mcq',
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const resetQuizState = () => {
    setSummary('');
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleTxtUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        setRawContent(''); 
        resetQuizState();
        try {
          const text = await file.text();
          setRawContent(text);
          toast({ title: 'TXT file loaded successfully!', description: 'Content loaded into the text area.' });
          setActiveTab('paste');
        } catch (error) {
          console.error('Error reading TXT file:', error);
          toast({ title: 'Error reading file', description: 'Could not read the TXT file.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'Invalid file type', description: 'Please upload a .txt file.', variant: 'destructive' });
      }
      event.target.value = '';
    }
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setIsLoadingPdf(true);
        setRawContent('');
        resetQuizState();

        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const pdfDataUri = reader.result as string;
            try {
              const result: ExtractTextFromPdfOutput = await extractTextFromPdf({ pdfDataUri });
              if (result.extractedText && !result.extractedText.startsWith('Error:')) {
                setRawContent(result.extractedText);
                toast({ title: 'PDF content extracted successfully!', description: 'Content loaded into the text area.' });
                setActiveTab('paste'); 
              } else {
                toast({ title: 'PDF Processing Failed', description: result.extractedText || 'Could not extract text from the PDF, or the PDF is empty/unreadable by AI.', variant: 'destructive' });
              }
            } catch (apiError) {
              console.error('Error extracting text from PDF:', apiError);
              toast({ title: 'PDF Processing Failed', description: 'An error occurred during AI processing of the PDF.', variant: 'destructive' });
            } finally {
              setIsLoadingPdf(false);
            }
          };
          reader.onerror = () => {
            console.error('Error reading PDF file for data URI conversion.');
            toast({ title: 'File Read Error', description: 'Could not read the PDF file.', variant: 'destructive' });
            setIsLoadingPdf(false);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error preparing PDF for upload:', error);
          toast({ title: 'Error processing PDF', description: 'An unexpected error occurred.', variant: 'destructive' });
          setIsLoadingPdf(false);
        }
      } else {
        toast({ title: 'Invalid file type', description: 'Please upload a .pdf file.', variant: 'destructive' });
      }
      event.target.value = '';
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast({ title: 'URL is empty', description: 'Please provide a URL to fetch content from.', variant: 'destructive' });
      return;
    }
    try {
      // Basic client-side validation for URL format
      new URL(urlInput);
    } catch (_) {
      toast({ title: 'Invalid URL', description: 'Please enter a valid URL (e.g., https://example.com).', variant: 'destructive'});
      return;
    }

    setIsLoadingUrl(true);
    setRawContent('');
    resetQuizState();
    try {
      const result: ExtractContentFromUrlOutput = await extractContentFromUrl({ url: urlInput });
      if (result.extractedText && !result.extractedText.startsWith('Error:')) {
        setRawContent(result.extractedText);
        toast({ title: 'URL content fetched successfully!', description: 'Content loaded into the text area.' });
        setActiveTab('paste');
      } else {
         toast({ title: 'URL Fetching Failed', description: result.extractedText || 'Could not extract text from the URL.', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('Error fetching content from URL:', error);
      toast({ title: 'URL Fetching Error', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoadingUrl(false);
    }
  };


  const handleSummarizeContent = async () => {
    if (!rawContent.trim()) {
      toast({ title: 'Content is empty', description: 'Please provide some content to summarize.', variant: 'destructive' });
      return;
    }
    setIsLoadingSummary(true);
    setSummary(''); 
    setQuizQuestions([]); 
    setUserAnswers({}); 
    setQuizSubmitted(false);
    try {
      const result: SummarizeContentOutput = await summarizeContent({ content: rawContent });
      if (result.summary && !result.summary.startsWith('Error:')) {
        setSummary(result.summary);
        toast({ title: 'Content summarized successfully!' });
      } else {
        setSummary('');
        toast({ title: 'Summarization Failed', description: result.summary || 'The AI could not summarize the content.', variant: 'destructive'});
      }
    } catch (error) {
      console.error('Error summarizing content:', error);
      toast({ title: 'Summarization failed', description: 'Could not summarize the content. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingSummary(false);
    }
  };
  
  const handleQuizSettingChange = (field: keyof GenerateQuizQuestionsInput, value: string | number) => {
    setQuizSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateQuiz = async () => {
    if (!summary.trim()) {
      toast({ title: 'Summary is empty', description: 'Please summarize content first to generate a quiz.', variant: 'destructive' });
      return;
    }
    setIsLoadingQuiz(true);
    setQuizQuestions([]); 
    setUserAnswers({}); 
    setQuizSubmitted(false);
    try {
      const input: GenerateQuizQuestionsInput = {
        content: summary,
        subject: quizSettings.subject || undefined,
        difficulty: quizSettings.difficulty as 'easy' | 'medium' | 'hard' || undefined,
        numQuestions: Number(quizSettings.numQuestions) || undefined,
        questionFormat: quizSettings.questionFormat as 'mcq' | 'true_false' || undefined,
      };
      const result: GenerateQuizQuestionsOutput = await generateQuizQuestions(input);
      if (result.questions && result.questions.length > 0) {
        setQuizQuestions(result.questions);
        toast({ title: 'Quiz generated successfully!' });
      } else {
        setQuizQuestions([]);
        toast({ title: 'Quiz Generation Failed', description: 'No questions were generated. The summary might be too short, or the AI could not fulfill the request with the current settings.', variant: 'default' });
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

  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    toast({ title: 'Quiz Submitted!', description: `You scored ${score} out of ${quizQuestions.length}.`});
  };

  const handlePrint = () => {
    window.print();
  };

  const anyLoading = isLoadingSummary || isLoadingQuiz || isLoadingPdf || isLoadingUrl;
  const allQuestionsAnswered = Object.keys(userAnswers).length === quizQuestions.length && quizQuestions.length > 0;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl">
      <header className="mb-8 text-center no-print">
        <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center">
          <Settings2 className="mr-3 h-10 w-10" /> Quizify AI
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload content, get summaries, and generate interactive quizzes effortlessly.
        </p>
      </header>

      <Card className="shadow-xl no-print">
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
                placeholder="Paste your content here, or it will appear here after uploading a file or fetching from a URL."
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                rows={10}
                className="border-primary focus:ring-primary"
                disabled={anyLoading}
              />
            </TabsContent>
            <TabsContent value="txt">
              <Input 
                type="file" 
                accept=".txt" 
                onChange={handleTxtUpload} 
                className="cursor-pointer file:text-primary file:font-semibold hover:file:bg-accent/10" 
                disabled={anyLoading}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Upload a plain text (.txt) file. The content will appear in the 'Paste Text' tab.
              </p>
            </TabsContent>
            <TabsContent value="pdf">
              <Input 
                type="file" 
                accept=".pdf" 
                onChange={handlePdfUpload} 
                className="cursor-pointer file:text-primary file:font-semibold hover:file:bg-accent/10" 
                disabled={anyLoading}
              />
              {isLoadingPdf ? (
                 <p className="text-sm text-muted-foreground mt-2 flex items-center">
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing PDF... This may take a moment.
                 </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a PDF (.pdf) file. Extracted text will appear in the 'Paste Text' tab.
                </p>
              )}
            </TabsContent>
            <TabsContent value="url">
              <div className="flex space-x-2">
                <Input 
                  type="url" 
                  placeholder="https://example.com/article" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="border-primary focus:ring-primary flex-grow" 
                  disabled={anyLoading}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUrlSubmit(); }}
                />
                <Button onClick={handleUrlSubmit} disabled={anyLoading || !urlInput.trim()} className="bg-primary hover:bg-primary/90">
                  {isLoadingUrl ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              {isLoadingUrl ? (
                <p className="text-sm text-muted-foreground mt-2 flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching and processing URL content...
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Enter a public URL. The AI will attempt to extract the main content, which will appear in the 'Paste Text' tab.
                </p>
              )}
            </TabsContent>
          </Tabs>
          <Button
            onClick={handleSummarizeContent}
            disabled={!rawContent.trim() || anyLoading}
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
        <Card className="mt-8 shadow-xl no-print">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <BookText className="mr-2 h-6 w-6 text-accent" /> 2. Content Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-secondary/50 rounded-md border border-primary/20 max-h-60 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card className="mt-8 shadow-xl no-print">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <Settings2 className="mr-2 h-6 w-6 text-accent" /> 3. Quiz Settings
            </CardTitle>
            <CardDescription>Customize your quiz generation preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quizSubject" className="flex items-center mb-1">
                  <BookOpenCheck className="mr-2 h-4 w-4 text-muted-foreground" /> Subject (Optional)
                </Label>
                <Input 
                  id="quizSubject" 
                  placeholder="e.g., Biology, History" 
                  value={quizSettings.subject || ''}
                  onChange={(e) => handleQuizSettingChange('subject', e.target.value)}
                  disabled={isLoadingQuiz || anyLoading}
                />
              </div>
              <div>
                <Label htmlFor="numQuestions" className="flex items-center mb-1">
                  <ListOrdered className="mr-2 h-4 w-4 text-muted-foreground" /> Number of Questions
                </Label>
                <Input 
                  id="numQuestions" 
                  type="number" 
                  min="1"
                  max="20"
                  value={quizSettings.numQuestions || ''}
                  onChange={(e) => handleQuizSettingChange('numQuestions', parseInt(e.target.value, 10))}
                  disabled={isLoadingQuiz || anyLoading}
                  placeholder="e.g., 5"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quizDifficulty" className="flex items-center mb-1">
                  <Gauge className="mr-2 h-4 w-4 text-muted-foreground" /> Difficulty
                </Label>
                <Select 
                  value={quizSettings.difficulty || 'medium'} 
                  onValueChange={(value) => handleQuizSettingChange('difficulty', value)}
                  disabled={isLoadingQuiz || anyLoading}
                >
                  <SelectTrigger id="quizDifficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="questionFormat" className="flex items-center mb-1">
                  <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Question Format
                </Label>
                <Select 
                  value={quizSettings.questionFormat || 'mcq'} 
                  onValueChange={(value) => handleQuizSettingChange('questionFormat', value)}
                  disabled={isLoadingQuiz || anyLoading}
                >
                  <SelectTrigger id="questionFormat">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <Button
              onClick={handleGenerateQuiz}
              disabled={isLoadingQuiz || !summary.trim() || anyLoading}
              className="mt-4 w-full sm:w-auto bg-accent hover:bg-accent/90"
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
        <Card className="mt-8 shadow-xl" id="printableArea">
           <div className="printable-quiz-title hidden print:block">
             Quiz {quizSettings.subject ? ` - ${quizSettings.subject}` : ''}
           </div>
          <CardHeader className="no-print">
            <CardTitle className="text-2xl font-headline flex items-center justify-between">
              <div className="flex items-center">
                <ListChecks className="mr-2 h-6 w-6 text-accent" /> {quizSubmitted ? "Quiz Results" : "4. Interactive Quiz"}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className={quizSubmitted ? "pt-6 print:pt-0" : "pt-0 print:pt-0"}>
             {quizSubmitted && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-md text-center no-print">
                <h3 className="text-xl font-semibold text-primary">Your Score: {quizScore} / {quizQuestions.length}</h3>
                <p className="text-muted-foreground">
                  {quizScore === quizQuestions.length ? "Excellent! Perfect score!" : 
                   quizScore >= quizQuestions.length * 0.7 ? "Great job!" :
                   quizScore >= quizQuestions.length * 0.5 ? "Good effort, keep practicing!" :
                   "Keep trying! Review the material and try again."}
                </p>
              </div>
            )}
            <div className="space-y-6">
              {quizQuestions.map((q, index) => (
                <div key={index} className={`p-4 border rounded-lg shadow-sm bg-card transition-shadow ${quizSubmitted ? (userAnswers[index] === q.answer ? 'border-green-500 print:border-green-500' : 'border-red-500 print:border-red-500') : 'border-primary/30 hover:shadow-md print:border-gray-300'}`}>
                  <p className="font-semibold mb-3 text-base text-primary print:text-black">
                    {index + 1}. {q.question}
                  </p>
                  <RadioGroup
                    onValueChange={(value) => handleQuizAnswerChange(index, value)}
                    value={userAnswers[index] || ''}
                    className="space-y-2"
                    disabled={anyLoading || quizSubmitted}
                  >
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${quizSubmitted ? '' : 'hover:bg-accent/10'}`}>
                        <RadioGroupItem 
                          value={option} 
                          id={`q${index}-opt${optIndex}`} 
                          className="border-primary text-primary focus:ring-primary disabled:opacity-70 print:border-gray-500 print:text-gray-700"
                          disabled={quizSubmitted}
                        />
                        <Label htmlFor={`q${index}-opt${optIndex}`} className={`text-sm flex-1 print:text-black ${quizSubmitted ? '' : 'cursor-pointer'}`}>
                          {option}
                        </Label>
                        {quizSubmitted && option === q.answer && <Check className="h-5 w-5 text-green-600 print:text-green-600" />}
                        {quizSubmitted && option !== q.answer && userAnswers[index] === option && <X className="h-5 w-5 text-red-600 print:text-red-600" />}
                      </div>
                    ))}
                  </RadioGroup>
                  {quizSubmitted && (
                     <p className={`text-xs mt-2 font-medium print:text-sm ${userAnswers[index] === q.answer ? 'text-green-700 print:text-green-700' : 'text-red-700 print:text-red-700'}`}>
                       {userAnswers[index] === q.answer ? <><CheckCircle2 className="inline h-4 w-4 mr-1" />Your answer was correct.</> : <><AlertCircle className="inline h-4 w-4 mr-1" />Your answer was incorrect. Correct Answer: {q.answer}</>}
                     </p>
                  )}
                </div>
              ))}
            </div>
            {!quizSubmitted && quizQuestions.length > 0 && (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!allQuestionsAnswered || isLoadingQuiz || anyLoading}
                className="mt-6 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white no-print"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Submit Quiz
              </Button>
            )}
            {quizSubmitted && (
              <div className="mt-6 space-x-0 space-y-2 sm:space-x-2 sm:space-y-0 flex flex-col sm:flex-row no-print">
                <Button
                  onClick={handlePrint}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Printer className="mr-2 h-5 w-5" /> Print Quiz & Results
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab('paste'); 
                    setRawContent(''); 
                    setUrlInput('');
                    resetQuizState();
                  }}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Start New Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
       <footer className="text-center mt-12 py-4 text-sm text-muted-foreground border-t no-print">
        {currentYear !== null ? (
          `Powered by AI & Next.js | Quizify AI © ${currentYear}`
        ) : (
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        )}
      </footer>
    </div>
  );
}
