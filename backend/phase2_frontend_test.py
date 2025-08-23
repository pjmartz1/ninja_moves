#!/usr/bin/env python3
"""Phase 2: Frontend Component Testing for PDFTablePro"""

import requests
from datetime import datetime
import json

def test_frontend_basic():
    results = {
        'timestamp': datetime.now().isoformat(),
        'phase': 'Phase 2 - Frontend Component Testing',
        'phase_2_frontend_testing': {},
        'issues': [],
        'summary': {}
    }
    
    print('Phase 2: Frontend Component Testing')
    print('=' * 50)
    
    # Test 1: Frontend Server Accessibility
    try:
        response = requests.get('http://localhost:3000', timeout=10)
        html_content = response.text
        
        # Check critical components in HTML
        components_check = {
            'page_loads': response.status_code == 200,
            'title_correct': 'PDFTablePro' in html_content,
            'hero_section': 'Extract PDF Tables to Excel' in html_content,
            'upload_component': 'Choose File' in html_content,
            'file_requirements': 'File Requirements' in html_content,
            'features_section': 'Lightning Fast' in html_content and '95%+ Accuracy' in html_content,
            'footer_present': 'footer' in html_content.lower(),
            'responsive_design': 'grid-cols-1 lg:grid-cols-2' in html_content,
            'authentication_buttons': 'Login' in html_content and 'Sign Up' in html_content,
            'seo_optimized': 'application/ld+json' in html_content,
            'icons_loaded': 'lucide-react' in html_content or 'svg' in html_content,
            'drag_drop': 'dropzone' in html_content or 'drag' in html_content.lower(),
            'professional_styling': 'gradient' in html_content and 'shadow' in html_content,
            'mobile_menu': 'hamburger' in html_content.lower() or 'menu' in html_content.lower()
        }
        
        results['phase_2_frontend_testing']['component_validation'] = components_check
        
        # Calculate pass rate
        passed = sum(1 for v in components_check.values() if v)
        total = len(components_check)
        pass_rate = (passed / total) * 100
        
        results['summary'] = {
            'total_checks': total,
            'passed': passed,
            'failed': total - passed,
            'pass_rate': f'{pass_rate:.1f}%',
            'status': 'PASS' if pass_rate >= 85 else 'NEEDS_ATTENTION'
        }
        
        print(f'✓ Frontend Server: Status {response.status_code}')
        print(f'✓ Page Size: {len(html_content)} characters')
        print()
        print('Component Validation Results:')
        for component, status in components_check.items():
            status_icon = 'PASS' if status else 'FAIL'
            print(f'  {status_icon}: {component.replace("_", " ").title()}')
        
        print()
        print(f'Summary: {passed}/{total} checks passed ({pass_rate:.1f}%)')
        
        # Test 2: Performance Check
        load_time = response.elapsed.total_seconds()
        results['phase_2_frontend_testing']['performance'] = {
            'load_time': load_time,
            'load_time_acceptable': load_time < 3.0,
            'response_size': len(html_content)
        }
        
        print(f'Performance: Load Time {load_time:.2f}s {"(GOOD)" if load_time < 3.0 else "(SLOW)"}')
        
        # Test 3: Critical Content Validation
        critical_content = [
            'AI-powered table extraction',
            '95%+ accuracy',
            'PDF Format Only',
            '10MB Max Size',
            '100 Pages Limit',
            'Enterprise Secure',
            'Lightning Fast'
        ]
        
        content_validation = {}
        for content in critical_content:
            content_validation[content] = content in html_content
            
        results['phase_2_frontend_testing']['content_validation'] = content_validation
        
        print()
        print('Critical Content Validation:')
        for content, found in content_validation.items():
            status = 'FOUND' if found else 'MISSING'
            print(f'  {status}: {content}')
        
        # Test 4: SEO and Metadata Check
        seo_elements = {
            'meta_description': 'meta name="description"' in html_content,
            'og_tags': 'property="og:' in html_content,
            'twitter_cards': 'name="twitter:' in html_content,
            'structured_data': 'application/ld+json' in html_content,
            'canonical_url': 'rel="canonical"' in html_content
        }
        
        results['phase_2_frontend_testing']['seo_validation'] = seo_elements
        
        print()
        print('SEO & Metadata Validation:')
        for element, found in seo_elements.items():
            status = 'FOUND' if found else 'MISSING'
            print(f'  {status}: {element.replace("_", " ").title()}')
        
        # Overall Phase 2 Assessment
        content_pass_rate = (sum(content_validation.values()) / len(content_validation)) * 100
        seo_pass_rate = (sum(seo_elements.values()) / len(seo_elements)) * 100
        
        overall_pass = (
            pass_rate >= 85 and
            load_time < 3.0 and
            content_pass_rate >= 90 and
            seo_pass_rate >= 80
        )
        
        results['phase_2_status'] = 'PASS' if overall_pass else 'NEEDS_ATTENTION'
        results['overall_metrics'] = {
            'component_pass_rate': f'{pass_rate:.1f}%',
            'content_pass_rate': f'{content_pass_rate:.1f}%',
            'seo_pass_rate': f'{seo_pass_rate:.1f}%',
            'performance_acceptable': load_time < 3.0
        }
        
        print()
        print('=' * 50)
        print(f'Phase 2 Overall Status: {results["phase_2_status"]}')
        print(f'Component Pass Rate: {pass_rate:.1f}%')
        print(f'Content Pass Rate: {content_pass_rate:.1f}%')
        print(f'SEO Pass Rate: {seo_pass_rate:.1f}%')
        
        # Add issues if any
        if pass_rate < 85:
            results['issues'].append(f'Component validation below 85% threshold: {pass_rate:.1f}%')
        if load_time >= 3.0:
            results['issues'].append(f'Load time too slow: {load_time:.2f}s')
        if content_pass_rate < 90:
            missing_content = [k for k, v in content_validation.items() if not v]
            results['issues'].append(f'Missing critical content: {missing_content}')
        if seo_pass_rate < 80:
            missing_seo = [k for k, v in seo_elements.items() if not v]
            results['issues'].append(f'Missing SEO elements: {missing_seo}')
        
        return results
        
    except Exception as e:
        results['issues'].append(f'Frontend testing error: {str(e)}')
        results['phase_2_status'] = 'FAIL'
        print(f'ERROR: Frontend testing failed: {e}')
        return results

def main():
    # Run Phase 2 Testing
    results = test_frontend_basic()
    
    # Print issues if any
    if results['issues']:
        print()
        print('Issues Identified:')
        for i, issue in enumerate(results['issues'], 1):
            print(f'  {i}. {issue}')
    else:
        print()
        print('No issues identified in Phase 2 testing!')
    
    # Save results
    with open('phase2_frontend_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print()
    print('Results saved to phase2_frontend_results.json')
    return results

if __name__ == '__main__':
    main()