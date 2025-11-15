"use client";

import { generateQuiz } from "@/actions/interview";
import { saveQuizResult } from "@/actions/interview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import useFetch from "@/hooks/use-fetch";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";


const Quiz = () => {

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: saveResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  console.log(resultData);

  useEffect(()=>{
    if(quizData){
      setAnswers(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  const handleAnswer = (answer) =>{
    const newAnswers = [...answers];
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if(currentQuestion < quizData.length -1 ){
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
    else{
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if(answer === quizData[index].correctAnswer){
        correct++;
      }
    });
    return (correct / quizData.length)*100;
  };

  const finishQuiz = async()=>{
    const score = calculateScore();


    try{
      await saveQuizResultFn(quizData, answers, score);
      toast.success("Quiz completed!");
    }
    catch(error){
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  if(generatingQuiz){
    return <BarLoader className="mt-4" width={"100%"} color="gray" />
  }

  if(!quizData){
    return (
      <Card className='max-2'>
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your industry and skills.
            Take yout time and chose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick ={generateQuizFn}>
            Start Quiz</Button>
        </CardFooter>
      </Card>
    )
  }

  const question = quizData[currentQuestion];



  return (
    <Card className='max-2'>
        <CardHeader>
          <CardTitle>Question {currentQuestion + 1} of {quizData.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{question.question}</p>

          <RadioGroup 
          className="space-y-2"
          onValueChange = {handleAnswer}
          value={answers[currentQuestion]}>
            {question.options.map((option, index)=>{
              return(
                <div className="flex items-center space-x-2" key={option}>
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              );
            }
            )}
            
            
          </RadioGroup>
          {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium">Explanantion:</p>
            <p className="text-muted-foreground">{question.explanantion}</p>
            </div>
            )}
        </CardContent>
        <CardFooter>
          { !showExplanation && (
            <Button
              onClick={()=> setShowExplanation(true)}
              variant = "outline"
              disabled={!answers[currentQuestion]}
              >
                Show Explanation
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="ml-auto"
            disabled={!answers[currentQuestion] || savingResult}
            
          >
            {saveQuizResult && (
              <Barloader className="mt-4" width={"100%"} color="gray" />
            )}
            {curentQuestion < quizData.length - 1
            ? "Next Question"
            : "Submit Quiz"}
            
          </Button>
        </CardFooter>
      </Card>
  )
  
};

export default Quiz
