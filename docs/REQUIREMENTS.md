# LangChat Slides - 需求分析与实施文档

## 1. 项目概述
本项目 "LangChat Slides" 旨在利用 AI (OpenAI) 的能力，将自然语言转化为基于 `@antv/infographic` 语法的结构化数据，从而动态生成精美的幻灯片（信息图）。项目采用纯前端架构，利用 Vue 3 + Tailwind CSS + shadcn-vue 构建现代化 UI。

## 2. 核心功能
1.  **AI 对话交互**：用户通过自然语言描述幻灯片需求。
2.  **幻灯片实时生成**：AI 输出 `@antv/infographic` 语法，前端实时渲染预览。
3.  **多页管理**：支持生成多张幻灯片，提供缩略图预览与切换。
4.  **导出功能**：支持将幻灯片导出为 PDF 或 PPT (图片形式) 格式。

## 3. 技术架构

### 3.1 技术栈
*   **Framework**: Vue 3 (Composition API)
*   **Styling**: Tailwind CSS v4, shadcn-vue (UI Components)
*   **Icons**: Lucide Vue Next
*   **AI Integration**: OpenAI SDK (Frontend direct call), Vercel AI SDK (Optional for helpers)
*   **Visualization**: `@antv/infographic`
*   **Export**: `html2canvas` + `jspdf` (方案待定，拟采用截图方式生成PDF)

### 3.2 目录结构规划
```text
src/
├── api/
│   └── ai.ts            # OpenAI 调用封装 (Streaming)
├── assets/
│   └── prompts/         # 系统提示词 (prompt.md, SKILL.md 等)
├── components/
│   ├── chat/
│   │   ├── ChatContainer.vue
│   │   ├── ChatMessage.vue
│   │   └── ChatInput.vue
│   ├── slides/
│   │   ├── SlidePreview.vue # 核心渲染组件
│   │   ├── SlideThumbnail.vue
│   │   └── SlideToolbar.vue # 导出按钮等
│   └── layout/
│       └── Header.vue
├── stores/
│   └── useAppStore.ts   # 状态管理 (Chat history, Current slides)
├── types/
│   └── index.ts
├── App.vue              # 主布局 (Resizable Split View)
└── main.ts
```

## 4. 模块设计

### 4.1 布局模块 (Layout)
*   **Header**: 展示 Logo, Github 链接, 官网链接。
*   **Main**: 使用 `ResizablePanelGroup` 实现左右拖拽布局。
    *   Left: Chat Area (30%-50%)
    *   Right: Slide Area (50%-70%)

### 4.2 聊天模块 (Chat)
*   **Message List**: 渲染用户和 AI 消息。
    *   *Feature*: AI 消息若过长（如包含详细解释），默认折叠，点击展开。
*   **Input Area**: 文本输入框 + 发送按钮 + 配置(流式开关)。
*   **AI Service**:
    *   加载 `prompt.md` / `SKILL.md` 作为 System Prompt。
    *   调用 OpenAI Chat Completion API (Stream mode)。
    *   解析 Stream chunk，分离 "思考/解释文本" 和 "代码块/语法文本"。

### 4.3 幻灯片渲染模块 (Slides)
*   **Data Structure**:
    ```typescript
    interface Slide {
      id: string;
      syntax: string; // @antv/infographic 语法
      thumbnail?: string;
    }
    ```
*   **Rendering**: 监听当前选中的 Slide syntax，调用 `infographic.render(syntax)`。
*   **Pagination**: 左侧栏展示缩略图列表，点击切换 `currentSlideIndex`。

### 4.4 导出模块
*   利用 `html2canvas` 捕获 DOM 节点，生成图片，再封装进 PDF。

## 5. 实施步骤 (Pseudo-code Plan)

### Phase 1: 基础搭建
1.  初始化 Tailwind, Shadcn components (Button, Resizable, ScrollArea, etc.)。
2.  搭建 App Layout。

### Phase 2: AI 服务与 Prompt 集成
1.  读取 `src/assets/prompts`。
2.  实现 `streamOpenAIResponse(messages, onChunk)`。

### Phase 3: 核心渲染逻辑
1.  实现 `SlidesVis.vue` 的通用化。
2.  解析 AI 返回的 Markdown，提取 ```infographic 代码块。
3.  实现 Chat 到 Slides 的数据流：Chat -> AI -> Syntax -> Store -> Slide Component。

### Phase 4: 完善与导出
1.  实现多页管理 (Array of Slides)。
2.  实现 HTML -> Canvas -> PDF 导出。
3.  UI 美化。

