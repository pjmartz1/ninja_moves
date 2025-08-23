"""
Export Manager for CSV/Excel/JSON Generation
Handles secure export of extracted table data
"""

import pandas as pd
import json
import tempfile
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


class ExportResult:
    """Container for export results"""
    
    def __init__(self):
        self.file_path: Optional[str] = None
        self.file_size: int = 0
        self.export_format: str = ""
        self.success: bool = False
        self.error_message: str = ""
        self.download_filename: str = ""


class TableExportManager:
    """Handles export of extracted tables to various formats"""
    
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "pdftable_exports"
        self.temp_dir.mkdir(exist_ok=True)
        self.supported_formats = ['csv', 'xlsx', 'json']
    
    async def export_tables(
        self, 
        tables: List[pd.DataFrame], 
        export_format: str = 'csv',
        original_filename: str = "extracted_tables"
    ) -> ExportResult:
        """Export tables to specified format"""
        
        result = ExportResult()
        result.export_format = export_format.lower()
        
        try:
            if export_format.lower() not in self.supported_formats:
                result.error_message = f"Unsupported format: {export_format}"
                return result
            
            if not tables:
                result.error_message = "No tables to export"
                return result
            
            # Generate secure filename
            import uuid
            file_id = str(uuid.uuid4())
            base_name = self._sanitize_filename(original_filename)
            
            if export_format.lower() == 'csv':
                result = await self._export_csv(tables, file_id, base_name)
            elif export_format.lower() == 'xlsx':
                result = await self._export_excel(tables, file_id, base_name)
            elif export_format.lower() == 'json':
                result = await self._export_json(tables, file_id, base_name)
            
            return result
            
        except Exception as e:
            logger.error(f"Export failed: {str(e)}")
            result.error_message = f"Export failed: {str(e)}"
            return result
    
    async def _export_csv(self, tables: List[pd.DataFrame], file_id: str, base_name: str) -> ExportResult:
        """Export tables as CSV (multiple files if multiple tables)"""
        result = ExportResult()
        result.export_format = 'csv'
        
        try:
            if len(tables) == 1:
                # Single CSV file
                filename = f"{file_id}_{base_name}.csv"
                file_path = self.temp_dir / filename
                
                tables[0].to_csv(file_path, index=False, encoding='utf-8')
                
                result.file_path = str(file_path)
                result.download_filename = f"{base_name}_table.csv"
                
            else:
                # Multiple tables - create ZIP file
                import zipfile
                
                zip_filename = f"{file_id}_{base_name}_tables.zip"
                zip_path = self.temp_dir / zip_filename
                
                with zipfile.ZipFile(zip_path, 'w') as zipf:
                    for i, table in enumerate(tables):
                        csv_filename = f"table_{i+1}.csv"
                        csv_data = table.to_csv(index=False, encoding='utf-8')
                        zipf.writestr(csv_filename, csv_data)
                
                result.file_path = str(zip_path)
                result.download_filename = f"{base_name}_tables.zip"
            
            result.file_size = os.path.getsize(result.file_path)
            result.success = True
            
        except Exception as e:
            result.error_message = f"CSV export failed: {str(e)}"
        
        return result
    
    async def _export_excel(self, tables: List[pd.DataFrame], file_id: str, base_name: str) -> ExportResult:
        """Export tables as Excel file (multiple sheets if multiple tables)"""
        result = ExportResult()
        result.export_format = 'xlsx'
        
        try:
            filename = f"{file_id}_{base_name}.xlsx"
            file_path = self.temp_dir / filename
            
            with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
                if len(tables) == 1:
                    tables[0].to_excel(writer, sheet_name='Table', index=False)
                else:
                    for i, table in enumerate(tables):
                        sheet_name = f'Table_{i+1}'
                        table.to_excel(writer, sheet_name=sheet_name, index=False)
            
            result.file_path = str(file_path)
            result.download_filename = f"{base_name}_tables.xlsx"
            result.file_size = os.path.getsize(result.file_path)
            result.success = True
            
        except Exception as e:
            result.error_message = f"Excel export failed: {str(e)}"
        
        return result
    
    async def _export_json(self, tables: List[pd.DataFrame], file_id: str, base_name: str) -> ExportResult:
        """Export tables as JSON"""
        result = ExportResult()
        result.export_format = 'json'
        
        try:
            filename = f"{file_id}_{base_name}.json"
            file_path = self.temp_dir / filename
            
            # Convert tables to JSON format
            if len(tables) == 1:
                json_data = {
                    "table": tables[0].to_dict(orient='records'),
                    "metadata": {
                        "rows": len(tables[0]),
                        "columns": len(tables[0].columns),
                        "column_names": list(tables[0].columns)
                    }
                }
            else:
                json_data = {
                    "tables": [],
                    "metadata": {
                        "total_tables": len(tables),
                        "table_info": []
                    }
                }
                
                for i, table in enumerate(tables):
                    json_data["tables"].append(table.to_dict(orient='records'))
                    json_data["metadata"]["table_info"].append({
                        "table_index": i + 1,
                        "rows": len(table),
                        "columns": len(table.columns),
                        "column_names": list(table.columns)
                    })
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False)
            
            result.file_path = str(file_path)
            result.download_filename = f"{base_name}_tables.json"
            result.file_size = os.path.getsize(result.file_path)
            result.success = True
            
        except Exception as e:
            result.error_message = f"JSON export failed: {str(e)}"
        
        return result
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for safe export"""
        import re
        
        # Remove extension if present
        name = os.path.splitext(filename)[0]
        
        # Replace dangerous characters
        name = re.sub(r'[^\w\s\-]', '', name)
        name = re.sub(r'\s+', '_', name)
        
        # Limit length
        return name[:50] if name else "extracted"
    
    def cleanup_export_file(self, file_path: str) -> bool:
        """Clean up exported file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to cleanup file {file_path}: {str(e)}")
            return False
    
    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """Get file information for download"""
        try:
            if not os.path.exists(file_path):
                return {"error": "File not found"}
            
            stat = os.stat(file_path)
            return {
                "size": stat.st_size,
                "created": stat.st_ctime,
                "format": Path(file_path).suffix.lower(),
                "exists": True
            }
        except Exception as e:
            return {"error": str(e)}