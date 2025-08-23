"""
Create comprehensive test PDFs for PDF processing optimization
Generates various types of PDFs with different table structures for testing
"""

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
# from reportlab.platypus.tables import BACKGROUND  # Not needed
import os
from datetime import datetime, timedelta
import random

def create_test_pdfs_directory():
    """Create test PDFs directory structure"""
    base_path = r"C:\Users\pmart\Desktop\PDF Project\test_pdfs"
    
    categories = ["financial", "research", "business", "complex", "edge_cases"]
    
    for category in categories:
        category_path = os.path.join(base_path, category)
        os.makedirs(category_path, exist_ok=True)
    
    return base_path

def create_financial_statement_pdf(output_path):
    """Create financial statement with balance sheet table"""
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("ABC Company - Balance Sheet", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Balance Sheet Data
    balance_sheet_data = [
        ['Assets', '', 'Liabilities & Equity', ''],
        ['Current Assets', '', 'Current Liabilities', ''],
        ['Cash and Equivalents', '$125,000', 'Accounts Payable', '$45,000'],
        ['Accounts Receivable', '$85,000', 'Short-term Debt', '$25,000'],
        ['Inventory', '$95,000', 'Accrued Expenses', '$15,000'],
        ['Total Current Assets', '$305,000', 'Total Current Liabilities', '$85,000'],
        ['', '', '', ''],
        ['Fixed Assets', '', 'Long-term Debt', '$150,000'],
        ['Property & Equipment', '$400,000', 'Total Liabilities', '$235,000'],
        ['Less: Depreciation', '($75,000)', '', ''],
        ['Net Fixed Assets', '$325,000', 'Shareholders Equity', '$395,000'],
        ['', '', '', ''],
        ['Total Assets', '$630,000', 'Total Liab. & Equity', '$630,000']
    ]
    
    # Create table
    table = Table(balance_sheet_data, colWidths=[2.5*inch, 1.5*inch, 2.5*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)

def create_research_data_pdf(output_path):
    """Create research paper with statistical data table"""
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("Research Study: Customer Satisfaction Analysis", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Abstract
    abstract = Paragraph("This study analyzes customer satisfaction across different demographics.", styles['Normal'])
    elements.append(abstract)
    elements.append(Spacer(1, 20))
    
    # Research Data Table
    research_data = [
        ['Demographics', 'Sample Size', 'Avg. Satisfaction', 'Std. Deviation', 'Confidence Interval'],
        ['Age 18-25', '245', '7.2', '1.4', '6.8 - 7.6'],
        ['Age 26-35', '312', '7.8', '1.2', '7.5 - 8.1'],
        ['Age 36-45', '189', '8.1', '1.1', '7.8 - 8.4'],
        ['Age 46-55', '156', '7.9', '1.3', '7.6 - 8.2'],
        ['Age 56+', '98', '8.3', '1.0', '8.0 - 8.6'],
        ['', '', '', '', ''],
        ['Male', '512', '7.6', '1.3', '7.4 - 7.8'],
        ['Female', '488', '7.9', '1.2', '7.7 - 8.1'],
        ['', '', '', '', ''],
        ['Overall', '1000', '7.7', '1.3', '7.6 - 7.8']
    ]
    
    table = Table(research_data, colWidths=[1.5*inch, 1.2*inch, 1.3*inch, 1.2*inch, 1.3*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 9), (-1, 9), colors.lightyellow)  # Highlight totals
    ]))
    
    elements.append(table)
    doc.build(elements)

def create_business_inventory_pdf(output_path):
    """Create business inventory report"""
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("Monthly Inventory Report - December 2024", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Generate inventory data
    products = ['Widget A', 'Widget B', 'Component X', 'Component Y', 'Assembly Kit 1', 'Assembly Kit 2']
    inventory_data = [['Product Code', 'Description', 'Qty in Stock', 'Unit Cost', 'Total Value', 'Reorder Level']]
    
    for i, product in enumerate(products):
        code = f"PRD-{1000 + i}"
        qty = random.randint(50, 500)
        cost = round(random.uniform(10, 100), 2)
        total = round(qty * cost, 2)
        reorder = random.randint(20, 100)
        
        inventory_data.append([
            code, product, str(qty), f"${cost:.2f}", f"${total:,.2f}", str(reorder)
        ])
    
    # Add totals row
    total_value = sum(float(row[4].replace('$', '').replace(',', '')) for row in inventory_data[1:])
    inventory_data.append(['', 'TOTAL INVENTORY VALUE', '', '', f"${total_value:,.2f}", ''])
    
    table = Table(inventory_data, colWidths=[1*inch, 1.8*inch, 1*inch, 1*inch, 1.2*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightyellow),  # Total row
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold')
    ]))
    
    elements.append(table)
    doc.build(elements)

