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

# Create a proper types.ts file with valid exports
RUN echo '// src/features/tools/types.ts\n\
/**\n\
 * OCR language definition\n\
 */\n\
export interface OcrLanguage {\n\
  code: string;\n\
  name: string;\n\
}\n\
\n\
/**\n\
 * OCR extraction result\n\
 */\n\
export interface OcrResult {\n\
  text: string;\n\
  confidence?: number;\n\
  pages?: number;\n\
}\n\
\n\
/**\n\
 * OCR request options\n\
 */\n\
export interface OcrRequestOptions {\n\
  language?: string;\n\
  dpi?: number;\n\
  preprocess?: boolean;\n\
  page_start?: number;\n\
  page_end?: number;\n\
}\n\
\n\
/**\n\
 * Template marker for document identification\n\
 */\n\
export interface TemplateMarker {\n\
  text: string;\n\
  required: boolean;\n\
}\n\
\n\
/**\n\
 * Template field definition for data extraction\n\
 */\n\
export interface TemplateField {\n\
  field_name: string;\n\
  display_name?: string;\n\
  data_type: string;\n\
  extraction: {\n\
    regex: string;\n\
    alternative_regex?: string;\n\
  };\n\
  validation?: {\n\
    required?: boolean;\n\
  };\n\
}\n\
\n\
/**\n\
 * Complete template definition\n\
 */\n\
export interface Template {\n\
  template_id: number;\n\
  name: string;\n\
  vendor?: string;\n\
  version?: string;\n\
  description?: string;\n\
  created_at: string;\n\
  updated_at?: string;\n\
  template_data: {\n\
    identification: {\n\
      markers: TemplateMarker[];\n\
    };\n\
    fields: TemplateField[];\n\
  };\n\
}\n\
\n\
/**\n\
 * Result of testing a template against an invoice\n\
 */\n\
export interface TemplateTestResult {\n\
  success: boolean;\n\
  match_score: number;\n\
  fields_matched: number;\n\
  fields_total: number;\n\
  extracted_data: Record<string, string>;\n\
}' > ./src/features/tools/types.ts

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