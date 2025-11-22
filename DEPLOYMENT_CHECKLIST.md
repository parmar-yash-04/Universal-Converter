# Final Deployment Checklist

It looks like you haven't set up Git for this folder yet. Follow these steps exactly:

1.  **Initialize Git (Do this once)**
    Run these commands in your terminal:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Link to GitHub**
    *   Go to GitHub and create a **new empty repository**.
    *   Copy the repository URL (it looks like `https://github.com/username/repo-name.git`).
    *   Run this command (replace the URL with yours):
        ```bash
        git remote add origin <YOUR_GITHUB_REPO_URL>
        git branch -M main
        git push -u origin main
        ```

3.  **Verify Render Deployment**
    - Go to your [Render Dashboard](https://dashboard.render.com).
    - Open your service.
    - It should start building automatically after you push.

4.  **Test Frontend (Netlify)**
    - Open your site: [https://capable-kashata-6e415e.netlify.app](https://capable-kashata-6e415e.netlify.app)
    - **Hard Refresh**: Press `Ctrl + Shift + R`.
    - Try converting a file.

**Common Errors:**
- If `git remote add origin` says "remote origin already exists", run: `git remote set-url origin <YOUR_GITHUB_REPO_URL>`
