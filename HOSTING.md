# Hosting Guide for Universal File Converter

This guide explains how to host your Universal File Converter project for free.

## 1. Backend Hosting (Render)
We will use **Render** to host the FastAPI backend because it supports Python and is easy to set up.

### Steps:
1.  **Push your code to GitHub**:
    - Create a new repository on GitHub.
    - Push your project code to it.

2.  **Create a Web Service on Render**:
    - Go to [render.com](https://render.com) and sign up.
    - Click "New +" -> "Web Service".
    - Connect your GitHub repository.

3.  **Configure the Service**:
    - **Name**: `universal-converter-backend` (or similar)
    - **Runtime**: Python 3
    - **Build Command**: `pip install -r backend/requirements.txt`
    - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
    - **Environment Variables**:
        - Add `PYTHON_VERSION` = `3.9.0` (optional, but good practice)

4.  **Deploy**:
    - Click "Create Web Service".
    - Render will build and deploy your app. Once done, you will get a URL like `https://universal-converter-backend.onrender.com`.

### Important Note on Poppler:
Render's default environment might not have Poppler installed. You may need to use a Dockerfile for full PDF support on Render.
**Simple Dockerfile for Render:**
Create a file named `Dockerfile` in the root:
```dockerfile
FROM python:3.9

# Install Poppler
RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app
COPY . /app

RUN pip install -r backend/requirements.txt

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "80"]
```
If you use Docker, select "Docker" as the runtime in Render.

## 2. Frontend Hosting (Netlify)
We will use **Netlify** for the frontend.

### Steps:
1.  **Update `script.js`**:
    - Open `frontend/script.js`.
    - Replace `http://localhost:8000` with your new Render Backend URL (e.g., `https://your-app.onrender.com`).

2.  **Deploy to Netlify**:
    - Go to [netlify.com](https://www.netlify.com) and sign up.
    - Drag and drop the `frontend` folder onto the Netlify dashboard.
    - **OR** connect your GitHub repo and set the "Publish directory" to `frontend`.

3.  **Done!**
    - Netlify will give you a URL like `https://universal-converter.netlify.app`.

## 3. Database Persistence
Since we are using SQLite, the database file (`conversions.db`) is stored on the disk.
- **On Render (Free Tier)**: The disk is ephemeral. This means if the server restarts, **you will lose your database data**.
- **Solution**: For a production app, you should use a hosted PostgreSQL database (Render offers this) and update the `SQLALCHEMY_DATABASE_URL` in `database.py`.
