# Build stage
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with forced resolutions
RUN npm install --legacy-peer-deps
# Fix the specific dependency issue
RUN npm install ajv@8.11.0 ajv-keywords@5.1.0 --legacy-peer-deps

# Copy source code and config files
COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json tsconfig.paths.json postcss.config.js tailwind.config.js ./

# Fix import paths in invoice files
RUN find ./src/features/invoices -type f -name "*.tsx" -exec sed -i 's/from '\''\.\.\/shared'\''/from '\''\.\.\/\.\.\/shared'\''/g' {} \;
RUN find ./src/features/invoices -type f -name "*.tsx" -exec sed -i 's/from '\''\.\.\/shared\/\([^'\'']*\)'\''/from '\''\.\.\/\.\.\/shared\/\1'\''/g' {} \;

# Create index.tsx if it doesn't exist
RUN if [ ! -f ./src/index.tsx ]; then \
    echo '// src/index.tsx\n\
import React from "react";\n\
import { createRoot } from "react-dom/client";\n\
import "./styles/global.css";\n\
import App from "./App";\n\
\n\
const container = document.getElementById("root");\n\
if (!container) throw new Error("Failed to find the root element");\n\
const root = createRoot(container);\n\
\n\
root.render(\n\
  <React.StrictMode>\n\
    <App />\n\
  </React.StrictMode>\n\
);' > ./src/index.tsx; \
fi

# Ensure tools directory exists
RUN mkdir -p ./src/features/tools

# Write the types.ts file
COPY <<-EOT /app/src/features/tools/types.ts
// src/features/tools/types.ts
export interface OcrLanguage {
  code: string;
  name: string;
}

export interface OcrResult {
  text: string;
  confidence?: number;
  pages?: number;
}

export interface OcrRequestOptions {
  language?: string;
  dpi?: number;
  preprocess?: boolean;
  page_start?: number;
  page_end?: number;
}

export interface TemplateMarker {
  text: string;
  required: boolean;
}

export interface TemplateField {
  field_name: string;
  display_name?: string;
  data_type: string;
  extraction: {
    regex: string;
    alternative_regex?: string;
  };
  validation?: {
    required?: boolean;
  };
}

export interface Template {
  template_id: number;
  name: string;
  vendor?: string;
  version?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  template_data: {
    identification: {
      markers: TemplateMarker[];
    };
    fields: TemplateField[];
  };
}

export interface TemplateTestResult {
  success: boolean;
  match_score: number;
  fields_matched: number;
  fields_total: number;
  extracted_data: Record<string, string>;
}
EOT

# Write the toolsApi.ts file
COPY <<-EOT /app/src/features/tools/toolsApi.ts
// src/features/tools/toolsApi.ts
import { OcrLanguage, OcrResult, OcrRequestOptions, Template, TemplateTestResult } from "./types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function extractOcrText(file: File, options: OcrRequestOptions = {}): Promise<OcrResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    if (options.language) formData.append("language", options.language);
    if (options.dpi) formData.append("dpi", options.dpi.toString());
    if (options.preprocess !== undefined) formData.append("preprocess", options.preprocess.toString());
    if (options.page_start !== undefined) formData.append("page_start", options.page_start.toString());
    if (options.page_end !== undefined) formData.append("page_end", options.page_end.toString());
    
    const response = await fetch(`\${API_URL}/ocr/extract/`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "OCR processing failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("OCR extraction error:", error);
    throw error;
  }
}

export async function fetchOcrLanguages(): Promise<OcrLanguage[]> {
  try {
    const response = await fetch(`\${API_URL}/ocr/languages/`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch OCR languages");
    }
    
    const data = await response.json();
    return data.languages;
  } catch (error) {
    console.error("Error fetching OCR languages:", error);
    return [
      { code: "eng", name: "English" },
      { code: "fra", name: "French" },
      { code: "deu", name: "German" },
      { code: "spa", name: "Spanish" }
    ];
  }
}

export async function fetchTemplates(): Promise<Template[]> {
  try {
    const response = await fetch(`\${API_URL}/templates/`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch templates");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
}

export async function fetchTemplateById(id: number): Promise<Template> {
  try {
    const response = await fetch(`\${API_URL}/templates/\${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch template");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching template:", error);
    throw error;
  }
}

export async function createTemplate(templateData: Partial<Template>): Promise<Template> {
  try {
    const response = await fetch(`\${API_URL}/templates/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create template");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
}

export async function updateTemplate(id: number, templateData: Partial<Template>): Promise<Template> {
  try {
    const response = await fetch(`\${API_URL}/templates/\${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update template");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error updating template:", error);
    throw error;
  }
}

export async function deleteTemplate(id: number): Promise<void> {
  try {
    const response = await fetch(`\${API_URL}/templates/\${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete template");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}

export async function importTemplate(formData: FormData): Promise<Template> {
  try {
    const response = await fetch(`\${API_URL}/templates/import`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to import template");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error importing template:", error);
    throw error;
  }
}

export async function testTemplate(templateId: number, invoiceId: number): Promise<TemplateTestResult> {
  try {
    const response = await fetch(`\${API_URL}/templates/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: templateId,
        invoice_id: invoiceId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to test template");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error testing template:", error);
    throw error;
  }
}

export async function fetchInvoices(skip = 0, limit = 10): Promise<any[]> {
  try {
    const response = await fetch(`\${API_URL}/invoices/?skip=\${skip}&limit=\${limit}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch invoices");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}
EOT

# Write the index.ts file
COPY <<-EOT /app/src/features/tools/index.ts
// src/features/tools/index.ts

// Export tools components
export { default as Tools } from "./Tools";
export { default as OcrExtractor } from "./OcrExtractor";
export { default as TemplateManager } from "./TemplateManager";

// Export API utilities
export * from "./toolsApi";

// Export types
export * from "./types";
EOT

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create docker-entrypoint.sh file
RUN echo '#!/bin/sh\n\
# Replace env vars in JavaScript files\n\
echo "Replacing environment variables..."\n\
for file in /usr/share/nginx/html/static/js/*.js; do\n\
  echo "Processing $file ..."\n\
  sed -i "s|%REACT_APP_API_URL%|${REACT_APP_API_URL}|g" $file\n\
  sed -i "s|%REACT_APP_ENV%|${REACT_APP_ENV}|g" $file\n\
done\n\
\n\
echo "Starting Nginx..."\n\
exec nginx -g "daemon off;"\n\
' > /docker-entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Start Nginx
ENTRYPOINT ["/docker-entrypoint.sh"]