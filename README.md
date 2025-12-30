# LangChat Slides - Next-Gen AI Slide Generator

<div align="center">

**LangChat Slides** is an intelligent slide generation tool powered by Generative AI. Built by the LangChat Team.

<img src="docs/slides.gif" alt="LangChat Slides Demo" width="800" />

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[Website](https://www.langchat.cn) · [Preview](https://slides.langchat.cn) · [Documentation](docs) · [GitHub](https://github.com/langchat) · [Report Bug](mailto:langchat@outlook.com)

**[🇨🇳 中文文档](README_CN.md)** | **[English README](README.md)**

</div>

---

## 📖 About LangChat Pro

**LangChat Pro** is an enterprise-level AIGC (AI Generated Content) platform, a full-stack AI application system based on Spring Boot 3 + LangChain4j + Vue3 + VueFlow.

**LangChat Slides** is one of the flagship products of LangChat Pro, leveraging the powerful model capabilities of LangChat and the visualization engine of `@antv/infographic`. Users can simply input natural language descriptions to instantly generate clear, well-designed infographic slides.

---

### 💎 About LangChat Pro Commercial Edition

**LangChat Pro** is an **enterprise-grade AIGC application development platform commercial edition** built on the Java ecosystem, providing enterprises with complete AI large model integration solutions. Built on Spring Boot 3 and Vue 3, it supports rapid development of intelligent knowledge bases, multimodal AI applications, and intelligent workflows, helping enterprises achieve AI-driven digital transformation.

**Official Website**: http://langchat.cn/

**Open Source Edition**: https://github.com/tycoding/langchat (Basic features)

**Commercial Edition Consultation**: Add WeChat **LangchainChat** (Note: Company Name + [Consultation Content])

![workflows](docs/workflows.jpg)

## ✨ Features

- ⚡️ **Real-time Streaming Generation**: What you see is what you get - slides render instantly as the AI thinks
- 🎨 **Intelligent Layout Design**: Based on declarative visualization syntax, automatically adapts to the best layout,告别繁琐的 PPT 拖拽
- 💬 **Conversational Editing**: Not satisfied? Just tell the AI "change the title to red" or "add a timeline" and see immediate results
- 🧩 **Modular Components**: Based on Shadcn UI and Tailwind CSS, featuring a modern, minimal, and premium user experience
- 📤 **Easy Export**: One-click PDF export to easily share your creativity

## 🎯 Use Cases

- **Quick Reports**: Generate project progress report pages in minutes
- **Knowledge Popularization**: Transform complex concepts into timelines, lists, or hierarchy diagrams
- **Data Presentation**: Visual representation of structured data

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API) + TypeScript
- **Styling**: Tailwind CSS v4, shadcn-vue (UI Components)
- **State Management**: Pinia
- **Icons**: Lucide Vue Next
- **Visualization**: `@antv/infographic`
- **Export**: `html2canvas` + `jspdf`

### AI Integration
- **OpenAI SDK**: Direct frontend integration with streaming support
- **Vercel AI SDK**: Helper utilities (optional)

### Development Tools
- **Build Tool**: Vite 7
- **Package Manager**: pnpm
- **Code Quality**: TypeScript strict mode, ESLint

## 📁 Project Structure

```
langchat-slides/
├── docs/                    # Documentation
│   ├── PRODUCT.md           # Product introduction
│   └── REQUIREMENTS.md      # Requirements & implementation
├── public/                  # Static assets
├── src/
│   ├── api/                 # API integration
│   │   └── ai.ts           # OpenAI API wrapper
│   ├── assets/
│   │   └── prompts/        # System prompts
│   ├── components/
│   │   ├── chat/           # Chat components
│   │   ├── slides/         # Slide components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI components (shadcn-vue)
│   ├── composables/        # Vue composables
│   ├── lib/                # Utility functions
│   ├── locales/            # i18n translations
│   ├── stores/             # Pinia stores
│   └── types/              # TypeScript definitions
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── package.json
└── vite.config.ts
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.x
- pnpm >= 8.x
- OpenAI API Key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/langchat/langchat-slides.git
   cd langchat-slides
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

   Access at `http://localhost:5173`

5. **Build for production**
   ```bash
   pnpm build
   ```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/langchat/langchat-slides.git
   cd langchat-slides
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Build the Docker image**
   ```bash
   docker-compose build
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   The application will be available at `http://localhost:5173`

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

6. **Stop the service**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the Docker image**
   ```bash
   docker build -t langchat-slides .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name langchat-slides \
     -p 5173:5173 \
     -e VITE_OPENAI_API_KEY=your-api-key \
     langchat-slides
   ```

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-api-key-here
VITE_OPENAI_MODEL=gpt-4o

# Application Configuration
VITE_APP_LOCALE=en
VITE_APP_THEME=auto
```

## 📖 Usage Guide

### Creating Slides

1. **Describe your needs**: Type your slide requirements in natural language
    - Example: "Create a timeline showing the history of AI from 1950 to 2024"

2. **Real-time generation**: Watch as AI generates and renders slides in real-time

3. **Iterative refinement**: Chat with AI to make adjustments
    - "Change the color theme to blue"
    - "Add more details about machine learning"
    - "Make the timeline horizontal"

4. **Export**: Click the export button to download as PDF

### Features

- **Multi-page slides**: Generate multiple slides with thumbnail navigation
- **Customization**: Modify layouts, colors, and content through conversation
- **Export options**: Save as PDF or image format
- **Theme support**: Light/Dark modes with multiple color themes

## 🏗️ Architecture

### Component Architecture

```
App.vue (Main Layout)
├── Header
│   ├── Logo
│   ├── Theme Toggle
│   └── Language Switcher
├── ResizablePanelGroup
│   ├── Chat Area
│   │   ├── ChatContainer
│   │   │   ├── ChatMessage (User/AI)
│   │   │   └── ChatInput
│   │   └── ExampleGenerator
│   └── Slide Area
│       ├── SlidesContainer
│       │   ├── SlidePreview
│       │   └── SlideThumbnail
│       └── SlideToolbar
└── SettingsDialog
```

### Data Flow

```
User Input → ChatInput → OpenAI API (Stream)
              ↓
         Parse Markdown
              ↓
         Extract Infographic Syntax
              ↓
         Update Pinia Store
              ↓
         Reactive Render in SlidePreview
              ↓
         Export (html2canvas → jspdf)
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

- **Website**: https://www.langchat.cn
- **Email**: langchat@outlook.com
- **Team**: LangChat Team

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for providing powerful AI models
- [AntV](https://antv.vision/) for the infographic visualization engine
- [Vue.js](https://vuejs.org/) for the reactive framework
- [Shadcn](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

**Developed with ❤️ by LangChat Team**
