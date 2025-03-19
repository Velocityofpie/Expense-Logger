# OCR Template Creation Guide

## Overview

This guide provides instructions for creating effective OCR templates to extract structured data from document text. OCR templates define patterns and rules that help identify important information in documents processed through Optical Character Recognition.

## Table of Contents

- [Understanding OCR Output](#understanding-ocr-output)
- [Template Structure](#template-structure)
- [Step-by-Step Template Creation Process](#step-by-step-template-creation-process)
- [Complete Sample Template](#complete-sample-template-for-acme-invoice)
- [Line Item Extraction](#creating-line-item-extraction)
- [Tips for Effective Template Creation](#tips-for-effective-template-creation)

## Understanding OCR Output

When analyzing OCR output to create a template, you need to:

1. Identify unique text markers that define the document type
2. Locate patterns around important data points
3. Create regex patterns to extract specific information

## Template Structure

A well-designed OCR template contains:

```json
{
  "name": "Template Name",
  "version": "1.0",
  "vendor": "Vendor Name",
  "description": "Description of what this template extracts",
  "identification": {
    "markers": [
      {"text": "unique_text_marker", "required": true},
      {"text": "secondary_marker", "required": false}
    ]
  },
  "fields": [
    {
      "field_name": "internal_field_name",
      "display_name": "Human-Readable Field Name",
      "data_type": "string|date|currency|integer|float|boolean|address",
      "extraction": {
        "regex": "Pattern before(capture group)pattern after",
        "alternative_regex": "Alternative pattern(capture group)",
        "post_processing": "trim|lowercase|uppercase"
      },
      "validation": {
        "pattern": "regex_validation_pattern",
        "required": true|false
      }
    }
  ]
}
```

## Step-by-Step Template Creation Process

### 1. Analyze OCR Text Output

Start by examining the raw OCR text output from the document type you want to template:

```
ACME Corporation
Invoice #INV-12345
Date: March 15, 2025

Bill To:
John Smith
123 Main Street
Anytown, CA 90210

Description                 Qty    Unit Price    Amount
Widget Pro                   2      $45.99      $91.98
Premium Service              1     $120.00     $120.00

Subtotal:                                      $211.98
Tax (8.25%):                                    $17.49
Total:                                         $229.47

Payment Method: Visa ending in 4321
```

### 2. Identify Unique Markers

Look for text that uniquely identifies this document type:

```json
"identification": {
  "markers": [
    {"text": "ACME Corporation", "required": true},
    {"text": "Invoice #INV-", "required": true}
  ]
}
```

### 3. Define Fields to Extract

Create regex patterns for each piece of information you want to extract:

```json
"fields": [
  {
    "field_name": "invoice_number",
    "display_name": "Invoice Number",
    "data_type": "string",
    "extraction": {
      "regex": "Invoice #(INV-\\d+)"
    },
    "validation": {
      "required": true
    }
  },
  {
    "field_name": "issue_date",
    "display_name": "Invoice Date",
    "data_type": "date",
    "extraction": {
      "regex": "Date: ([A-Za-z]+ \\d{1,2}, \\d{4})"
    },
    "validation": {
      "required": true
    }
  },
  {
    "field_name": "total_amount",
    "display_name": "Total Amount",
    "data_type": "currency",
    "extraction": {
      "regex": "Total:\\s+\\$(\\d+\\.\\d{2})"
    },
    "validation": {
      "required": true
    }
  },
  {
    "field_name": "payment_method",
    "display_name": "Payment Method",
    "data_type": "string",
    "extraction": {
      "regex": "Payment Method: ([\\w\\s]+ ending in \\d{4})"
    },
    "validation": {
      "required": false
    }
  }
]
```

## Complete Sample Template for ACME Invoice

Here's a full template example for the ACME invoice:

```json
{
  "name": "ACME Invoice",
  "version": "1.0",
  "vendor": "ACME Corporation",
  "description": "Template for extracting data from ACME Corporation invoices",
  "identification": {
    "markers": [
      {"text": "ACME Corporation", "required": true},
      {"text": "Invoice #INV-", "required": true}
    ]
  },
  "fields": [
    {
      "field_name": "invoice_number",
      "display_name": "Invoice Number",
      "data_type": "string",
      "extraction": {
        "regex": "Invoice #(INV-\\d+)"
      },
      "validation": {
        "pattern": "INV-\\d+",
        "required": true
      }
    },
    {
      "field_name": "issue_date",
      "display_name": "Invoice Date",
      "data_type": "date",
      "extraction": {
        "regex": "Date: ([A-Za-z]+ \\d{1,2}, \\d{4})"
      },
      "validation": {
        "required": true
      }
    },
    {
      "field_name": "customer_name",
      "display_name": "Customer Name",
      "data_type": "string",
      "extraction": {
        "regex": "Bill To:\\s+([A-Za-z\\s]+)"
      },
      "validation": {
        "required": false
      }
    },
    {
      "field_name": "customer_address",
      "display_name": "Customer Address",
      "data_type": "address",
      "extraction": {
        "regex": "Bill To:\\s+[A-Za-z\\s]+\\s+([^\\n]+)\\s+([^\\n]+)",
        "post_processing": "trim"
      },
      "validation": {
        "required": false
      }
    },
    {
      "field_name": "subtotal",
      "display_name": "Subtotal",
      "data_type": "currency",
      "extraction": {
        "regex": "Subtotal:\\s+\\$(\\d+\\.\\d{2})"
      },
      "validation": {
        "required": false
      }
    },
    {
      "field_name": "tax_amount",
      "display_name": "Tax Amount",
      "data_type": "currency",
      "extraction": {
        "regex": "Tax \\(\\d+\\.\\d+%\\):\\s+\\$(\\d+\\.\\d{2})"
      },
      "validation": {
        "required": false
      }
    },
    {
      "field_name": "total_amount",
      "display_name": "Total Amount",
      "data_type": "currency",
      "extraction": {
        "regex": "Total:\\s+\\$(\\d+\\.\\d{2})"
      },
      "validation": {
        "required": true
      }
    },
    {
      "field_name": "payment_method",
      "display_name": "Payment Method",
      "data_type": "string",
      "extraction": {
        "regex": "Payment Method: ([\\w\\s]+ ending in \\d{4})"
      },
      "validation": {
        "required": false
      }
    }
  ],
  "regions": {
    "header": {
      "top_marker": "ACME Corporation",
      "bottom_marker": "Bill To:"
    },
    "customer_info": {
      "top_marker": "Bill To:",
      "bottom_marker": "Description"
    },
    "line_items": {
      "top_marker": "Description",
      "bottom_marker": "Subtotal:"
    },
    "totals": {
      "top_marker": "Subtotal:",
      "bottom_marker": "Payment Method:"
    }
  }
}
```

## Creating Line Item Extraction

For extracting multiple line items from an invoice:

```json
{
  "field_name": "line_items",
  "display_name": "Line Items",
  "data_type": "array",
  "extraction": {
    "regex": "([\\w\\s]+)\\s+(\\d+)\\s+\\$(\\d+\\.\\d{2})\\s+\\$(\\d+\\.\\d{2})",
    "capture_groups": ["description", "quantity", "unit_price", "amount"]
  },
  "children": [
    {
      "field_name": "description",
      "display_name": "Description",
      "data_type": "string"
    },
    {
      "field_name": "quantity",
      "display_name": "Quantity",
      "data_type": "integer"
    },
    {
      "field_name": "unit_price",
      "display_name": "Unit Price",
      "data_type": "currency"
    },
    {
      "field_name": "amount",
      "display_name": "Line Amount",
      "data_type": "currency"
    }
  ],
  "validation": {
    "required": true
  }
}
```

## Tips for Effective Template Creation

1. **Be Specific with Markers**: Choose text that uniquely identifies the document type.

2. **Use Capture Groups in Regex**: Always wrap the data you want to extract in parentheses `()`.

3. **Provide Alternative Patterns**: OCR may produce variations in text, so include alternative patterns:
   ```json
   "extraction": {
     "regex": "Invoice #(\\w+-\\d+)",
     "alternative_regex": "Invoice Number: (\\w+-\\d+)"
   }
   ```

4. **Consider OCR Errors**: Regex patterns should be tolerant of common OCR errors (like '0' vs 'O').

5. **Test with Multiple Samples**: Develop templates using multiple document samples to ensure reliability.

6. **Use Proper Data Types**: Assign the correct data type to each field for proper validation and formatting.

7. **Define Field Dependencies**: For complex documents, define relationships between fields:
   ```json
   "dependencies": [
     {
       "field": "tax_amount",
       "depends_on": "subtotal",
       "calculation": "subtotal * 0.0825"
     }
   ]
   ```

8. **Region Definitions**: For complex documents, define regions to narrow the search scope for specific fields.

## Troubleshooting

If your template isn't extracting data correctly, try these steps:

1. **Verify OCR quality**: Poor OCR results make extraction difficult. Try improving document scanning.
2. **Check your regex patterns**: Test them on the raw OCR output using a regex testing tool.
3. **Add alternative patterns**: Include variations to handle different formatting.
4. **Adjust marker specificity**: Make markers unique but tolerant of OCR errors.

## Contributing

We welcome contributions to improve template extraction. Please follow these steps:

1. Create templates for common document types
2. Test thoroughly with multiple document samples
3. Submit a pull request with your template and documentation

## License

This documentation and sample templates are released under the MIT License.