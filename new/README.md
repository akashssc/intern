# My Webpage

This is a simple starter webpage project.

## Setup

1. Install dependencies (if any):
   ```bash
   npm install
   ```
2. Open `index.html` in your browser to view the page.

## Project Structure
- `index.html` - Main HTML file
- `style.css` - Stylesheet
- `script.js` - JavaScript file 

## Backend API (Node.js + Express)

Start the server:
```bash
node server.js
```

### Endpoints

- **POST /register**
  - Body: `{ "username": "user", "email": "user@email.com", "password": "pass" }`
  - Registers a new user. Username and email must be unique. Password must be at least 8 characters, include uppercase, lowercase, number, and symbol.

- **POST /login**
  - Body: `{ "username": "user", "password": "pass" }` or `{ "email": "user@email.com", "password": "pass" }`
  - Logs in a user by username or email.

- **POST /upload**
  - Body: FormData with fields: `username`, `password`, and `file` (file to upload)
  - Uploads a file for the authenticated user.

- **POST /myfiles**
  - Body: `{ "username": "user", "password": "pass" }`
  - Lists files uploaded by the authenticated user.

- **POST /download**
  - Body: `{ "username": "user", "password": "pass", "fileId": 1 }`
  - Downloads a file by its ID for the authenticated user. 