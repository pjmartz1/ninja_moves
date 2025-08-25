'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  Clock,
  Target,
  Database,
  Table as TableIcon
} from 'lucide-react'

interface Table {
  data: Record<string, any>[]  // Array of objects from backend
  page: number
  confidence: number
  rows: number
  columns: number
  method: string
  headers?: string[]
}

interface DownloadButtonsProps {
  tables: Table[]
  processingTime: number
}

export default function DownloadButtons({ tables, processingTime }: DownloadButtonsProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null)

  const handleDownload = async (format: 'csv' | 'excel' | 'json') => {
    setDownloadingFormat(format)
    
    try {
      // Convert tables to downloadable format
      let content: string
      let filename: string
      let mimeType: string

      switch (format) {
        case 'csv':
          content = convertToCSV(tables)
          filename = `extracted_tables_${Date.now()}.csv`
          mimeType = 'text/csv'
          break
        case 'excel':
          // For now, download as CSV with Excel-compatible format
          content = convertToCSV(tables)
          filename = `extracted_tables_${Date.now()}.csv`
          mimeType = 'text/csv'
          break
        case 'json':
          content = convertToJSON(tables)
          filename = `extracted_tables_${Date.now()}.json`
          mimeType = 'application/json'
          break
        default:
          throw new Error('Unsupported format')
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setDownloadingFormat(null)
    }
  }

  const convertToCSV = (tables: Table[]): string => {
    try {
      if (!tables || tables.length === 0) {
        return '"No data","available"\n"","Please try again"'
      }

      if (tables.length === 1) {
        // Single table - direct CSV
        const table = tables[0]
        if (!table || !table.data || table.data.length === 0) {
          return '"No data","found in table"\n"","Please check the PDF structure"'
        }
        
        const headers = table.headers || Object.keys(table.data[0] || {})
        if (headers.length === 0) {
          return '"Error","No columns detected"\n"","Please try a different PDF"'
        }
        
        const headerRow = headers.map(h => `"${String(h || 'Column').replace(/"/g, '""')}"`).join(',')
        const dataRows = table.data.map(row => 
          headers.map(header => {
            const cellValue = row[header] || ''
            // Truncate extremely long cells to prevent issues
            const truncatedValue = String(cellValue).substring(0, 1000)
            return `"${truncatedValue.replace(/"/g, '""')}"`
          }).join(',')
        ).join('\n')
        return headerRow + '\n' + dataRows
      } else {
        // Multiple tables - add table headers
        return tables.filter(table => table && table.data && table.data.length > 0).map((table, index) => {
          const tableHeader = `\n--- Table ${index + 1} (Page ${table.page || 1}, Confidence: ${((table.confidence || 0) * 100).toFixed(1)}%) ---\n`
          const headers = table.headers || Object.keys(table.data[0] || {})
          if (headers.length === 0) {
            return tableHeader + '"No columns detected","Please check PDF structure"'
          }
          
          const headerRow = headers.map(h => `"${String(h || 'Column').replace(/"/g, '""')}"`).join(',')
          const dataRows = table.data.map(row => 
            headers.map(header => {
              const cellValue = row[header] || ''
              // Truncate extremely long cells to prevent issues
              const truncatedValue = String(cellValue).substring(0, 1000)
              return `"${truncatedValue.replace(/"/g, '""')}"`
            }).join(',')
          ).join('\n')
          return tableHeader + headerRow + '\n' + dataRows
        }).join('\n\n')
      }
    } catch (error) {
      console.error('CSV conversion error:', error)
      return '"Error","CSV conversion failed"\n"","Please try again or contact support"'
    }
  }

  const convertToJSON = (tables: Table[]): string => {
    const jsonData = {
      extracted_at: new Date().toISOString(),
      processing_time: processingTime,
      tables_count: tables.length,
      tables: tables.map((table, index) => ({
        table_number: index + 1,
        page: table.page,
        confidence: table.confidence,
        method: table.method,
        dimensions: { rows: table.rows, columns: table.columns },
        data: table.data
      }))
    }
    return JSON.stringify(jsonData, null, 2)
  }

  const averageConfidence = tables.reduce((sum, table) => sum + table.confidence, 0) / tables.length
  const totalRows = tables.reduce((sum, table) => sum + (table.rows - 1), 0) // Subtract headers
  const totalCols = Math.max(...tables.map(table => table.columns))

  return (
    <div className="space-y-6">
      {/* Results Summary Card */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-3 shadow-medium animate-bounce-subtle">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">
              Extraction Complete!
            </h3>
            <p className="text-emerald-700 font-semibold">Your data is ready to download</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-emerald-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {tables.length}
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-1">Tables Found</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-emerald-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {totalRows}
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-1">Total Rows</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-emerald-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {(averageConfidence * 100).toFixed(1)}%
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-1">Confidence</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-emerald-100 hover:shadow-medium transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {processingTime.toFixed(2)}s
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-1">Process Time</div>
          </div>
        </div>
      </Card>

      {/* Premium Download Options */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="text-center mb-8">
          <h4 className="text-3xl font-black text-gray-900 mb-3">
            Choose Your Export Format
          </h4>
          <p className="text-lg text-gray-600 font-medium">
            Professional-grade formats ready for your workflow
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 md:flex-row">
          <Button
            onClick={() => handleDownload('csv')}
            disabled={downloadingFormat === 'csv'}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {downloadingFormat === 'csv' ? 'Downloading CSV...' : 'Download CSV'}
          </Button>

          <Button
            onClick={() => handleDownload('excel')}
            disabled={downloadingFormat === 'excel'}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {downloadingFormat === 'excel' ? 'Downloading Excel...' : 'Download Excel'}
          </Button>

          <Button
            onClick={() => handleDownload('json')}
            disabled={downloadingFormat === 'json'}
            className="flex items-center gap-2"
          >
            <FileCode className="h-4 w-4" />
            {downloadingFormat === 'json' ? 'Downloading JSON...' : 'Download JSON'}
          </Button>
        </div>

        {/* Download tip */}
        <div className="mt-8 bg-gradient-to-r from-orange-25 to-amber-25 rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-full p-2">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="font-bold text-gray-900 mb-1">💡 Pro Tip</h5>
              <p className="text-sm text-gray-700">
                Choose CSV for spreadsheet apps, Excel for professional reports, or JSON for custom applications and APIs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Table Preview */}
      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="text-center mb-8">
          <h4 className="text-3xl font-black text-gray-900 mb-3">
            Preview Your Data
          </h4>
          <p className="text-lg text-gray-600 font-medium">
            Here's what we extracted from your PDF
          </p>
        </div>
        
        <div className="space-y-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {tables.map((table, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-25 to-gray-50 border border-gray-200 rounded-3xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-4 border-b border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-2 shadow-medium">
                      <TableIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-gray-900">
                        Table {index + 1}
                      </h5>
                      <p className="text-sm text-gray-600">From page {table.page}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 mb-1">
                      {table.rows} × {table.columns}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${table.confidence >= 0.9 ? 'bg-emerald-500' : table.confidence >= 0.7 ? 'bg-amber-500' : 'bg-orange-500'}`}></div>
                      <span className="text-xs font-semibold text-gray-600">
                        {(table.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      {(table.headers || Object.keys(table.data[0] || {})).map((header, colIndex) => (
                        <th key={colIndex} className="px-4 py-3 text-left font-bold text-gray-900 border-r border-gray-200 last:border-r-0">
                          {header || `Column ${colIndex + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {table.data.slice(0, 3).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-gray-100 hover:bg-gray-25 transition-colors duration-200">
                        {(table.headers || Object.keys(row)).map((header, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-gray-700 border-r border-gray-100 last:border-r-0 font-medium">
                            {row[header] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {table.data.length > 3 && (
                      <tr className="border-t border-gray-100 bg-gradient-to-r from-gray-25 to-gray-50">
                        <td colSpan={table.columns} className="px-4 py-4 text-center text-gray-500 italic font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="ml-2">and {table.data.length - 3} more rows</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Preview tip */}
        <div className="mt-8 bg-gradient-to-r from-blue-25 to-indigo-25 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-2">
              <TableIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="font-bold text-gray-900 mb-1">📊 Data Quality</h5>
              <p className="text-sm text-gray-700">
                This preview shows the first 3 rows of each table. The full data will be included in your download.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}