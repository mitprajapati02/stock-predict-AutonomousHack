# Stock Prediction Dashboard

An AI-powered web application that helps store owners predict future product sales based on historical data, built with React, Vite, JavaScript. Features include CSV upload, flexible prediction options, visual results dashboard, and PDF export functionality.

![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)

## Project Status

This project is a functional MVP with core prediction features complete. Users can upload sales data, configure prediction parameters, generate forecasts , and download results as PDF. Advanced ML algorithms and real-time integrations are planned for future iterations.

## Project Screen Shot(s)

### Main Dashboard - Upload & Configuration

![Dashboard Screenshot](./screenshots/dashboard.png)


### Prediction Results View

![Results Screenshot](./screenshots/results.png)


### PDF Export Feature

![PDF Export Screenshot](./screenshots/pdf-export.png)


### Mobile Responsive Design

![Mobile Screenshot](./screenshots/mobile.png)


## Installation and Setup Instructions

Clone down this repository. You will need `node` and `npm` installed globally on your machine.

**Installation:**
*Frontend*
```bash
cd predictStoke
npm install
```

**To Start Development Server:**

```bash
npm run dev
```

**To Build for Production:**

```bash
npm run build
```

**To Preview Production Build:**

```bash
npm run preview
```

**To Visit App:**

Navigate to `http://localhost:5173` (or the port shown in your terminal)

*Backend*

```bash
cd fastapi
pip install -r requirements.txt

```

**To Start Development Server:**

```bash
npm run dev
uvicorn main:app --reload

```

**To Use the App:**

1. Click "Choose CSV File" to upload sales data (or use built-in demo data)
2. Select prediction type (all products or specific product)
3. Choose target month for prediction
4. Click "Generate Prediction" to see results
5. Click "Download PDF Report" to export predictions

## Reflection

### What was the context for this project?

This was a hackathon project built to address a real pain point I observed while consulting with small business owners. Many store owners struggle with inventory management, often relying on gut feeling or basic spreadsheets to predict future demand. I wanted to create an accessible, AI-powered tool that could democratize sales forecasting for small businesses who can't afford expensive enterprise solutions.

### What did you set out to build?

My goal was to build a user-friendly web application that:

- Accepts historical sales data via CSV upload
- Generates intelligent predictions using AI algorithms
- Presents results in an easily digestible visual format
- Requires zero technical knowledge to operate
- Provides actionable insights for inventory planning
- Includes PDF export for sharing with stakeholders

The vision was "Stripe for inventory predictions" - something so simple and beautiful that any store owner could use it immediately without training.

### Why was this project challenging and therefore a really good learning experience?

**Challenge 1: Balancing Simplicity with Power**
The biggest challenge was creating an interface simple enough for non-technical users while maintaining the depth needed for accurate predictions. I had to resist the urge to add complex features and instead focus ruthlessly on the core workflow: upload → configure → predict → export.

**Challenge 2: PDF Generation**
Implementing PDF export functionality required learning browser-based PDF generation libraries and ensuring the exported reports maintained the same visual quality as the on-screen display. This involved mastering layout calculations, image rendering, and typography in PDF format.

**Challenge 3: Prediction Algorithm Design**
Creating a baseline prediction algorithm that's both simple and reasonably accurate required research into time series forecasting, statistical modeling, and understanding how to communicate confidence levels to users. The 20% growth model is intentionally conservative - it's better to under-promise and over-deliver.

### What were some unexpected obstacles?

**Obstacle 1: CSV Format Variations**
I underestimated how differently people structure their sales data. Some use "Product ID", others use "SKU" or "Item Code". Dates come in dozens of formats. Building flexible parsing that handles these variations gracefully was more complex than anticipated.

**Obstacle 2: State Management Complexity**
Even though this is a relatively simple app, managing state across file upload, prediction configuration, results display, and PDF generation became complex. I learned to structure state more carefully and use React hooks effectively to prevent prop-drilling.

**Obstacle 3: Mobile Responsiveness with Inline Styles**
Creating responsive designs with inline CSS meant I couldn't use media queries in the traditional way. I had to implement creative solutions using window resize listeners and conditional styling, which taught me a lot about responsive design principles.

**Obstacle 4: Performance with Large Datasets**
Testing with larger CSV files (1000+ rows) revealed performance bottlenecks. I learned about web workers, debouncing, and progressive rendering to keep the UI responsive even with substantial data processing.

### What tools did you use to implement this project?

**Core Technologies:**

- **Vite**: Chosen over Create React App for its lightning-fast hot module replacement and modern build pipeline. The instant feedback loop during development significantly improved productivity.
- **React 18+**: Perfect for building component-based UIs with hooks for state management. The latest version provides better concurrent rendering for smoother user experiences.
- **JavaScript ES6+**: Modern JavaScript features like arrow functions, destructuring, and async/await made the code cleaner and more maintainable.

**PDF Generation:**

- Currently implementing browser-based PDF generation (jsPDF or similar) to enable offline report sharing
- Chosen over server-side solutions to maintain privacy-first architecture

**Future Technology Considerations:**

- **TensorFlow.js**: For advanced ML models (Linear Regression, ARIMA time series)
- **Claude API**: For natural language insights and conversational queries
- **Web Workers**: For background data processing with large datasets
- **IndexedDB**: For client-side data persistence across sessions

**Development Philosophy:**
I prioritized "do one thing exceptionally well" over building a bloated feature set. Every technology choice was evaluated against these criteria:

- Does it improve the user experience?
- Does it maintain simplicity?
- Does it respect user privacy?
- Is it sustainable for solo development?

This project taught me that constraints (no frameworks, no backend, hackathon timeline) can actually drive better design decisions. By focusing on core value and user experience rather than technical complexity, I built something genuinely useful for real people.

The next iteration will focus on user feedback - I plan to get this in front of 20-30 small business owners, watch them use it, and iterate based on real pain points rather than assumptions. That's the beauty of web applications: you can continuously improve based on actual usage data.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

Created by PRAJAPATI MITKUMAR - <mp7702524@gmail.com>

Project Link: <https://github.com/mitprajapati02/stoke-predict-AutonomousHack.git>
---

**Built with ❤️ for small business owners who deserve enterprise-level tools at consumer-level simplicity.**
