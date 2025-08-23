"""
PDF Processing Engine Testing Suite
Tests table extraction, performance, and accuracy with various PDF types
"""

import sys
import os
import tempfile
import time
from pathlib import Path
import asyncio

# Add app directory to path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

def create_test_pdf_with_table():
    """Create a PDF with a simple table for testing"""
    # This creates a very basic PDF with table-like content
    # In practice, you'd use a library like reportlab to create proper tables
    pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] 
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 700 Td
(Name        Age     City) Tj
0 -20 Td
(John        25      NYC) Tj
0 -20 Td
(Jane        30      LA) Tj
0 -20 Td
(Bob         35      Chicago) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000109 00000 n
0000000252 00000 n
0000000472 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
540
%%EOF"""
    return pdf_content

def test_pdf_extraction_methods():
    """Test different PDF extraction methods"""
    print("📄 Testing PDF Extraction Methods...")
    
    try:
        from core.pdf_processor import PDFTableExtractor
        
        extractor = PDFTableExtractor()
        
        # Check available methods
        available_methods = len(extractor.extraction_methods)
        print(f"✅ {available_methods} extraction methods available")
        
        # Test with a simple PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(create_test_pdf_with_table())
            temp_path = temp_file.name
        
        try:
            result = extractor.extract_tables(temp_path)
            
            assert result is not None, "Extraction should return a result"
            assert "tables" in result, "Result should contain tables key"
            assert "confidence" in result, "Result should contain confidence score"
            assert "processing_time" in result, "Result should contain processing time"
            
            print(f"✅ Table extraction completed in {result.get('processing_time', 0):.2f}s")
            print(f"✅ Found {len(result['tables'])} tables with confidence {result.get('confidence', 0):.2f}")
            
            # Test specific extraction methods if available
            for method in extractor.extraction_methods:
                try:
                    method_result = method(temp_path)
                    print(f"✅ Method {method.__name__} executed successfully")
                except Exception as e:
                    print(f"⚠️  Method {method.__name__} failed: {e}")
        
        finally:
            os.unlink(temp_path)
        
        return True
        
    except Exception as e:
        print(f"❌ PDF extraction test failed: {e}")
        return False

def test_table_confidence_calculation():
    """Test table confidence scoring"""
    print("\n📊 Testing Table Confidence Calculation...")
    
    try:
        from core.pdf_processor import PDFTableExtractor
        
        extractor = PDFTableExtractor()
        
        # Test high-quality table
        good_table = [
            ["Name", "Age", "Salary"],
            ["John", "25", "$50000"],
            ["Jane", "30", "$60000"],
            ["Bob", "35", "$70000"]
        ]
        
        confidence = extractor._calculate_table_confidence(good_table)
        assert confidence > 0.7, f"Good table should have high confidence, got {confidence}"
        print(f"✅ Good table confidence: {confidence:.2f}")
        
        # Test poor-quality table
        poor_table = [
            ["", "", ""],
            ["", "data", ""],
            ["", "", ""]
        ]
        
        confidence = extractor._calculate_table_confidence(poor_table)
        assert confidence < 0.3, f"Poor table should have low confidence, got {confidence}"
        print(f"✅ Poor table confidence: {confidence:.2f}")
        
        # Test empty table
        empty_table = []
        confidence = extractor._calculate_table_confidence(empty_table)
        assert confidence == 0.0, f"Empty table should have zero confidence, got {confidence}"
        print(f"✅ Empty table confidence: {confidence:.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Confidence calculation test failed: {e}")
        return False

def test_export_functionality():
    """Test table export to different formats"""
    print("\n💾 Testing Export Functionality...")
    
    try:
        from core.pdf_processor import PDFTableExtractor
        
        extractor = PDFTableExtractor()
        
        # Create sample table data
        sample_tables = [
            {
                "data": [
                    ["Name", "Age", "City"],
                    ["John", "25", "NYC"],
                    ["Jane", "30", "LA"]
                ],
                "page": 1,
                "confidence": 0.9,
                "method": "test",
                "rows": 3,
                "cols": 3
            }
        ]
        
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Test CSV export
            csv_path = extractor.export_tables(sample_tables, "csv", temp_path)
            assert csv_path is not None, "CSV export should return a path"
            assert csv_path.exists(), "CSV file should be created"
            print("✅ CSV export working")
            
            # Test Excel export
            excel_path = extractor.export_tables(sample_tables, "excel", temp_path)
            assert excel_path is not None, "Excel export should return a path"
            assert excel_path.exists(), "Excel file should be created"
            print("✅ Excel export working")
            
            # Test JSON export
            json_path = extractor.export_tables(sample_tables, "json", temp_path)
            assert json_path is not None, "JSON export should return a path"
            assert json_path.exists(), "JSON file should be created"
            print("✅ JSON export working")
            
            # Test invalid format
            invalid_path = extractor.export_tables(sample_tables, "invalid", temp_path)
            assert invalid_path is None, "Invalid format should return None"
            print("✅ Invalid format properly rejected")
        
        return True
        
    except Exception as e:
        print(f"❌ Export functionality test failed: {e}")
        return False

def test_performance_limits():
    """Test processing time and resource limits"""
    print("\n⏱️  Testing Performance Limits...")
    
    try:
        from core.pdf_processor import PDFTableExtractor
        
        extractor = PDFTableExtractor()
        
        # Test timeout configuration
        assert extractor.max_processing_time > 0, "Should have maximum processing time set"
        assert extractor.max_memory_mb > 0, "Should have memory limit set"
        print(f"✅ Timeout limit: {extractor.max_processing_time}s")
        print(f"✅ Memory limit: {extractor.max_memory_mb}MB")
        
        # Test with a simple file (should complete quickly)
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(create_test_pdf_with_table())
            temp_path = temp_file.name
        
        try:
            start_time = time.time()
            result = extractor.extract_tables(temp_path)
            processing_time = time.time() - start_time
            
            assert processing_time < extractor.max_processing_time, "Processing should complete within timeout"
            assert result["success"] == True, "Processing should succeed"
            print(f"✅ Processing completed in {processing_time:.2f}s (under {extractor.max_processing_time}s limit)")
        
        finally:
            os.unlink(temp_path)
        
        return True
        
    except Exception as e:
        print(f"❌ Performance limits test failed: {e}")
        return False

def test_error_handling():
    """Test error handling for various failure scenarios"""
    print("\n🚨 Testing Error Handling...")
    
    try:
        from core.pdf_processor import PDFTableExtractor
        
        extractor = PDFTableExtractor()
        
        # Test with non-existent file
        result = extractor.extract_tables("/nonexistent/file.pdf")
        assert result["success"] == False, "Non-existent file should return failure"
        assert "error" in result, "Error result should contain error message"
        print("✅ Non-existent file properly handled")
        
        # Test with invalid PDF content
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
            temp_file.write(b"This is not a PDF file")
            temp_path = temp_file.name
        
        try:
            result = extractor.extract_tables(temp_path)
            # Should either fail gracefully or handle the invalid file
            assert "success" in result, "Result should contain success flag"
            print("✅ Invalid PDF content handled gracefully")
        
        finally:
            os.unlink(temp_path)
        
        # Test empty tables export
        empty_result = extractor.export_tables([], "csv", Path("."))
        assert empty_result is None, "Empty tables should return None"
        print("✅ Empty tables export handled correctly")
        
        return True
        
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False

def main():
    """Run all PDF processor tests"""
    print("PDFTablePro - PDF Processing Engine Testing Suite")
    print("=" * 50)
    
    tests = [
        ("PDF Extraction Methods", test_pdf_extraction_methods),
        ("Table Confidence Calculation", test_table_confidence_calculation),
        ("Export Functionality", test_export_functionality),
        ("Performance Limits", test_performance_limits),
        ("Error Handling", test_error_handling)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print(f"\n📊 PDF Processing Tests: {passed}/{len(tests)} passed")
    
    if passed == len(tests):
        print("🎉 All PDF processing tests passed!")
        print("📄 PDF extraction engine is functioning correctly")
    else:
        print("⚠️  Some PDF processing tests failed. Review implementation.")
    
    return passed == len(tests)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)