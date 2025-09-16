# Otterly 🦦

Welcome to Otterly, a friendly, AI-powered journaling companion designed to make self-reflection effortless and meaningful. With a little help from our mascot, Oto the Otter, users can capture their daily thoughts, receive empathetic AI-generated feedback, and track their personal journey.

This project was built with a beginner-friendly, modern tech stack, focusing on serverless technologies and in-browser machine learning.

*(To make the image above work, upload the `oto-logo.png` to an image hosting service like [Imgur](https://imgur.com/upload) and replace the link.)*

---

## ## Features

* **Secure User Authentication**: Users can sign up and sign in securely with email and password.
* **Private Journaling**: All journal entries are stored securely in Firestore and are only accessible by the user who created them.
* **AI Companion (Oto)**: After saving an entry, users receive a warm, empathetic reply from Oto, powered by a Large Language Model.
* **AI-Generated Titles**: Each entry is automatically given a creative title by the AI.
* **Journal History**: Users can view a list of their past entries and click to see the full content and Oto's reply.
* **Onboarding Flow**: A friendly onboarding process to welcome new users and gather their aspirations.

---

## ## Tech Stack & Key Technologies

* **Framework**: [Next.js](https://nextjs.org/) (App Router with TypeScript)
* **Hosting**: [Vercel](https://vercel.com/) (Hobby Tier)
* **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
* **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
* **AI Language Model**: [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (using a small, fast instruction model)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Form Management**: [React Hook Form](https://react-hook-form.com/)

---

## ## Getting Started

### ### Prerequisites

* Node.js (v18 or newer)
* npm or pnpm
* Git

### ### Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/otterly-app.git](https://github.com/your-username/otterly-app.git)
    cd otterly-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    * Create a new file in the root of the project named `.env.local`.
    * Copy the contents of `.env.local.example` (if you have one) or add the following variables:

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=

    # Cloudflare AI Configuration
    CF_ACCOUNT_ID=
    CF_API_TOKEN=
    CF_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
    ```

4.  **Populate your environment variables:**
    * **Firebase**: Go to your Firebase project settings, add a web app, and copy the configuration values.
    * **Cloudflare**: Go to your Cloudflare dashboard to find your Account ID and create a Workers AI API Token.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
