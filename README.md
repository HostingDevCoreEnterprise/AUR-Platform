# Alianța Universitară Română (AUR) - Platform

Welcome to the digital ecosystem of **Alianța Universitară Română (AUR)**. This monorepo houses a suite of four interconnected platforms built to streamline the university experience, enhance student opportunities, and centralize access to critical resources across Romania.

## Vision

The Romanian University Alliance (AUR) aims to create a unified, digital-first experience for prospective and current students. By breaking down the silos between individual universities, AUR offers a centralized gateway for applications, international mobility, work programs, and academic resources.

## Architecture & Ecosystem

This repository is structured as a monorepo containing four distinct platforms, each serving a critical role in the AUR ecosystem. 

### 1. AUR Main Portal (`/aliantauniversitararomana`)
The official presentation website of the alliance. It acts as the primary landing page for students seeking to understand the alliance's mission and the opportunities it provides.
- **Purpose**: Information hub for scholarships, research, internships, accommodation, student counseling, and legislative rights.
- **Tech Stack**: Node.js, Express, EJS, Vanilla CSS.
- **Key Features**: Comprehensive guides, dynamic routing, and a modern, responsive user interface.

### 2. UniLink Hub (`/unilink`)
The technological core of the AUR ecosystem. UniLink is a secure, authenticated dashboard for students to manage their academic journey.
- **Purpose**: Centralized student dashboard and AI-powered essay assistant.
- **Tech Stack**: Node.js, Express, EJS, PostgreSQL (Neon), Google Gemini API.
- **Key Features**:
  - **ApexEssay**: An integrated AI assistant powered by Google Gemini, designed to help students outline, draft, and refine their university admission essays or academic papers.
  - **NativTracker**: A centralized application tracking system. Students can add their target universities, monitor application statuses (Applied, Admitted, Rejected), and view global statistics.
  - **Resource Master-List**: Curated, verified links to official government databases (Study in Romania, ARACIS, COR codes) to prevent academic fraud and provide clear career pathways.
  - **Secure Authentication**: Encrypted user sessions using `bcrypt` and `express-session`.

### 3. Erasmus+ Portal (`/erasmus`)
A dedicated, streamlined static portal connecting students to the Erasmus+ offices of over 70 state and private universities across Romania.
- **Purpose**: Facilitate international mobility by providing direct, immediate access to the Erasmus portals of all partner institutions.
- **Tech Stack**: HTML5, Vanilla CSS.
- **Key Features**: Alphabetical categorization of universities, interactive UI, and direct platform routing.

### 4. Work & Travel Portal (`/workandtravel`)
A parallel static portal to the Erasmus site, tailored specifically for students seeking summer work programs and international experience (e.g., USA Work & Travel).
- **Purpose**: Connect students with verified Work & Travel agencies and university-specific resources.
- **Tech Stack**: HTML5, Vanilla CSS.
- **Key Features**: Fast, static delivery and a unified design language mirroring the AUR branding.

## Design Philosophy

All platforms within this ecosystem share a unified, premium design language. The UI/UX prioritizes:
- **Rich Aesthetics**: Vibrant, harmonious color palettes integrated with a sleek dark mode.
- **Dynamic Interactions**: Micro-animations and hover effects that make the interfaces feel responsive and alive.
- **Mobile-First Accessibility**: Seamless experiences across all devices, ensuring students can access vital information on the go.

## Repository Structure

```
.
├── aliantauniversitararomana/  # Node.js Web Service (Main Site)
├── unilink/                    # Node.js Web Service (Student Dashboard & AI)
├── erasmus/                    # Static Site (Mobility Portal)
├── workandtravel/              # Static Site (Work & Travel Portal)
├── README.md                   # Project Documentation
└── deployment.md               # Detailed Hosting & Infrastructure Guide
```

---
*For infrastructure, hosting, and SEO optimization details, please refer to `deployment.md`.*
