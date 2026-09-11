# Indian Motor Insurance Policy Extractor

A Node.js + TypeScript web application that extracts structured data from Indian motor insurance policy documents using PDF text extraction and OCR.

## Features

- **Multi-format Support**: Upload PDF, JPG, JPEG, or PNG files
- **Smart Extraction**: Automatically detects digital PDFs vs scanned documents
- **OCR Fallback**: Uses Tesseract.js OCR for scanned/image-based documents
- **Comprehensive Fields**: Extracts policy, vehicle, insured, coverage, premium, and regulatory information
- **Confidence Scoring**: Each extracted field includes a confidence score
- **Indian Format Validation**: Validates Indian vehicle registration numbers, GSTIN, PAN, PIN codes
- **Clean UI**: Professional EJS-based web interface with tabbed results display

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Template Engine**: EJS
- **File Upload**: Multer
- **PDF Processing**: pdf-parse
- **OCR**: Tesseract.js
- **Image Processing**: Sharp
- **Validation**: Zod

## Project Structure

```
src/
  index.ts              # Application entry point
  app.ts                # Express app configuration
  
  routes/
    web.routes.ts       # Web UI routes
    extraction.routes.ts # API routes
  
  controllers/
    extraction.controller.ts # Request handlers
  
  services/
    extraction.service.ts # Main extraction orchestration
    pdf.service.ts        # PDF text extraction
    ocr.service.ts        # OCR processing
  
  extractors/
    policy.extractor.ts   # Policy field extraction
    vehicle.extractor.ts  # Vehicle field extraction
  
  schemas/
    motor-policy.schema.ts # Zod validation schemas
  
  utils/
    date.utils.ts         # Date parsing utilities
    vehicle.utils.ts      # Vehicle/RTO utilities
    text.utils.ts         # Text processing utilities

views/
  index.ejs             # Main upload/result page

public/
  css/styles.css        # Stylesheet
  js/app.js             # Frontend JavaScript

uploads/                # Temporary file storage
```

## Installation

```bash
# Clone the repository
cd your-project-directory

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Usage

1. Open http://localhost:3000 in your browser
2. Click to select or drag & drop a motor insurance policy document (PDF, JPG, JPEG, PNG)
3. Click "Extract Data" button
4. View the structured results in tabs:
   - **Structured Data**: Organized fields by category
   - **Raw Text**: Original extracted text

## API Endpoints

### POST /api/extract

Upload and extract data from a motor insurance policy document.

**Request:**
```
Content-Type: multipart/form-data

file: <PDF or image file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "documentType": "motor_insurance_policy",
      "policy": { ... },
      "vehicle": { ... },
      "insured": { ... },
      ...
    },
    "extraction": {
      "method": "pdf_text",
      "confidence": 0.95,
      "pages": 4,
      "warnings": []
    }
  },
  "rawText": "..."
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

## Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Supported Fields

### Policy Information
Policy number, type, status, dates, previous policy details, product info

### Vehicle Information
Registration number, make, model, fuel type, engine/chassis numbers, manufacturing details

### Insured Information
Name, address, contact details, PAN, GSTIN

### Coverage & Premium
Cover types, add-ons, IDV, premium breakdown, NCB, deductibles

### Regulatory
IRDAI registration, UIN, GSTIN

## Limitations

- OCR accuracy depends on image quality
- Complex table layouts may not be perfectly parsed
- Handwritten text is not supported
- Password-protected PDFs are not supported

## Adding New Extractors

To add support for new fields or insurers:

1. Create a new extractor in `src/extractors/`
2. Add label patterns for the new fields
3. Register the extractor in `extraction.service.ts`

## License

MIT