def create_complex_multi_table_pdf(output_path):
    """Create PDF with multiple complex tables"""
    doc = SimpleDocTemplate(output_path, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("Quarterly Business Report - Q4 2024", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Sales by Region Table
    subtitle1 = Paragraph("Sales Performance by Region", styles['Heading2'])
    elements.append(subtitle1)
    elements.append(Spacer(1, 6))
    
    sales_data = [
        ['Region', 'Q1', 'Q2', 'Q3', 'Q4', 'Total', '% Growth'],
        ['North America', '$1.2M', '$1.4M', '$1.5M', '$1.8M', '$5.9M', '+15%'],
        ['Europe', '$800K', '$900K', '$1.0M', '$1.1M', '$3.8M', '+12%'],
        ['Asia Pacific', '$600K', '$750K', '$850K', '$950K', '$3.15M', '+18%'],
        ['Latin America', '$300K', '$350K', '$400K', '$450K', '$1.5M', '+20%'],
        ['TOTAL', '$2.9M', '$3.4M', '$3.75M', '$4.3M', '$14.35M', '+16%']
    ]
    
    sales_table = Table(sales_data, colWidths=[1.5*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.9*inch, 0.7*inch])
    sales_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.navy),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(sales_table)
    elements.append(Spacer(1, 20))
    
    # Employee Performance Table
    subtitle2 = Paragraph("Top Performers - Q4 2024", styles['Heading2'])
    elements.append(subtitle2)
    elements.append(Spacer(1, 6))
    
    performance_data = [
        ['Employee', 'Department', 'Sales Target', 'Actual Sales', 'Achievement %', 'Bonus'],
        ['John Smith', 'Sales', '$200K', '$245K', '122.5%', '$5,000'],
        ['Sarah Jones', 'Marketing', '$150K', '$185K', '123.3%', '$4,500'],
        ['Mike Wilson', 'Sales', '$180K', '$210K', '116.7%', '$3,800'],
        ['Lisa Brown', 'Customer Success', '$120K', '$135K', '112.5%', '$2,700'],
        ['Tom Davis', 'Sales', '$190K', '$205K', '107.9%', '$3,200']
    ]
    
    perf_table = Table(performance_data, colWidths=[1.2*inch, 1.2*inch, 1*inch, 1*inch, 0.9*inch, 0.8*inch])
    perf_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(perf_table)
    doc.build(elements)

def create_edge_case_pdf(output_path):
    """Create PDF with edge cases - sparse tables, merged cells, etc."""
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    title = Paragraph("Edge Case Testing Document", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Sparse table with many empty cells
    sparse_data = [
        ['Category', 'Value 1', 'Value 2', 'Value 3', 'Notes'],
        ['A', '100', '', '150', 'Complete'],
        ['B', '', '200', '', 'Partial data'],
        ['C', '300', '', '', ''],
        ['', '', '', '', ''],
        ['Total', '400', '200', '150', 'Summary']
    ]
    
    sparse_table = Table(sparse_data)
    sparse_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.purple),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightyellow)
    ]))
    
    elements.append(sparse_table)
    elements.append(Spacer(1, 20))
    
    # Table with special characters and formatting
    special_data = [
        ['Item', 'Price (€)', 'Quantity', 'Total', 'Status'],
        ['Item #1', '€12.50', '5', '€62.50', '✓ Available'],
        ['Item #2', '€8.99', '10', '€89.90', '⚠ Low Stock'],
        ['Item #3', '€15.75', '3', '€47.25', '✗ Out of Stock'],
        ['Subtotal', '', '', '€199.65', ''],
        ['Tax (19%)', '', '', '€37.93', ''],
        ['TOTAL', '', '', '€237.58', '']
    ]
    
    special_table = Table(special_data)
    special_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, -3), (-1, -1), colors.lightblue)
    ]))
    
    elements.append(special_table)
    doc.build(elements)

def main():
    """Generate all test PDFs"""
    print("Creating test PDF collection...")
    
    base_path = create_test_pdfs_directory()
    
    # Financial PDFs
    print("Creating financial documents...")
    create_financial_statement_pdf(os.path.join(base_path, "financial", "balance_sheet.pdf"))
    
    # Research PDFs  
    print("Creating research documents...")
    create_research_data_pdf(os.path.join(base_path, "research", "customer_satisfaction.pdf"))
    
    # Business PDFs
    print("Creating business documents...")
    create_business_inventory_pdf(os.path.join(base_path, "business", "inventory_report.pdf"))
    
    # Complex PDFs
    print("Creating complex documents...")
    create_complex_multi_table_pdf(os.path.join(base_path, "complex", "quarterly_report.pdf"))
    
    # Edge Case PDFs
    print("Creating edge case documents...")
    create_edge_case_pdf(os.path.join(base_path, "edge_cases", "sparse_tables.pdf"))
    
    print(f"\nTest PDF collection created successfully in: {base_path}")
    print("\nGenerated PDFs:")
    print("- financial/balance_sheet.pdf")
    print("- research/customer_satisfaction.pdf") 
    print("- business/inventory_report.pdf")
    print("- complex/quarterly_report.pdf")
    print("- edge_cases/sparse_tables.pdf")

if __name__ == "__main__":
    main()