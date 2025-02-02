package backend

import (
	"bufio"
	"fmt"
	"net/http"
	"os"
	"strings"
	"encoding/json"
)

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

type RequestData struct {
	S                      string   `json:"s"`
	IsPresentSomewhere     []string `json:"isPresentSomewhere"`
	IsNotPresentSomewhere  []string `json:"isNotPresentSomewhere"`
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

	if s[idx] != 'X' {
		backtrack(idx+1, s, isPresentSomewhere, isNotPresentSomewhere, validWords, results)
		return
	}

	for _, c := range ALPHABET {
		if !isNotPresentSomewhere[rune(c)] {
			s[idx] = rune(c)
			backtrack(idx+1, s, isPresentSomewhere, isNotPresentSomewhere, validWords, results)
			s[idx] = 'X'
		}
	}
}

func solveHandler(w http.ResponseWriter, r *http.Request) {
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

	for _, c := range requestData.IsPresentSomewhere {
		isPresentSomewhere[rune(c[0])] = true
	}
	for _, c := range requestData.IsNotPresentSomewhere {
		isNotPresentSomewhere[rune(c[0])] = true
	}

	var results []string
	backtrack(0, s, isPresentSomewhere, isNotPresentSomewhere, validWords, &results)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func main() {
	http.HandleFunc("/solve", solveHandler)
	fmt.Println("Server running on port 8080...")
	http.ListenAndServe(":8080", nil)
}
