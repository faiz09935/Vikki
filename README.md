# Academic Marksheet & Transcript Generator Portal

A production-ready, client-side web application built completely in English. It enables teachers and institutions to generate formal, MS Word and certificate-style academic marksheets with dynamic Written & Practical score calculations.

## Features
- **Strict English UI**: Zero non-English terms throughout the application code and presentation.
- **Dynamic Subject Marks**: Supports any marks distribution (70/30, 80/20, 60/40, 100/0, 50/50, etc.).
- **Practical Exam Toggle**: Choose "Yes" or "No" for practical assessment per subject. Non-practical subjects automatically disable practical marks and display "—".
- **Dynamic File Uploads**: Upload institutional logos and candidate photographs. Embedded base64 fallbacks ensure immediate visual preview even without custom uploads.
- **Strict Score Validation**: Rejects any marks higher than maximum thresholds or negative numbers before generation.
- **High-Fidelity Document Output**: Formatted with formal typography, dual-line borders, institutional grading scales, and official signature/seal blocks.
- **Print & PDF Ready**: Dedicated `@media print` stylesheets ensure pixel-perfect export to A4 PDF using the standard browser print dialog (`Ctrl+P` / `Cmd+P`).

## Setup & Execution
1. Extract the contents of this ZIP file.
2. Double-click `index.html` to open directly in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
3. No web servers, Node.js, or external runtime installations are required.
