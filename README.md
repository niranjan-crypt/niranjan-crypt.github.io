# Niranjan Krishnakumar — Personal Research & Systems Portfolio

A clean, minimalist, editorial portfolio website showcasing **all 8 research and engineering projects**, a dedicated **IEEE EPREC-2026** publication spotlight, and a print-ready **ATS resume** with a permanent live link.

---

## 🌐 24/7 Free Live Hosting (No Laptop or Command Needed!)

When recruiters click the "Portfolio" link on your resume, they need to access your live website from any device, anywhere in the world—even when your computer is turned off.

To achieve this, the portfolio is designed for **100% free, 24/7 perpetual hosting** on **GitHub Pages**.

### How to Publish (Takes 1 Minute):

1. Open your terminal on your Mac and navigate to this folder:
   ```bash
   cd /Users/niranjankrishnakumar/.gemini/antigravity/scratch/niranjan-portfolio
   ```

2. Run the deployment script:
   ```bash
   ./deploy.sh
   ```
   *(Or if you prefer running Git commands manually)*:
   ```bash
   git init
   git add .
   git commit -m "Deploy clean portfolio"
   git branch -M main
   git remote add origin https://github.com/niranjan-crypt/niranjan-crypt.github.io.git
   git push -u origin main --force
   ```

3. If you used `niranjan-crypt.github.io`:
   - It is automatically hosted live at: **`https://niranjan-crypt.github.io`**
   - That's it! You can now put **`https://niranjan-crypt.github.io`** on your resume. It will never go down and requires zero server maintenance.

---

## 📄 File Structure

- **`index.html`**: Clean, elegant, responsive portfolio with dark/light mode toggle.
- **`resume.html`**: Clean ATS-friendly printable resume (`Ctrl+P` / `Cmd+P` ready) with direct live link to your portfolio in the header.
- **`deploy.sh`**: 1-step deployment script.
