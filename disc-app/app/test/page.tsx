'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import Logo from '@/components/Logo';
import { questions } from '@/data/questions';
import { calculateDISC } from '@/utils/calculateDISC';
import { saveTestProgress, loadTestProgress, saveTestResult, clearTestData } from '@/utils/storage';
import type { Answer } from '@/types/disc';

export default function TestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const saved = loadTestProgress();
    if (saved && saved.answers.length > 0) {
      setAnswers(saved.answers);
      setCurrentQuestion(saved.currentQuestion);
      setSelectedOption(saved.answers[saved.currentQuestion]?.selectedOption ?? null);
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (!isLoading && answers.length > 0) {
      saveTestProgress({
        answers,
        currentQuestion,
        timestamp: new Date().toISOString(),
      });
    }
  }, [answers, currentQuestion, isLoading]);
  
  const handleAnswer = (optionIndex: number) => {
    const question = questions[currentQuestion];
    const newAnswer: Answer = {
      questionId: currentQuestion,
      selectedOption: optionIndex,
      discType: question.options[optionIndex].discType,
    };
    
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = newAnswer;
    setAnswers(updatedAnswers);
    setSelectedOption(optionIndex);
  };
  
  const handleNext = () => {
    if (selectedOption === null) return;
    
    if (currentQuestion === questions.length - 1) {
      const result = calculateDISC(answers);
      saveTestResult(result);
      clearTestData();
      router.push('/result');
    } else {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setSelectedOption(answers[nextQuestion]?.selectedOption ?? null);
    }
  };
  
  const handleBack = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      setSelectedOption(answers[prevQuestion]?.selectedOption ?? null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vx-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vx-orange mx-auto mb-4"></div>
          <p className="text-vx-gray">Carregando...</p>
        </div>
      </div>
    );
  }
  
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  
  return (
    <div className="min-h-screen bg-vx-dark">
      {/* Header */}
      <header className="border-b border-vx-orange/20">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Logo />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-vx-gray text-sm font-medium">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-vx-orange text-sm font-bold">
              {Math.round(progress)}%
            </span>
          </div>
          <ProgressBar current={currentQuestion + 1} total={questions.length} />
        </div>
        
        {/* Question Card */}
        <Card className="mb-8 bg-vx-dark-secondary border-vx-orange/20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
            {question.text}
          </h2>
          
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`
                  w-full text-left p-5 rounded-lg border-2 transition-all duration-200
                  ${selectedOption === index
                    ? 'border-vx-orange bg-vx-orange/10 text-white'
                    : 'border-vx-gray/20 bg-vx-dark hover:border-vx-orange/50 text-vx-gray hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${selectedOption === index ? 'border-vx-orange' : 'border-vx-gray/40'}
                  `}>
                    {selectedOption === index && (
                      <div className="w-3 h-3 rounded-full bg-vx-orange" />
                    )}
                  </div>
                  <span className="font-medium text-base">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="px-8"
          >
            ← Anterior
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleNext}
            disabled={selectedOption === null}
            className="px-8"
          >
            {currentQuestion === questions.length - 1 ? 'Finalizar →' : 'Próxima →'}
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-center text-vx-gray text-sm mt-8">
          💡 Escolha a opção que mais se aproxima do seu comportamento natural
        </p>
      </div>
    </div>
  );
}
