"""
Comprehensive PDF Extraction Accuracy Testing
Tests PDF processor performance across different document types
"""

import os
import sys
import time
import json
from pathlib import Path
from typing import Dict, List, Any
import asyncio

# Add backend to path
sys.path.append(r"C:\Users\pmart\Desktop\PDF Project\backend")

from core.pdf_processor import PDFTableExtractor, TableExtractionResult

class PDFAccuracyTester:
    """Test PDF extraction accuracy across various document types"""
    
    def __init__(self):
        self.extractor = PDFTableExtractor()
        self.test_results = []
        self.test_pdfs_path = Path(r"C:\Users\pmart\Desktop\PDF Project\test_pdfs")
    
    async def run_comprehensive_test(self):
        """Run tests across all PDF categories"""
        print("Starting Comprehensive PDF Accuracy Testing")
        print("=" * 60)
        
        categories = ["financial", "research", "business", "complex", "edge_cases"]
        overall_results = {
            "total_files": 0,
            "successful_extractions": 0,
            "failed_extractions": 0,
            "average_confidence": 0.0,
            "average_processing_time": 0.0,
            "category_results": {},
            "detailed_results": []
        }
        
        for category in categories:
            category_path = self.test_pdfs_path / category
            if category_path.exists():
                print(f"\nTesting {category.upper()} Documents:")
                print("-" * 40)
                
                category_results = await self.test_category(category_path, category)
                overall_results["category_results"][category] = category_results
                overall_results["detailed_results"].extend(category_results["files"])
                
                # Update overall stats
                overall_results["total_files"] += category_results["total_files"]
                overall_results["successful_extractions"] += category_results["successful_extractions"]
                overall_results["failed_extractions"] += category_results["failed_extractions"]
        
        # Calculate averages
        if overall_results["total_files"] > 0:
            overall_results["success_rate"] = (
                overall_results["successful_extractions"] / overall_results["total_files"] * 100
            )
            
            all_confidences = [
                result["average_confidence"] 
                for result in overall_results["detailed_results"] 
                if result["average_confidence"] > 0
            ]
            if all_confidences:
                overall_results["average_confidence"] = sum(all_confidences) / len(all_confidences)
            
            all_times = [
                result["processing_time"] 
                for result in overall_results["detailed_results"]
            ]
            if all_times:
                overall_results["average_processing_time"] = sum(all_times) / len(all_times)
        
        self.print_summary_report(overall_results)
        await self.save_results(overall_results)
        
        return overall_results
    
    async def test_category(self, category_path: Path, category: str) -> Dict:
        """Test all PDFs in a specific category"""
        results = {
            "category": category,
            "total_files": 0,
            "successful_extractions": 0,
            "failed_extractions": 0,
            "files": []
        }
        
        pdf_files = list(category_path.glob("*.pdf"))
        results["total_files"] = len(pdf_files)
        
        for pdf_file in pdf_files:
            print(f"  Testing: {pdf_file.name}")
            
            file_result = await self.test_single_pdf(str(pdf_file), category)
            results["files"].append(file_result)
            
            if file_result["extraction_successful"]:
                results["successful_extractions"] += 1
                print(f"    SUCCESS - {file_result['tables_found']} tables, "
                      f"{file_result['average_confidence']:.2f} confidence, "
                      f"{file_result['processing_time']:.2f}s")
            else:
                results["failed_extractions"] += 1
                print(f"    FAILED - {file_result['error_message']}")
        
        # Calculate category stats
        if results["total_files"] > 0:
            results["success_rate"] = (results["successful_extractions"] / results["total_files"]) * 100
            print(f"\n  Category Results: {results['success_rate']:.1f}% success rate "
                  f"({results['successful_extractions']}/{results['total_files']})")
        
        return results
    
    async def test_single_pdf(self, pdf_path: str, category: str) -> Dict:
        """Test extraction on a single PDF file"""
        result = {
            "file_path": pdf_path,
            "file_name": Path(pdf_path).name,
            "category": category,
            "extraction_successful": False,
            "tables_found": 0,
            "average_confidence": 0.0,
            "processing_time": 0.0,
            "extraction_method": "",
            "error_message": "",
            "table_details": []
        }
        
        try:
            # Run extraction
            extraction_result = await self.extractor.extract_tables(pdf_path)
            
            result["processing_time"] = extraction_result.processing_time
            result["extraction_method"] = extraction_result.extraction_method
            
            if extraction_result.tables and len(extraction_result.tables) > 0:
                result["extraction_successful"] = True
                result["tables_found"] = len(extraction_result.tables)
                
                # Calculate average confidence
                if extraction_result.confidence_scores:
                    result["average_confidence"] = sum(extraction_result.confidence_scores) / len(extraction_result.confidence_scores)
                
                # Analyze table structures
                for i, (table, confidence) in enumerate(zip(extraction_result.tables, extraction_result.confidence_scores)):
                    table_info = {
                        "table_index": i,
                        "rows": len(table),
                        "columns": len(table.columns),
                        "confidence": confidence,
                        "has_data": not table.empty,
                        "sample_data": table.head(2).to_dict() if not table.empty else {}
                    }
                    result["table_details"].append(table_info)
            else:
                result["error_message"] = "; ".join(extraction_result.errors) if extraction_result.errors else "No tables found"
        
        except Exception as e:
            result["error_message"] = str(e)
        
        return result
    
    def print_summary_report(self, results: Dict):
        """Print comprehensive summary report"""
        print("\n" + "=" * 60)
        print("COMPREHENSIVE ACCURACY TEST RESULTS")
        print("=" * 60)
        
        print(f"\nOVERALL PERFORMANCE:")
        print(f"   Total Files Tested:     {results['total_files']}")
        print(f"   Successful Extractions: {results['successful_extractions']}")
        print(f"   Failed Extractions:     {results['failed_extractions']}")
        print(f"   Success Rate:           {results.get('success_rate', 0):.1f}%")
        print(f"   Average Confidence:     {results['average_confidence']:.2f}")
        print(f"   Average Processing:     {results['average_processing_time']:.2f}s")
        
        print(f"\nCATEGORY BREAKDOWN:")
        for category, cat_results in results["category_results"].items():
            success_rate = cat_results.get("success_rate", 0)
            print(f"   {category.upper():<12}: {success_rate:5.1f}% "
                  f"({cat_results['successful_extractions']}/{cat_results['total_files']} files)")
        
        print(f"\nPERFORMANCE ANALYSIS:")
        processing_times = [r["processing_time"] for r in results["detailed_results"]]
        if processing_times:
            fastest = min(processing_times)
            slowest = max(processing_times)
            print(f"   Fastest Processing:     {fastest:.2f}s")
            print(f"   Slowest Processing:     {slowest:.2f}s")
            
            # Check 30-second target
            over_target = [t for t in processing_times if t > 30]
            if over_target:
                print(f"   FILES OVER 30s TARGET: {len(over_target)}")
            else:
                print(f"   ALL FILES UNDER 30s TARGET")
        
        print(f"\nEXTRACTION METHOD ANALYSIS:")
        method_counts = {}
        for result in results["detailed_results"]:
            if result["extraction_successful"] and result["extraction_method"]:
                method = result["extraction_method"]
                method_counts[method] = method_counts.get(method, 0) + 1
        
        for method, count in method_counts.items():
            percentage = (count / results["successful_extractions"] * 100) if results["successful_extractions"] > 0 else 0
            print(f"   {method:<12}: {count:2d} files ({percentage:5.1f}%)")
        
        print(f"\nCOMMON FAILURE PATTERNS:")
        error_patterns = {}
        for result in results["detailed_results"]:
            if not result["extraction_successful"] and result["error_message"]:
                error = result["error_message"]
                error_patterns[error] = error_patterns.get(error, 0) + 1
        
        for error, count in sorted(error_patterns.items(), key=lambda x: x[1], reverse=True):
            print(f"   {error[:50]}: {count} occurrences")
        
        # Recommendations
        print(f"\nOPTIMIZATION RECOMMENDATIONS:")
        success_rate = results.get('success_rate', 0)
        
        if success_rate < 95:
            print(f"   IMPROVEMENT NEEDED: Success rate ({success_rate:.1f}%) below 95% target")
            print(f"   FOCUS: Improving fallback methods")
            
        if results['average_processing_time'] > 15:
            print(f"   SPEED OPTIMIZATION: Processing time ({results['average_processing_time']:.1f}s) could be optimized")
            print(f"   CONSIDER: Algorithm optimizations")
            
        if results['average_confidence'] < 0.8:
            print(f"   CONFIDENCE IMPROVEMENT: Scoring ({results['average_confidence']:.2f}) needs improvement")
            print(f"   REFINE: Confidence calculation algorithms")
    
    async def save_results(self, results: Dict):
        """Save detailed results to JSON file"""
        output_file = "pdf_accuracy_test_results.json"
        
        # Add timestamp
        results["test_timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
        results["test_environment"] = {
            "python_version": sys.version,
            "platform": sys.platform
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\nDetailed results saved to: {output_file}")

async def main():
    """Run the comprehensive PDF accuracy test"""
    tester = PDFAccuracyTester()
    results = await tester.run_comprehensive_test()
    
    print(f"\nTesting Complete!")
    print(f"   Success Rate: {results.get('success_rate', 0):.1f}%")
    print(f"   Target: 95%+ accuracy")
    print(f"   Status: {'PASSED' if results.get('success_rate', 0) >= 95 else 'NEEDS OPTIMIZATION'}")

if __name__ == "__main__":
    asyncio.run(main())