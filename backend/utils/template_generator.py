# utils/template_generator.py
import json
import os
from typing import Dict, Any

def generate_amazon_template() -> Dict[str, Any]:
    """Generate a template for Amazon invoices."""
    return {
        "name": "Amazon Invoice Template",
        "vendor": "Amazon",
        "version": "1.0",
        "description": "Template for extracting data from Amazon invoices",
        "template_data": {
            "identification": {
                "markers": [
                    {"text": "amazon", "required": True},
                    {"text": "order", "required": False}
                ],
                "min_match_score": 0.3
            },
            "fields": [
                {
                    "field_name": "order_number",
                    "display_name": "Order Number",
                    "data_type": "string",
                    "extraction": {
                        "regex": r"order\s*#?\s*:?\s*([A-Z0-9\-]+)",
                        "alternative_regex": r"order\s*number\s*:?\s*([A-Z0-9\-]+)",
                        "additional_patterns": [
                            r"order\s*id\s*:?\s*([A-Z0-9\-]+)",
                            r"#\s*([A-Z0-9\-]+)"
                        ],
                        "post_processing": "trim"
                    },
                    "validation": {
                        "required": True
                    }
                },
                {
                    "field_name": "purchase_date",
                    "display_name": "Purchase Date",
                    "data_type": "date",
                    "extraction": {
                        "regex": r"order\s*date\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})",
                        "alternative_regex": r"date\s*of\s*purchase\s*:?\s*(\d{1,2}/\d{1,2}/\d{4})",
                        "additional_patterns": [
                            r"date\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})",
                            r"(\d{1,2}/\d{1,2}/\d{4})"
                        ],
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "merchant_name",
                    "display_name": "Merchant",
                    "data_type": "string",
                    "extraction": {
                        "regex": r"sold\s*by\s*:?\s*([^\n]+)",
                        "alternative_regex": r"seller\s*:?\s*([^\n]+)",
                        "post_processing": "trim"
                    },
                    "validation": {
                        "required": False
                    },
                    "default_value": "Amazon"
                },
                {
                    "field_name": "grand_total",
                    "display_name": "Grand Total",
                    "data_type": "currency",
                    "extraction": {
                        "regex": r"order\s*total\s*:?\s*\$?(\d+\.\d{2})",
                        "alternative_regex": r"grand\s*total\s*:?\s*\$?(\d+\.\d{2})",
                        "additional_patterns": [
                            r"total\s*:?\s*\$?(\d+\.\d{2})",
                            r"total\s*\$?(\d+\.\d{2})"
                        ],
                        "post_processing": "trim"
                    },
                    "validation": {
                        "required": True
                    }
                },
                {
                    "field_name": "shipping_handling",
                    "display_name": "Shipping & Handling",
                    "data_type": "currency",
                    "extraction": {
                        "regex": r"shipping\s*&?\s*handling\s*:?\s*\$?(\d+\.\d{2})",
                        "alternative_regex": r"shipping\s*:?\s*\$?(\d+\.\d{2})",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "estimated_tax",
                    "display_name": "Estimated Tax",
                    "data_type": "currency",
                    "extraction": {
                        "regex": r"estimated\s*tax\s*:?\s*\$?(\d+\.\d{2})",
                        "alternative_regex": r"tax\s*:?\s*\$?(\d+\.\d{2})",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "items",
                    "display_name": "Items",
                    "data_type": "array",
                    "extraction": {
                        "regex": r"(\d+)\s*x\s*([^$]+)\s*\$?(\d+\.\d{2})",
                        "capture_groups": {
                            "quantity": 1,
                            "product_name": 2,
                            "unit_price": 3
                        }
                    }
                },
                {
                    "field_name": "payment_method",
                    "display_name": "Payment Method",
                    "data_type": "string",
                    "extraction": {
                        "regex": r"payment\s*method\s*:?\s*([^\n]+)",
                        "alternative_regex": r"paid\s*with\s*:?\s*([^\n]+)",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "categories",
                    "display_name": "Categories",
                    "data_type": "array",
                    "extraction": {
                        "regex": r"electronics|books|clothing|grocery|home|office",
                        "post_processing": "trim"
                    },
                    "default_value": ["Online Shopping"]
                }
            ]
        }
    }

def generate_walmart_template() -> Dict[str, Any]:
    """Generate a template for Walmart invoices."""
    return {
        "name": "Walmart Invoice Template",
        "vendor": "Walmart",
        "version": "1.0",
        "description": "Template for extracting data from Walmart invoices",
        "template_data": {
            "identification": {
                "markers": [
                    {"text": "walmart", "required": True},
                    {"text": "receipt", "required": False}
                ],
                "min_match_score": 0.3
            },
            "fields": [
                {
                    "field_name": "order_number",
                    "display_name": "Order/Receipt Number",
                    "data_type": "string",
                    "extraction": {
                        "regex": r"receipt\s*#?\s*:?\s*(\w+\-?\d+)",
                        "alternative_regex": r"tc\s*#?\s*:?\s*(\w+\-?\d+)",
                        "additional_patterns": [
                            r"transaction\s*#?\s*:?\s*(\w+\-?\d+)",
                            r"order\s*#?\s*:?\s*(\w+\-?\d+)"
                        ],
                        "post_processing": "trim"
                    },
                    "validation": {
                        "required": True
                    }
                },
                {
                    "field_name": "purchase_date",
                    "display_name": "Purchase Date",
                    "data_type": "date",
                    "extraction": {
                        "regex": r"(\d{1,2}/\d{1,2}/\d{2,4})\s*\d{1,2}:\d{2}",
                        "alternative_regex": r"date\s*:?\s*(\d{1,2}/\d{1,2}/\d{2,4})",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "merchant_name",
                    "display_name": "Merchant",
                    "data_type": "string",
                    "default_value": "Walmart"
                },
                {
                    "field_name": "grand_total",
                    "display_name": "Grand Total",
                    "data_type": "currency",
                    "extraction": {
                        "regex": r"total\s*\$?\s*(\d+\.\d{2})",
                        "alternative_regex": r"amount\s*\$?\s*(\d+\.\d{2})",
                        "post_processing": "trim"
                    },
                    "validation": {
                        "required": True
                    }
                },
                {
                    "field_name": "estimated_tax",
                    "display_name": "Tax",
                    "data_type": "currency",
                    "extraction": {
                        "regex": r"tax\s*\$?\s*(\d+\.\d{2})",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "items",
                    "display_name": "Items",
                    "data_type": "array",
                    "extraction": {
                        "regex": r"(\d+)\s+([^$\n]+)\s+\$?(\d+\.\d{2})",
                        "capture_groups": {
                            "quantity": 1,
                            "product_name": 2,
                            "unit_price": 3
                        }
                    }
                },
                {
                    "field_name": "payment_method",
                    "display_name": "Payment Method",
                    "data_type": "string",
                    "extraction": {
                        "regex": r"payment\s*type\s*:?\s*([^\n]+)",
                        "alternative_regex": r"(?:visa|mastercard|credit card|debit card|cash)",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "categories",
                    "display_name": "Categories",
                    "data_type": "array",
                    "default_value": ["Retail", "Grocery"]
                }
            ]
        }
    }

def generate_generic_invoice_template() -> Dict[str, Any]:
    """Generate a template for generic invoices."""
    return {
        "name": "Generic Invoice Template",
        "vendor": "Generic",
        "version": "1.0",
        "description": "Template for extracting data from generic invoices",
        "template_data": {
            "identification": {
                "markers": [
                    {"text": "invoice", "required": False},
                    {"text": "receipt", "required": False},
                    {"text": "order", "required": False},
                    {"text": "total", "required": False}
                ],
                "min_match_score": 0.2  # Lower threshold for generic template
            },
            "fields": [
                {
                    "field_name": "order_number",
                    "display_name": "Invoice/Order Number",
                    "data_type": "string",
                    "extraction": {
                        "regex": r"(?:invoice|order|receipt)\s*(?:no|num|number|#)?\s*[\s:]*([a-zA-Z0-9\-_]+)",
                        "alternative_regex": r"(?:inv|ord|rcpt)[\s:]*#?\s*([a-zA-Z0-9\-_]+)",
                        "additional_patterns": [
                            r"#\s*([a-zA-Z0-9\-_]+)",
                            r"number\s*:?\s*([a-zA-Z0-9\-_]+)"
                        ],
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "purchase_date",
                    "display_name": "Date",
                    "data_type": "date",
                    "extraction": {
                        "regex": r"(?:date|issued|purchased)(?:d|ed)?\s*(?:on|at)?[\s:]*([a-zA-Z0-9/\-\., ]+)",
                        "alternative_regex": r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
                        "additional_patterns": [
                            r"([a-zA-Z]{3,9}\s+\d{1,2},?\s+\d{4})",
                            r"(\d{4}[/-]\d{1,2}[/-]\d{1,2})"
                        ],
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "merchant_name",
                    "display_name": "Merchant/Vendor",
                    "data_type": "string",
                    "extraction": {
                        "regex": r"(?:from|seller|vendor|merchant|company|business)[\s:]+([a-zA-Z0-9\s&.,]+)",
                        "alternative_regex": r"(?:bill|invoice)\s+from\s+([a-zA-Z0-9\s&.,]+)",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "grand_total",
                    "display_name": "Total Amount",
                    "data_type": "currency",
                    "extraction": {
                        "regex": r"(?:total|amount|sum|balance)(?:due|:|\s)+[$€£]?\s*(\d+[.,]\d{2})",
                        "alternative_regex": r"(?:grand|overall)\s+total[\s:]*[$€£]?\s*(\d+[.,]\d{2})",
                        "additional_patterns": [
                            r"(?:total|amount)(?:due|:|\s)+[$€£]?\s*(\d+)",
                            r"[$€£]\s*(\d+[.,]\d{2})"
                        ],
                        "post_processing": "trim"
                    },
                    "validation": {
                        "required": True
                    }
                },
                {
                    "field_name": "shipping_handling",
                    "display_name": "Shipping & Handling",
                    "data_type": "currency",
                    "extraction": {
                        "regex": r"(?:shipping|delivery|handling)(?:\s*&\s*|\s+)(?:fee|cost|charge)?[\s:]*[$€£]?\s*(\d+[.,]\d{2})",
                        "alternative_regex": r"s(?:hipping|delivery)[\s:]*[$€£]?\s*(\d+[.,]\d{2})",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "estimated_tax",
                    "display_name": "Tax",
                    "data_type": "currency",
                    "extraction": {
                        "regex": r"(?:tax|vat|sales\s+tax)[\s:]*[$€£]?\s*(\d+[.,]\d{2})",
                        "alternative_regex": r"(?:estimated\s+tax|gst|hst)[\s:]*[$€£]?\s*(\d+[.,]\d{2})",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "items",
                    "display_name": "Items",
                    "data_type": "array",
                    "extraction": {
                        "regex": r"(\d+)\s*x\s*([^$\n]+?)\s*[$€£]?\s*(\d+[.,]\d{2})",
                        "capture_groups": {
                            "quantity": 1,
                            "product_name": 2,
                            "unit_price": 3
                        }
                    }
                },
                {
                    "field_name": "payment_method",
                    "display_name": "Payment Method",
                    "data_type": "string",
                    "extraction": {
                        "regex": r"(?:payment|paid)(?:method|type|via|with|by)?[\s:]*([a-zA-Z0-9\s]+)",
                        "alternative_regex": r"(?:visa|mastercard|american express|discover|credit card|debit card|cash|check|paypal)",
                        "post_processing": "trim"
                    }
                },
                {
                    "field_name": "categories",
                    "display_name": "Categories",
                    "data_type": "array",
                    "default_value": ["Uncategorized"]
                }
            ]
        }
    }

def save_template(template: Dict[str, Any], filename: str) -> None:
    """Save a template to a JSON file."""
    with open(filename, 'w') as f:
        json.dump(template, f, indent=2)

def main():
    """Generate and save sample templates."""
    # Create templates directory if it doesn't exist
    templates_dir = "templates"
    os.makedirs(templates_dir, exist_ok=True)
    
    # Generate and save templates
    templates = {
        "amazon.json": generate_amazon_template(),
        "walmart.json": generate_walmart_template(),
        "generic.json": generate_generic_invoice_template()
    }
    
    for filename, template in templates.items():
        path = os.path.join(templates_dir, filename)
        save_template(template, path)
        print(f"Generated template: {path}")
    
    print("All templates generated successfully!")

if __name__ == "__main__":
    main()