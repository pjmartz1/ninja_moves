'use client'

import { useState } from 'react'
import { 
  DocumentArrowDownIcon, 
  TableCellsIcon, 
  DocumentTextIcon,
  CodeBracketIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

interface Table {
  data: string[][]
  page: number
  confidence: number
  rows: number
  cols: number
  method: string
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
    if (tables.length === 1) {
      // Single table - direct CSV
      return tables[0].data.map(row => 
        row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
      ).join('\n')
    } else {
      // Multiple tables - add table headers
      return tables.map((table, index) => {
        const tableHeader = `\n--- Table ${index + 1} (Page ${table.page}, Confidence: ${(table.confidence * 100).toFixed(1)}%) ---\n`
        const csvData = table.data.map(row => 
          row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n')
        return tableHeader + csvData
      }).join('\n\n')
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
        dimensions: { rows: table.rows, cols: table.cols },
        data: table.data.slice(1).map(row => {
          const headers = table.data[0]
          return Object.fromEntries(
            headers.map((header, i) => [header || `Column_${i + 1}`, row[i] || ''])
          )
        })
      }))
    }
    return JSON.stringify(jsonData, null, 2)
  }

  const averageConfidence = tables.reduce((sum, table) => sum + table.confidence, 0) / tables.length
  const totalRows = tables.reduce((sum, table) => sum + (table.rows - 1), 0) // Subtract headers
  const totalCols = Math.max(...tables.map(table => table.cols))

  return (
    <div className="space-y-6">
      {/* Premium Results Summary */}
      <div className="bg-gradient-to-r from-emerald-25 to-green-25 rounded-3xl p-8 border border-emerald-100 shadow-soft animate-slide-up">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-3 shadow-medium animate-bounce-subtle">
            <CheckCircleIcon className="h-7 w-7 text-white" />
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
      </div>

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Premium CSV Download */}
          <button
            onClick={() => handleDownload('csv')}
            disabled={downloadingFormat === 'csv'}
            className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-3xl p-8 hover:shadow-large hover:border-orange-300 hover:from-orange-100 hover:to-amber-100 transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="relative z-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-4 shadow-medium group-hover:shadow-glow-orange group-hover:scale-110 transition-all duration-300">
                  <TableCellsIcon className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 mb-2">CSV Format</div>
                  <div className="text-sm text-gray-600 font-medium mb-3">Perfect for Excel & Google Sheets</div>
                  <div className="flex items-center justify-center space-x-2 text-xs text-orange-600 font-semibold">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-subtle"></span>
                    <span>Universal compatibility</span>
                  </div>
                </div>
              </div>
              {downloadingFormat === 'csv' && (
                <div className="absolute inset-0 flex items-center justify-center bg-orange-50/80 backdrop-blur-sm rounded-3xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                    <span className="text-orange-700 font-semibold">Preparing CSV...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>

          {/* Premium Excel Download */}
          <button
            onClick={() => handleDownload('excel')}
            disabled={downloadingFormat === 'excel'}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-3xl p-8 hover:shadow-large hover:border-emerald-300 hover:from-emerald-100 hover:to-green-100 transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="relative z-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-4 shadow-medium group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <DocumentTextIcon className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 mb-2">Excel Format</div>
                  <div className="text-sm text-gray-600 font-medium mb-3">Professional spreadsheet format</div>
                  <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 font-semibold">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-subtle"></span>
                    <span>Multi-sheet support</span>
                  </div>
                </div>
              </div>
              {downloadingFormat === 'excel' && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-50/80 backdrop-blur-sm rounded-3xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
                    <span className="text-emerald-700 font-semibold">Preparing Excel...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>

          {/* Premium JSON Download */}
          <button
            onClick={() => handleDownload('json')}
            disabled={downloadingFormat === 'json'}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-3xl p-8 hover:shadow-large hover:border-purple-300 hover:from-purple-100 hover:to-violet-100 transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="relative z-10">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl p-4 shadow-medium group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <CodeBracketIcon className="h-10 w-10 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 mb-2">JSON Format</div>
                  <div className="text-sm text-gray-600 font-medium mb-3">Developer-friendly structured data</div>
                  <div className="flex items-center justify-center space-x-2 text-xs text-purple-600 font-semibold">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse-subtle"></span>
                    <span>API integration ready</span>
                  </div>
                </div>
              </div>
              {downloadingFormat === 'json' && (
                <div className="absolute inset-0 flex items-center justify-center bg-purple-50/80 backdrop-blur-sm rounded-3xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                    <span className="text-purple-700 font-semibold">Preparing JSON...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </div>

        {/* Download tip */}
        <div className="mt-8 bg-gradient-to-r from-orange-25 to-amber-25 rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-full p-2">
              <DocumentArrowDownIcon className="h-5 w-5 text-white" />
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
                      <TableCellsIcon className="h-5 w-5 text-white" />
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
                      {table.rows} × {table.cols}
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
                      {table.data[0]?.map((header, colIndex) => (
                        <th key={colIndex} className="px-4 py-3 text-left font-bold text-gray-900 border-r border-gray-200 last:border-r-0">
                          {header || `Column ${colIndex + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {table.data.slice(1, 4).map((row, rowIndex) => ( // Show first 3 data rows
                      <tr key={rowIndex} className="border-t border-gray-100 hover:bg-gray-25 transition-colors duration-200">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-gray-700 border-r border-gray-100 last:border-r-0 font-medium">
                            {cell || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {table.data.length > 4 && (
                      <tr className="border-t border-gray-100 bg-gradient-to-r from-gray-25 to-gray-50">
                        <td colSpan={table.cols} className="px-4 py-4 text-center text-gray-500 italic font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="ml-2">and {table.data.length - 4} more rows</span>
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
              <TableCellsIcon className="h-5 w-5 text-white" />
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