# CodeMentor AI: AI-Powered Code Review Assistant

## Overview

**CodeMentor AI** is a web application designed to help beginner programmers improve their code by providing automated, beginner-friendly feedback on code style, potential bugs, and best practices. The platform leverages advanced AI models to deliver actionable insights, making it easier for new developers to learn and grow before submitting pull requests.

---

## Key Features

- **Modern, Responsive UI**: Intuitive interface inspired by Copilot/ChatGPT, with full support for light and dark themes.
- **Persistent Chat History**: Conversations are saved and organized by date, ensuring continuity across sessions.
- **Contextual Multi-Turn Chat**: Maintains conversation context for accurate, relevant feedback.
- **Session Management**: Sessions are tracked via unique IDs and stored in localStorage.
- **User Authentication**: Secure signup and sign-in workflows with backend integration.
- **Customizable Settings**: Theme switching and sign-out options, with accessible dropdown menus.
- **Advanced Markdown & Code Rendering**: Supports markdown formatting, syntax-highlighted code blocks, and copy-to-clipboard functionality.
- **Mobile Friendly**: Fully responsive layout with adaptive navigation and mobile drawer menus.

---

## Technology Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Django, Django REST Framework
- **AI Integration**: Azure OpenAI API (gpt -4o)
- **Database**: MySQL

---

## Architecture

```
CodeMentor_AI/
├── backend/
│   ├── manage.py
│   └── api/
│       ├── models.py      # User and chat history models
│       ├── views.py       # API endpoints
│       ├── urls.py
│       └── ...
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── CodeReviewForm.js  # Main chat UI and logic
│       ├── App.js
│       └── ...
├── requirements.txt
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python 3.8+
- pip

### Backend Setup

1. **Install dependencies:**
    ```sh
    pip install -r requirements.txt
    ```
2. **Set up the database:**
    - By default, the project uses MySQL. Create a new MySQL database and user, and update the `DATABASES` setting in `backend/settings.py` accordingly.
    - Example MySQL commands:
      ```sh
      mysql -u root -p
      CREATE DATABASE codementor_ai;
      CREATE USER 'cm_user'@'localhost' IDENTIFIED BY 'your_password';
      GRANT ALL PRIVILEGES ON codementor_ai.* TO 'cm_user'@'localhost';
      FLUSH PRIVILEGES;
      EXIT;
      ```
3. **Apply database migrations:**
    ```sh
    python backend/manage.py migrate
    ```
4. **Configure Azure OpenAI API:**
    - Set your API key and endpoint in Django settings or environment variables:
      ```env
      AZURE_OPENAI_API_KEY=your-key-here
      AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
      AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo
      ```
4. **Start the backend server:**
    ```sh
    python backend/manage.py runserver
    ```
    The backend will be available at `http://127.0.0.1:8000/`.

### Frontend Setup

1. **Install dependencies:**
    ```sh
    cd frontend
    npm install
    ```
2. **Start the development server:**
    ```sh
    npm start
    ```
    The frontend will be available at `http://localhost:3000/`.

---

## Usage

1. Open the frontend in your browser.
2. Register or log in to access persistent chat history.
3. Submit code snippets and receive AI-powered feedback.
4. Manage your preferences via the settings menu.

---

## Customization

- **AI Model**: Update the deployment/model name in backend settings to use a different Azure OpenAI model.
- **Database**: Configure Django’s `DATABASES` setting to use PostgreSQL or another supported database.
- **Styling**: Modify Tailwind CSS configuration for custom themes and styles.

---

## File Reference

- `backend/api/models.py`: Django models for users and chat history.
- `backend/api/views.py`: API endpoints for chat and user management.
- `frontend/src/CodeReviewForm.js`: Main chat interface and logic.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**CodeMentor AI** — Empowering the next generation of developers with intelligent, accessible code reviews.
