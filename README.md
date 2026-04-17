# <img src="https://www.nsoc.in/_next/image?url=%2Flogo.png&w=64&q=75" width="45" align="center" /> Nexus Spring of Code

> Officially participating in **Nexus Spring of Code 2026**

## ❄️ Winter Of Code Social 2025
## 🎃 Hacktoberfest 2025

### 🍽️ **Foodie — Responsive Food Delivery Website**

[![NSoC 2026](https://img.shields.io/badge/NSoC-2026-purple?style=for-the-badge)](https://www.nsoc.in/)
[![Project Kernel](https://img.shields.io/badge/Role-Project%20Kernel-success?style=for-the-badge)](https://www.nsoc.in/)
[![Hacktoberfest 2025](https://img.shields.io/badge/Hacktoberfest-2025-blueviolet?style=for-the-badge&logo=github)](https://hacktoberfest.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/janavipandole/Hacktoberfest2025-Foodie?style=for-the-badge)](https://github.com/janavipandole/Hacktoberfest2025-Foodie/stargazers)
[![Forks](https://img.shields.io/github/forks/janavipandole/Hacktoberfest2025-Foodie?style=for-the-badge)](https://github.com/janavipandole/Hacktoberfest2025-Foodie/forks)

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

<img src="(image.png)>

## 🧁 Overview

**Foodie** is a sleek, **responsive food delivery web app** built using **HTML5**, **CSS**, and **JavaScript**.
Designed for performance, accessibility, and user delight — it offers an effortless browsing and ordering experience across all devices.

> ⭐ Don’t forget to **Star** the repo if you like it — it helps others discover this project!

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

## 🧰 Tech Stack

| Technology              | Description                                        |
| ----------------------- | -------------------------------------------------- |
| **HTML5**               | Semantic and accessible markup                     |
| **CSS3**               | Responsive styling and layout                      |
| **JavaScript (ES6)**    | Dynamic UI and client-side interactivity           |
| **Deployment**          | Hosted on **GitHub Pages** for free, fast delivery |

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

## ✨ Key Features

✅ **Favorite Recipes** — Bookmark your favorite recipes effortlessly with the ⭐ button. Browse them all in your tailored "My Favorites" page. Saved securely using localStorage.

✅ **Fully Responsive** — Works seamlessly on mobile, tablet, and desktop.
💡 **Modern UI/UX** — Minimalist design with smooth animations and intuitive navigation.
🛒 **Smart Cart System** — Add, edit, or remove items with instant price updates.
⏱️ **Real-Time Tracking** — Get live order status and estimated delivery time.
🔒 **Secure Checkout** — Integrated payment simulation with form validation.
🧩 **Reusable Components** — Modular, maintainable, and scalable architecture.

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

## 📁 Folder Structure — 

```text
Foodie/
├── html/                      # Main HTML files (entry points)
│   ├── index.html
│   └── other-pages.html
│
├── css/                       # Styles
│   ├── base/
│   ├── components/
│   └── layouts/
│
├── js/                        # JavaScript code
│   ├── components/
│   ├── services/             # API / external data calls (if any)
│   └── utils/
│
├── imgs/                      # Images / icons / assets
│   ├── food/
│   └── ui/
│
├── locales/                   # Translations / i18n (if used)
│   └── en.json
│
├── docs/                      # Documentation folder
│   └── architecture.md
│
├── tests/                     # Tests (if added later)
│   ├── unit/
│   └── integration/
│
├── .vscode/                   # Editor configs
├── .gitignore
├── README.md
├── TODO.md
├── products.json              # Data file (already present)
└── LICENSE
```

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

## 🚀 Getting Started

Follow these steps to run **Foodie** locally on your system 👇

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/janavipandole/Foodie.git
```

### 2️⃣ Navigate into the Project Folder

```bash
cd Foodie
```

### 3️⃣ Open in Your Browser

Simply open the `html/index.html` file in your browser:

```bash
# Windows (PowerShell or CMD)
start "" html\index.html

# macOS
open html/index.html

# Linux
xdg-open html/index.html
```

> Or, use **Live Server** in VS Code:
>
> - In VS Code, right‑click `html/index.html` → “Open with Live Server”

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />


<img src="./imgs/image.png" alt="Homepage Preview" width="800"/>

## 🧩 Chrome Extension

Load the extension for local testing:
1. Open `chrome://extensions`
2. Toggle “Developer mode”
3. Click “Load unpacked” and select the `chrome extension/` folder

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />


## 📊 Google Analytics Setup

To enable Google Analytics tracking on your Foodie website, follow these steps 👇

- 1️⃣ Get Your Measurement ID

* Go to Google Analytics → Admin → Data Streams → Web
* Copy your Measurement ID (looks like G-XXXXXXXXXX)

- 2️⃣ Add Tracking Script

Insert the following script inside the <head> section of your main HTML file (e.g., html/index.html):

<!-- Google Analytics -->

``` bash
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

* NOTE:- 💡 Replace G-XXXXXXXXXX with your actual Measurement ID.

- 3️⃣ Verify Tracking

* Visit your website and interact with it
* Open Google Analytics → Realtime → View Stream ID
* You should see your visit appear within seconds 🎯


## 🚢 Deployment (GitHub Pages)

This site’s entry file is at `html/index.html`. To use GitHub Pages:
- Option A: Move `html/index.html` (and assets) to the repo root so the root has `index.html`.
- Option B: Create a root `index.html` that redirects to `/html/`.
- Option C: Use Pages “/docs” and move `html` → `docs`.

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />


## Steps to Deploy
* Push your project to GitHub
* Open the repository settings
* Navigate to Pages
* Select the desired branch
* Save the settings
* Your site will be published automatically

## 🧪 Command for Running Tests

This project uses [Jest](https://jestjs.io/) for unit testing JavaScript modules.

To run all tests:

```bash
npm test
```

To see detailed output for each test (test names and results), run:

```bash
npm test -- --verbose
```

This will show the name and result of every test, making it easier to debug and understand the test coverage.

Test files are located in the `tests/` directory. You can add more tests for other modules as needed.


## 🤝 Contributing

We ❤️ **open-source contributions**!
Whether it’s bug fixes, new features, or improving documentation — every contribution counts! 🌍

### 🪜 Steps to Contribute

1. **Fork** this repository
   Click the **Fork** button on the top right corner of this page.

2. **Clone your forked repo**

   ```bash
   git clone https://github.com/<your-username>/Foodie.git
   ```

3. **Create a new branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   Add your improvements or fix bugs.

5. **Commit your changes**

   ```bash
   git add .
   git commit -m "Added: new feature or improvement"
   ```

6. **Push to your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   Go to your fork on GitHub and click **“Compare & pull request”**.
   🎉 That’s it! Wait for review and merge.

📘 For more details, see the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />


## Future Improvements

Some potential enhancements for Foodie include:

* User authentication and login system
* Wishlist and favorite items feature
* Backend integration for real orders
* Dark mode support
* Search and filter functionality
* Multi-language support
* Payment gateway integration

## 🏆 NSoC 2026 Project Selection

We are excited to announce that this project has been officially selected for **Nexus Spring of Code 2026 (NSoC '26)**.

As a **Project Kernel**, this project will be actively maintained and scaled during the program with support from contributors and the open-source community.

### 🎯 Highlights
- Officially selected for NSoC 2026
- Contributor phase starts from **15 April**
- Open-source mentorship and collaboration
- Active issue tracking and contributor support

We welcome contributors to participate and improve this project.
Explore Program: https://www.nsoc.in/projects

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

## ❄️ Winter Of Code Social 2025
This project is excited to be a part of **Winter Of Code Social 2025**!
Contribute awesome pull requests, learn new technologies, and become a part of the open-source community.
Whether you’re a beginner or a pro, this is your chance to grow and collaborate with developers around the world.
👉 **Register here:** [woc.codesocial.tech](https://woc.codesocial.tech/)

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

## 🌱 Hacktoberfest 2025

This project proudly participates in **Hacktoberfest 2025**!
Contribute meaningful PRs, learn new skills, and help the open-source community thrive.
👉 **Register here:** [hacktoberfest.com](https://hacktoberfest.com/)

> ⚠️ Only **quality pull requests** will be accepted (avoid spam or irrelevant PRs).

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

## 📜 License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for full details.

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

## 💬 Connect with the Maintainer

👩‍💻 **Maintainer:** [@janavipandole](https://github.com/janavipandole)
📧 **Contact:** Open an issue or connect via GitHub.

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=90&section=header" width="100%"/>

## Contributors

<img src="https://contributors-img.web.app/image?repo=janavipandole/Foodie"/>

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/45123f007c79aa8d0c8d9b11b3ff72d6bf4744c7/Assets/Star%20Light%20Line.gif" width="100%">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient"/>


## 🌟 Support the Project

If you found this helpful:
⭐ **Star** the repository
🍴 **Fork** it to contribute
📢 **Share** it with others

> “Good food brings people together — so does open source.” 🍕💻
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer" width="100%"/>
