"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function Home() {
  const [knownLetters, setKnownLetters] = useState<string[]>(Array(5).fill(""));
  const [presentLetters, setPresentLetters] = useState("");
  const [absentLetters, setAbsentLetters] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleKnownLetterChange = (index: number, value: string) => {
    const newLetters = [...knownLetters];
    newLetters[index] = value.toLowerCase();
    setKnownLetters(newLetters);
  };

  const handleSubmit = async () => {
    // TODO: Replace with actual API call
    setResults(["hello", "world", "where", "there"]); // Example results
    setShowResults(true);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setShowResults(false)}
            className="mb-6"
          >
            ← Back to Search
          </Button>
          
          <h2 className="text-2xl font-bold mb-6">Possible Words</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((word, index) => (
              <Card key={index} className="p-4 text-center uppercase tracking-wider">
                {word}
              </Card>
            ))}
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
          <div>
            <label className="text-sm font-medium mb-2 block">
              Known Letters (in position)
            </label>
            <div className="flex gap-2">
              {knownLetters.map((letter, index) => (
                <Input
                  key={index}
                  value={letter}
                  onChange={(e) => handleKnownLetterChange(index, e.target.value.slice(-1))}
                  className="w-12 h-12 text-center text-lg uppercase"
                  maxLength={1}
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
              onChange={(e) => setPresentLetters(e.target.value.toLowerCase())}
              className="lowercase"
              placeholder="e.g. ea"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Letters Not Present
            </label>
            <Input
              value={absentLetters}
              onChange={(e) => setAbsentLetters(e.target.value.toLowerCase())}
              className="lowercase"
              placeholder="e.g. rstln"
            />
          </div>

          <Button 
            className="w-full"
            size="lg"
            onClick={handleSubmit}
          >
            <Search className="mr-2 h-4 w-4" />
            Find Words
          </Button>
        </div>
      </div>
    </div>
  );
}