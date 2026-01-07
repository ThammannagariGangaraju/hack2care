import { Button } from "@/components/ui/button";
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
    yesText: "YES",
    noText: "NO",
  },
  {
    key: "isBreathing" as keyof DecisionAnswers,
    title: "Is the patient breathing?",
    description: "Can you see their chest rising and falling?",
    yesText: "YES",
    noText: "NO",
  },
  {
    key: "hasHeavyBleeding" as keyof DecisionAnswers,
    title: "Is there heavy bleeding?",
    description: "Can you see significant blood loss?",
    yesText: "YES",
    noText: "NO",
  },
];

export default function DecisionTree({ currentQuestion, answers, onAnswer, onBack }: DecisionTreeProps) {
  const question = questions[currentQuestion];

  if (!question) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          data-testid="button-back"
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-600/50 flex items-center justify-center p-1 shadow-sm">
          <img src={logoImage} alt="hack2care" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm">Quick Assessment</h1>
          <p className="text-slate-500 text-xs">Question {currentQuestion + 1} of 3</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestion + 1) / 3) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Question Number */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30">
              <span className="text-3xl font-bold text-white">{currentQuestion + 1}</span>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-center text-white mb-2" data-testid={`text-question-${currentQuestion + 1}`}>
            {question.title}
          </h2>
          <p className="text-slate-400 text-center text-sm mb-8">
            {question.description}
          </p>

          {/* Answer Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onAnswer(question.key, true)}
              data-testid={`button-answer-yes-${currentQuestion + 1}`}
              className="h-28 rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white font-bold text-xl shadow-lg shadow-green-900/30 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Check className="w-8 h-8" />
              <span>{question.yesText}</span>
            </button>
            <button
              onClick={() => onAnswer(question.key, false)}
              data-testid={`button-answer-no-${currentQuestion + 1}`}
              className="h-28 rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white font-bold text-xl shadow-lg shadow-red-900/30 flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <X className="w-8 h-8" />
              <span>{question.noText}</span>
            </button>
          </div>
        </div>

        {/* Previous Answers Summary */}
        {currentQuestion > 0 && (
          <div className="mt-8 w-full max-w-sm">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Previous answers</p>
            <div className="flex flex-wrap gap-2">
              {answers.isConscious !== null && (
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${answers.isConscious ? 'bg-green-900/50 text-green-400 border border-green-700/50' : 'bg-red-900/50 text-red-400 border border-red-700/50'}`}>
                  {answers.isConscious ? 'Conscious' : 'Unconscious'}
                </div>
              )}
              {answers.isBreathing !== null && (
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${answers.isBreathing ? 'bg-green-900/50 text-green-400 border border-green-700/50' : 'bg-red-900/50 text-red-400 border border-red-700/50'}`}>
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
