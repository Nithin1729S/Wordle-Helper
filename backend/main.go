package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

type RequestData struct {
	S                     string   `json:"s"`
	IsPresentSomewhere    []string `json:"isPresentSomewhere"`
	IsNotPresentSomewhere []string `json:"isNotPresentSomewhere"`
}

func loadDictionary(filename string) map[string]bool {
	wordSet := make(map[string]bool)
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return wordSet
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		word := strings.ToUpper(scanner.Text())
		if len(word) == 5 {
			wordSet[word] = true
		}
	}
	return wordSet
}

func backtrack(idx int, s []rune, isPresentSomewhere, isNotPresentSomewhere map[rune]bool, validWords map[string]bool, results *[]string) {
	if idx == 5 {
		// Ensure all letters in isPresentSomewhere exist in the word
		for c := range isPresentSomewhere {
			if !strings.ContainsRune(string(s), c) {
				return
			}
		}
		if validWords[string(s)] {
			*results = append(*results, string(s))
		}
		return
	}

	if s[idx] != '_' {
		backtrack(idx+1, s, isPresentSomewhere, isNotPresentSomewhere, validWords, results)
		return
	}

	for _, c := range ALPHABET {
		if !isNotPresentSomewhere[rune(c)] { // Only consider letters that are not absent
			s[idx] = rune(c)
			backtrack(idx+1, s, isPresentSomewhere, isNotPresentSomewhere, validWords, results)
			s[idx] = '_'
		}
	}
}

func solveHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle OPTIONS request (CORS preflight)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var requestData RequestData
	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	validWords := loadDictionary("wordList.txt")
	s := []rune(strings.ToUpper(requestData.S))
	isPresentSomewhere := make(map[rune]bool)
	isNotPresentSomewhere := make(map[rune]bool)

	// Fix: Ensure empty characters don't cause issues
	for _, c := range requestData.IsPresentSomewhere {
		if len(c) > 0 {
			isPresentSomewhere[rune(c[0])] = true
		}
	}
	for _, c := range requestData.IsNotPresentSomewhere {
		if len(c) > 0 {
			isNotPresentSomewhere[rune(c[0])] = true
		}
	}

	var results []string
	backtrack(0, s, isPresentSomewhere, isNotPresentSomewhere, validWords, &results)

	// Debugging: Print filtered words
	fmt.Println("Final word list:", results)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func main() {
	http.HandleFunc("/solve", solveHandler)
	fmt.Println("Server running on port 8080...")
	http.ListenAndServe(":8080", nil)
}
