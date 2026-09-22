# Mattaparthi Vari Pallem - Vinayaka Chavithi 5 KG Laddu Event
**Location:** Bandarulanka  
**Technology:** HTML5, CSS3, Vanilla JavaScript (GitHub Pages Compatible)

---

## 🌺 Project Overview

A complete, mobile-friendly temporary event website created for **Mattaparthi Vari Pallem** in Bandarulanka for the sacred **Vinayaka Chavithi 5 KG Laddu Event**. 

### 🌟 Key Highlights & Design
- **Color Palette**: Deep Royal Maroon, Sacred Saffron, Divine Gold, Warm Cream, and Dark Brown.
- **Visuals**: Handcrafted 3D-inspired 5 KG Maha Laddu with silver vark and pistachios, sacred Lord Ganesha iconography, floating gold sparkles canvas, and flickering brass diyas.
- **Compliance & Safety**: Safe free-entry event registration prototype. No monetary payments or paid lottery mechanisms are integrated.
- **Privacy Assurance**: Mobile numbers are strictly confidential and are shielded from all public displays and data exports.

---

## 📁 File Structure

```
jj/
├── index.html       # Complete semantic HTML5 single-page application
├── style.css        # Premium festival theme, responsive rules & animations
├── script.js        # Form validation, serial allocation, WhatsApp sharing & search
├── server.ps1       # Native Windows PowerShell local static server
└── README.md        # Deployment and usage instructions
```

---

## 🚀 GitHub Pages Deployment Guide

Follow these simple steps to deploy this website live on **GitHub Pages**:

### Step 1: Create a GitHub Repository
1. Log in to [GitHub](https://github.com/).
2. Click the **+** (plus) icon in the top right corner and select **New repository**.
3. Name your repository (e.g., `mattaparthi-vari-pallem` or `vinayaka-laddu-event`).
4. Set the repository to **Public**.
5. Do not initialize with a README if you are pushing local files. Click **Create repository**.

### Step 2: Upload Project Files
#### Method A: Using Git CLI (Recommended)
Open your terminal in `d:\MANIKANTA\MANI_EDUCATION\jj` and run:
```bash
git init
git add index.html style.css script.js README.md
git commit -m "Initial commit for Mattaparthi Vari Pallem 5 KG Laddu Event website"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

#### Method B: Using GitHub Web Uploader
1. On your new repository page on GitHub, click **Upload an existing file**.
2. Drag and drop `index.html`, `style.css`, and `script.js`.
3. Commit the changes directly to the `main` branch.

### Step 3: Enable GitHub Pages
1. In your GitHub repository, go to **Settings** (tab at the top).
2. On the left sidebar, click on **Pages** (under the "Code and automation" section).
3. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
4. Under **Branch**, choose `main` branch and `/ (root)` folder, then click **Save**.

### Step 4: Access Your Live Website
- Wait 1 to 2 minutes for GitHub Pages to build and deploy.
- Your website URL will be:
  ```
  https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/
  ```

### Step 5: Updating Content Later
- Whenever you edit `index.html` (e.g. to update dates, contact phone numbers, or announce the winner), simply commit and push the changes to `main`. GitHub Pages will automatically update in 1–2 minutes.

---

## 💻 How to Run and Edit Locally in VS Code

### 1. Direct Browser Opening
- Navigate to `d:\MANIKANTA\MANI_EDUCATION\jj` and double-click `index.html`.

### 2. Localhost Server via PowerShell
- Open PowerShell in the project directory and run:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\server.ps1
  ```
- Open `http://localhost:8080/` in your web browser.

### 3. VS Code Live Server Extension
- Open the project folder in **VS Code**.
- Right-click `index.html` and click **"Open with Live Server"**.

---

## 🔒 Limitations of Static Hosting & Backend Integration Plan

### Static Hosting & LocalStorage Limitations
- **GitHub Pages** is a static hosting provider; it does not execute server-side code or store databases.
- The registration flow currently uses `localStorage` to simulate instant sequential serial allocation (`MMP-001`, `MMP-002`, ...) and local directory persistence.
- Client-side data stored in `localStorage` is local to the user's browser and is not shared automatically across different devices.

### Plan for a Multi-User Production Backend
To transition this prototype into a shared multi-user system when legal and committee permits are in place:
1. **Database & Auth**: Connect to **Firebase Firestore** or **Supabase** (PostgreSQL).
2. **Server-Side Serial Allocation**: Use database transactions or Cloud Functions to ensure strictly monotonic serial numbers without race conditions.
3. **Secure Admin Portal**: Use Firebase Auth / Supabase Auth with server-side row-level security (RLS) policies to allow only authenticated committee members to view phone numbers and modify statuses.
4. **Audit Logs**: Maintain timestamped logs for all registration status modifications.

---

## ⚖️ Legal & Privacy Compliance

- **No Monetary Transactions**: This website does not process payments or facilitate paid lotteries.
- **Privacy Shield**: Participant phone numbers are kept private and are never exposed in the public directory table or CSV exports.
- **Disclaimer**: Registration references are for community event entry and do not constitute guaranteed prize awards.
