# utils/ocr_debug.py
import argparse
import json
import os
import sys
import re
import logging
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from features.ocr.services import extract_text_from_file
from utils.template_generator import generate_amazon_template, generate_walmart_template, generate_generic_invoice_template

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('ocr_debug.log')
    ]
)
logger = logging.getLogger('ocr_debug')

def extract_and_save_text(file_path: str, output_dir: str) -> str:
    """
    Extract text from a file and save it to a text file.
    
    Args:
        file_path: Path to the input file (PDF, JPG, etc.)
        output_dir: Directory to save the extracted text
        
    Returns:
        Path to the saved text file
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Extract text
    logger.info(f"Extracting text from: {file_path}")
    extracted_text = extract_text_from_file(file_path)
    
    # Get the base filename without extension
    base_name = os.path.basename(file_path)
    name_without_ext = os.path.splitext(base_name)[0]
    
    # Save to output file
    text_file_path = os.path.join(output_dir, f"{name_without_ext}.txt")
    with open(text_file_path, 'w', encoding='utf-8') as f:
        f.write(extracted_text)
    
    logger.info(f"Extracted text saved to: {text_file_path}")
    return text_file_path

def match_field_with_regex(field: Dict[str, Any], text: str) -> Dict[str, Any]:
    """
    Match a field with regex patterns against text.
    
    Args:
        field: Template field definition
        text: Text to match against
        
    Returns:
        Match results with value and debugging info
    """
    field_name = field.get('field_name', 'unknown')
    display_name = field.get('display_name', field_name)
    data_type = field.get('data_type', 'string')
    
    # Get extraction patterns
    extraction = field.get('extraction', {})
    regex = extraction.get('regex', '')
    alt_regex = extraction.get('alternative_regex', '')
    additional_patterns = extraction.get('additional_patterns', [])
    
    # Initialize result
    result = {
        'field_name': field_name,
        'display_name': display_name,
        'data_type': data_type,
        'matched': False,
        'value': None,
        'debug': {
            'patterns_tried': [],
            'matches_found': []
        }
    }
    
    # Try primary regex
    if regex:
        result['debug']['patterns_tried'].append({
            'name': 'primary',
            'pattern': regex
        })
        
        try:
            match = re.search(regex, text, re.IGNORECASE)
            if match:
                value = match.group(1) if match.groups() else match.group(0)
                result['matched'] = True
                result['value'] = value
                result['match_method'] = 'primary_regex'
                result['debug']['matches_found'].append({
                    'pattern_name': 'primary',
                    'value': value,
                    'groups': match.groups() if match.groups() else []
                })
        except Exception as e:
            logger.error(f"Error with primary regex for {field_name}: {str(e)}")
    
    # Try alternative regex if no match yet
    if not result['matched'] and alt_regex:
        result['debug']['patterns_tried'].append({
            'name': 'alternative',
            'pattern': alt_regex
        })
        
        try:
            match = re.search(alt_regex, text, re.IGNORECASE)
            if match:
                value = match.group(1) if match.groups() else match.group(0)
                result['matched'] = True
                result['value'] = value
                result['match_method'] = 'alternative_regex'
                result['debug']['matches_found'].append({
                    'pattern_name': 'alternative',
                    'value': value,
                    'groups': match.groups() if match.groups() else []
                })
        except Exception as e:
            logger.error(f"Error with alternative regex for {field_name}: {str(e)}")
    
    # Try additional patterns if no match yet
    if not result['matched'] and additional_patterns:
        for i, pattern in enumerate(additional_patterns):
            pattern_name = f"additional_{i+1}"
            result['debug']['patterns_tried'].append({
                'name': pattern_name,
                'pattern': pattern
            })
            
            try:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    value = match.group(1) if match.groups() else match.group(0)
                    result['matched'] = True
                    result['value'] = value
                    result['match_method'] = f'additional_pattern_{i+1}'
                    result['debug']['matches_found'].append({
                        'pattern_name': pattern_name,
                        'value': value,
                        'groups': match.groups() if match.groups() else []
                    })
                    break
            except Exception as e:
                logger.error(f"Error with {pattern_name} regex for {field_name}: {str(e)}")
    
    # Apply post-processing if needed
    if result['matched'] and extraction.get('post_processing') == 'trim':
        result['value'] = result['value'].strip()
    
    return result

def test_template_on_text(template: Dict[str, Any], text: str) -> Dict[str, Any]:
    """
    Test a template against extracted text.
    
    Args:
        template: Template definition
        text: Extracted text
        
    Returns:
        Test results
    """
    # Extract template data
    template_name = template.get('name', 'Unknown Template')
    template_vendor = template.get('vendor', 'Unknown Vendor')
    template_data = template.get('template_data', {})
    
    # Check identification markers
    markers = template_data.get('identification', {}).get('markers', [])
    marker_results = []
    
    matched_markers = 0
    total_markers = len(markers)
    required_markers = 0
    matched_required = 0
    
    for marker in markers:
        marker_text = marker.get('text', '').lower()
        is_required = marker.get('required', False)
        is_matched = marker_text in text.lower()
        
        marker_result = {
            'text': marker_text,
            'required': is_required,
            'matched': is_matched
        }
        marker_results.append(marker_result)
        
        if is_matched:
            matched_markers += 1
            if is_required:
                matched_required += 1
                
        if is_required:
            required_markers += 1
    
    # Check if all required markers are matched
    is_template_match = (required_markers == 0) or (matched_required == required_markers)
    marker_score = matched_markers / total_markers if total_markers > 0 else 0
    
    # Extract fields
    fields = template_data.get('fields', [])
    field_results = []
    
    matched_fields = 0
    total_fields = len(fields)
    
    for field in fields:
        field_result = match_field_with_regex(field, text)
        field_results.append(field_result)
        
        if field_result['matched']:
            matched_fields += 1
    
    # Calculate field match score
    field_score = matched_fields / total_fields if total_fields > 0 else 0
    
    # Generate final results
    results = {
        'template_name': template_name,
        'template_vendor': template_vendor,
        'is_template_match': is_template_match,
        'marker_score': marker_score,
        'marker_results': marker_results,
        'field_score': field_score,
        'matched_fields': matched_fields,
        'total_fields': total_fields,
        'field_results': field_results,
        'extracted_data': {
            result['field_name']: result['value'] 
            for result in field_results 
            if result['matched'] and result['value'] is not None
        }
    }
    
    return results

def run_tests(file_path: str, output_dir: str, template_paths: Optional[List[str]] = None) -> None:
    """
    Run OCR and template tests on a file.
    
    Args:
        file_path: Path to the input file
        output_dir: Directory for output files
        template_paths: Optional list of template JSON files to test
    """
    # Extract text from file
    text_file_path = extract_and_save_text(file_path, output_dir)
    
    # Load the extracted text
    with open(text_file_path, 'r', encoding='utf-8') as f:
        extracted_text = f.read()
    
    # Prepare templates for testing
    templates = []
    
    # Add templates from files if provided
    if template_paths:
        for template_path in template_paths:
            try:
                with open(template_path, 'r', encoding='utf-8') as f:
                    template = json.load(f)
                    templates.append(template)
                    logger.info(f"Loaded template from: {template_path}")
            except Exception as e:
                logger.error(f"Error loading template from {template_path}: {str(e)}")
    
    # Add built-in templates
    built_in_templates = [
        generate_amazon_template(),
        generate_walmart_template(),
        generate_generic_invoice_template()
    ]
    templates.extend(built_in_templates)
    
    # Test each template
    test_results = []
    
    for template in templates:
        logger.info(f"Testing template: {template.get('name', 'Unknown')}")
        result = test_template_on_text(template, extracted_text)
        test_results.append(result)
        
        # Log results
        logger.info(f"Template: {result['template_name']}")
        logger.info(f"Marker score: {result['marker_score']:.2f}")
        logger.info(f"Field score: {result['field_score']:.2f}")
        logger.info(f"Matched fields: {result['matched_fields']}/{result['total_fields']}")
        
        for field_result in result['field_results']:
            if field_result['matched']:
                logger.info(f"  ✅ {field_result['display_name']}: {field_result['value']}")
            else:
                logger.info(f"  ❌ {field_result['display_name']}: No match")
    
    # Sort results by field score (best match first)
    test_results.sort(key=lambda x: x['field_score'], reverse=True)
    
    # Save test results to JSON file
    base_name = os.path.basename(file_path)
    name_without_ext = os.path.splitext(base_name)[0]
    results_file_path = os.path.join(output_dir, f"{name_without_ext}_results.json")
    
    with open(results_file_path, 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2)
    
    logger.info(f"Test results saved to: {results_file_path}")
    
    # Output best match
    best_match = test_results[0] if test_results else None
    
    if best_match:
        logger.info("\nBest template match:")
        logger.info(f"Template: {best_match['template_name']}")
        logger.info(f"Field match score: {best_match['field_score']:.2f}")
        logger.info("Extracted data:")
        
        for field_name, value in best_match['extracted_data'].items():
            logger.info(f"  {field_name}: {value}")

def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description='OCR and Template Debugging Tool')
    parser.add_argument('file', help='Path to the invoice file (PDF, JPG, etc.)')
    parser.add_argument('--output-dir', '-o', default='debug_output', help='Directory for output files')
    parser.add_argument('--templates', '-t', nargs='*', help='Paths to additional template JSON files')
    
    args = parser.parse_args()
    
    # Run the tests
    run_tests(args.file, args.output_dir, args.templates)

if __name__ == "__main__":
    main()