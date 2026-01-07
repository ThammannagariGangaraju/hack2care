import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowLeft } from "lucide-react";
import type { DecisionAnswers } from "@shared/schema";
import logoImage from "@assets/image_1767781744439.png";

interface DecisionTreeProps {
  currentQuestion: number;
  answers: DecisionAnswers;
  onAnswer: (question: keyof DecisionAnswers, answer: boolean) => void;
  onBack: () => void;
}

const questions = [
  {
    key: "isConscious" as keyof DecisionAnswers,
    title: "Is the patient conscious?",
    description: "Can they respond to your voice or touch?",
    yesText: "Yes, Conscious",
    noText: "No, Unconscious",
  },
  {
    key: "isBreathing" as keyof DecisionAnswers,
    title: "Is the patient breathing normally?",
    description: "Can you see their chest rising and falling?",
    yesText: "Yes, Breathing",
    noText: "No, Not Breathing",
  },
  {
    key: "hasHeavyBleeding" as keyof DecisionAnswers,
    title: "Is there heavy bleeding?",
    description: "Can you see significant blood loss?",
    yesText: "Yes, Heavy Bleeding",
    noText: "No Heavy Bleeding",
  },
];

export default function DecisionTree({ currentQuestion, answers, onAnswer, onBack }: DecisionTreeProps) {
  const question = questions[currentQuestion];

  if (!question) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex flex-col">
      {/* Emergency Header Bar */}
      <div className="bg-red-600 text-white py-1.5 px-4 text-center">
        <span className="font-bold text-xs tracking-wide">EMERGENCY ASSESSMENT</span>
      </div>

      {/* Header */}
      <header className="p-3 border-b border-red-200 dark:border-red-900 flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          data-testid="button-back"
          className="border-red-300 dark:border-red-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <img src={logoImage} alt="hack2care" className="w-10 h-10 object-contain" />
        <div className="flex-1">
          <h1 className="font-bold text-base text-red-700 dark:text-red-400">Quick Assessment</h1>
          <p className="text-xs text-muted-foreground">Question {currentQuestion + 1} of 3</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-2 bg-red-100 dark:bg-red-950">
        <div 
          className="h-full bg-red-600 transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / 3) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardContent className="p-8">
            {/* Question Number Badge */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{currentQuestion + 1}</span>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-center mb-3" data-testid={`text-question-${currentQuestion + 1}`}>
              {question.title}
            </h2>
            <p className="text-muted-foreground text-center text-lg mb-8">
              {question.description}
            </p>

            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => onAnswer(question.key, true)}
                data-testid={`button-answer-yes-${currentQuestion + 1}`}
                className="h-24 text-xl font-bold bg-green-600 hover:bg-green-700 border-green-700 text-white flex flex-col items-center justify-center gap-2"
              >
                <Check className="w-8 h-8" />
                <span>{question.yesText}</span>
              </Button>
              <Button
                onClick={() => onAnswer(question.key, false)}
                data-testid={`button-answer-no-${currentQuestion + 1}`}
                className="h-24 text-xl font-bold bg-destructive hover:bg-destructive/90 border-destructive-border text-white flex flex-col items-center justify-center gap-2"
              >
                <X className="w-8 h-8" />
                <span>{question.noText}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Answers Summary */}
        {currentQuestion > 0 && (
          <div className="mt-6 w-full max-w-lg">
            <p className="text-sm text-muted-foreground mb-2">Your answers:</p>
            <div className="flex flex-wrap gap-2">
              {answers.isConscious !== null && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${answers.isConscious ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {answers.isConscious ? 'Conscious' : 'Unconscious'}
                </div>
              )}
              {answers.isBreathing !== null && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${answers.isBreathing ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {answers.isBreathing ? 'Breathing' : 'Not Breathing'}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
