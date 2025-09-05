# Sentiment Analyzer with Next.js and Hugging Face

![Application Screenshot](<img width="1857" height="1091" alt="image" src="https://github.com/user-attachments/assets/eed5c5f8-095f-4c27-bab6-09833d9c6652" />
) 


This is a simple web app built with Next.js (using the App Router) that allows users to upload a CSV file to perform sentiment analysis. The application processes messages from the file, sends them to a Hugging Face API, and displays a dashboard with consolidated results.

## ✨ Features

-   **CSV Upload:** Interface to select and upload `.csv` files.
-   **Column Validation:** Checks if the CSV contains the required columns (`username` and `message`).
-   **Sentiment Analysis:** Uses the `tabularisai/multilingual-sentiment-analysis` model from Hugging Face to analyze each message.
-   **Results Dashboard:** Displays consolidated metrics:
    -   Most frequent sentiment.
    -   Worst identified sentiment (based on the confidence score).
    -   Overall Satisfaction Index.
-   **Privacy Policy Page:** A static page with information about data handling.

## 🛠️ Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Language:** JavaScript
-   **Styling:** [Bootstrap 5](https://getbootstrap.com/)
-   **CSV Parsing:** [PapaParse](https://www.papaparse.com/)
-   **AI API:** [Hugging Face Inference API](https://huggingface.co/inference-api)
-   **Hosting:** [Vercel](https://vercel.com/)

---

## 🚀 Running the Project Locally

Follow the steps below to set up and run the project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (version 18 or higher)
-   `npm` or `yarn`
-   A [Hugging Face](https://huggingface.co/) account to get an API Key.

### 1. Clone the Repository

First, clone this repository to your local machine:

- git clone https://github.com/correagss/sentiment-analyzer.git
- cd sentiment-analyzer (<>)

---

### 2. Install Dependencies

Install all project dependencies with the following command:

- npm install

---

### 3. Configure Environment Variables

To communicate with the Hugging Face API, you need an authentication key.

- Create a file named .env.local in the root of the project.
- Inside this file, add your Hugging Face key:

- HUGGING_FACE_API_KEY="hf_<your-key>"

---

### 4. Run the Development Server

With everything set up, start the development server:

- npm run dev
- Open http://localhost:3000 in your browser to see the application running!

---

### 🌐 Deploying on Vercel

Deploying this project on Vercel is extremely simple.

### 1. Create a Vercel Account

- If you don't have one, create a free account on Vercel and connect it to your GitHub account.

---

### 2. Import the Project

- On your Vercel dashboard, click "Add New... -> Project".

- Import your GitHub repository containing this project.

---

### 3. Configure Environment Variables

This is the most important step! Vercel needs to know your secret API key.

During the import process, navigate to the "Environment Variables" section.

- Add a new variable:
- Name: HUGGING_FACE_API_KEY
- Value: hf_<your-key> (paste your key here)
- Click "Add".

--- 

### 4. Deploy

- Click the "Deploy" button.

- Vercel will automatically build and host your project. In a few minutes, you will receive a public URL for your live application!

---

### 📄 CSV Format

The uploaded CSV file must contain, at a minimum, the following columns, separated by a semicolon (;):

- username
- message

### Example:

username;message

jane_doe;"The service was incredible, I'm very happy!"

john_smith;"Terrible, the product arrived broken."
