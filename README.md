# Wordle Helper

A Wordle Helper built with **Go** and **Next.js/TypeScript** that predicts possible solutions by leveraging present and absent words using an underlying backtracking algorithm.

## Screenshots

![image](https://github.com/user-attachments/assets/2bb29744-a44e-40a7-935d-b69728309910)

![image](https://github.com/user-attachments/assets/0c871451-6172-4531-822c-fb9cec06a50e)

![image](https://github.com/user-attachments/assets/e927020f-dc04-441c-8393-4231c6d21071)

## Demo

[Demo.webm](https://github.com/user-attachments/assets/6969281c-0681-47a2-ab1f-fc491c583cca)


## Features

- Predicts possible 5-letter Wordle words based on present and absent letters.
- Uses a backtracking algorithm for efficient word prediction.
- Built with **Go** for the backend and **Next.js/TypeScript** for the frontend.

## Technologies Used

- **Go**: Backend server to handle logic and computations.
- **Next.js**: Frontend for an interactive user interface.
- **TypeScript**: Type safety and better development experience for frontend code.
- **Backtracking Algorithm**: Underlying logic to predict possible solutions efficiently.

## Installation

### Backend (Go)

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/wordle-helper.git
    cd wordle-helper
    ```

2. Install Go dependencies:

    ```bash
    cd backend
    go mod tidy
    ```

3. Run the backend server:

    ```bash
    go run main.go
    ```

    The backend will be available at `http://localhost:8080`.

### Frontend (Next.js/TypeScript)

1. Install Node.js dependencies:

    ```bash
    cd frontend
    npm install
    ```

2. Run the Next.js development server:

    ```bash
    npm run dev
    ```

    The frontend will be available at `http://localhost:3000`.

## Usage

1. Open the frontend in your browser: `http://localhost:3000`.
2. Input the present and absent letters in the respective fields.
3. Submit the form to see the predicted possible words based on your inputs.
