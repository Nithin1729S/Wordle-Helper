"use client"
import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [knownLetters, setKnownLetters] = useState<string[]>(Array(5).fill(""));
  const [presentLetters, setPresentLetters] = useState("");
  const [absentLetters, setAbsentLetters] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    if (!showResults) {
      inputRefs.current[0]?.focus();
    }
  }, [showResults]);
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
      if (showResults || (document.activeElement?.tagName !== 'INPUT' || 
          !inputRefs.current.includes(document.activeElement as HTMLInputElement))) {
        return;
      }

      const activeElementIndex = inputRefs.current.findIndex(
        (ref) => ref === document.activeElement
      );

      if (e.key === 'Backspace') {
        e.preventDefault();
        const newLetters = [...knownLetters];
        if (newLetters[activeElementIndex] !== '') {
          newLetters[activeElementIndex] = '';
          setKnownLetters(newLetters);
        } else if (activeElementIndex > 0) {
          newLetters[activeElementIndex - 1] = '';
          setKnownLetters(newLetters);
          setCurrentIndex(activeElementIndex - 1);
          inputRefs.current[activeElementIndex - 1]?.focus();
        }
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const newLetters = [...knownLetters];
        newLetters[activeElementIndex] = e.key.toUpperCase();
        setKnownLetters(newLetters);
        if (activeElementIndex < 4) {
          setCurrentIndex(activeElementIndex + 1);
          inputRefs.current[activeElementIndex + 1]?.focus();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleSubmit, knownLetters, showResults]);

  const handleKnownLetterChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newLetters = [...knownLetters];
    newLetters[index] = value.toUpperCase();
    setKnownLetters(newLetters);

    // Move focus to the next input if a letter is typed
    if (value && index < 4) {
      setCurrentIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleInputFocus = (index: number) => {
    setCurrentIndex(index);
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
                    handleKnownLetterChange(index, e.target.value)
                  }
                  onFocus={() => handleInputFocus(index)}
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