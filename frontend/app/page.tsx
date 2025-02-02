"use client"
import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Import the alert components

export default function Home() {
  const [knownLetters, setKnownLetters] = useState<string[]>(Array(5).fill(""));
  const [presentLetters, setPresentLetters] = useState("");
  const [absentLetters, setAbsentLetters] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [alertMessage, setAlertMessage] = useState(""); // State to control the alert message visibility
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = useCallback(async () => {
    const formattedPresent = presentLetters
      .toUpperCase()
      .split("")
      .filter((c) => c !== " ");
    const formattedAbsent = absentLetters
      .toUpperCase()
      .split("")
      .filter((c) => c !== " ");
  
    const overlap = formattedPresent.some((letter) =>
      formattedAbsent.includes(letter)
    );
  
    if (overlap) {
      setAlertMessage("Letters in 'Present Letters' and 'Absent Letters' are overlapping.");
      return;
    }
  
    const formattedS = knownLetters
      .map((l) => (l === "" ? "_" : l))
      .join("")
      .toUpperCase();
  
    try {
      const response = await fetch("http://localhost:8080/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          s: formattedS,
          isPresentSomewhere: formattedPresent,
          isNotPresentSomewhere: formattedAbsent,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch words");
      }
  
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching words:", error);
    }
  }, [knownLetters, presentLetters, absentLetters]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle events when not showing results and not focusing on other inputs
      if (showResults || (document.activeElement?.tagName === 'INPUT' && 
          !inputRefs.current.includes(document.activeElement as HTMLInputElement))) {
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        // Allow backspace on the last letter too
        if (currentIndex >= 0) {
          const newLetters = [...knownLetters];
          // Clear current letter if it exists, otherwise move back and clear
          if (currentIndex < 5 && newLetters[currentIndex] !== '') {
            newLetters[currentIndex] = '';
          } else if (currentIndex > 0) {
            newLetters[currentIndex - 1] = '';
            setCurrentIndex(currentIndex - 1);
          }
          setKnownLetters(newLetters);
        }
      } else if (/^[a-zA-Z]$/.test(e.key) && currentIndex < 5) {
        e.preventDefault(); // Prevent default to avoid double input
        const newLetters = [...knownLetters];
        newLetters[currentIndex] = e.key.toUpperCase();
        setKnownLetters(newLetters);
        if (currentIndex < 4) {
          setCurrentIndex(currentIndex + 1);
        }
      } else if(e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleSubmit, knownLetters, currentIndex, showResults]);

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < 5) {
      inputRefs.current[currentIndex]?.focus();
    }
  }, [currentIndex]);

  const handleKnownLetterChange = (index: number, value: string) => {
    const newLetters = [...knownLetters];
    newLetters[index] = value.toUpperCase();
    setKnownLetters(newLetters);
    
    // Only move to next input if there's a value
    if (value && index < 4) {
      setCurrentIndex(index + 1);
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => {
              setShowResults(false);
              setCurrentIndex(0);
            }}
            className="mb-6"
          >
            ← Back to Search
          </Button>

          <h2 className="text-2xl font-bold mb-6">Possible Words</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {!results || results.length === 0 ? (
              <div className="col-span-full text-center p-4">Not found</div>
            ) : (
              results.map((word, index) => (
                <Card
                  key={index}
                  className="p-4 text-center uppercase tracking-wider"
                >
                  {word}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Wordle Helper</h1>
          <p className="text-muted-foreground">Find the perfect word</p>
        </div>

        <div className="space-y-6">
          {alertMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Known Letters (in position)
            </label>
            <div className="flex gap-2">
              {knownLetters.map((letter, index) => (
                <Input
                  key={index}
                  value={letter}
                  onChange={(e) =>
                    handleKnownLetterChange(index, e.target.value.slice(-1))
                  }
                  className="w-12 h-12 text-center text-lg uppercase"
                  maxLength={1}
                  ref={(el) => (inputRefs.current[index] = el)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Letters Present (position unknown)
            </label>
            <Input
              value={presentLetters}
              onChange={(e) => setPresentLetters(e.target.value)}
              className="uppercase"
              placeholder="e.g. EA"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Letters Not Present
            </label>
            <Input
              value={absentLetters}
              onChange={(e) => setAbsentLetters(e.target.value)}
              className="uppercase"
              placeholder="e.g. RSTLN"
            />
          </div>

          <Button className="w-full" size="lg" onClick={handleSubmit}>
            <Search className="mr-2 h-4 w-4" />
            Find Words
          </Button>
        </div>
      </div>
    </div>
  );
}
