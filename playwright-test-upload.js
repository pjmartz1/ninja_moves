const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testUploadFunctionality() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    
    console.log('🔧 Starting PDF Upload Functionality Test...\n');
    
    // Test both ports
    const ports = [3000, 3001];
    const results = {};
    
    for (const port of ports) {
        console.log(`\n📋 Testing localhost:${port}`);
        console.log('='.repeat(50));
        
        const page = await context.newPage();
        
        // Monitor console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Monitor network requests
        const networkRequests = [];
        const networkResponses = [];
        
        page.on('request', request => {
            networkRequests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers()
            });
        });
        
        page.on('response', response => {
            networkResponses.push({
                url: response.url(),
                status: response.status(),
                statusText: response.statusText()
            });
        });
        
        try {
            // 1. Navigate to the page
            console.log(`📍 Navigating to localhost:${port}...`);
            await page.goto(`http://localhost:${port}`, { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
            // Take initial screenshot
            await page.screenshot({ 
                path: `C:\\Users\\pmart\\Desktop\\PDF Project\\test-${port}-initial.png`,
                fullPage: true 
            });
            console.log(`✅ Screenshot saved: test-${port}-initial.png`);
            
            // 2. Check page load status
            const title = await page.title();
            const url = page.url();
            console.log(`📄 Page Title: ${title}`);
            console.log(`🔗 Current URL: ${url}`);
            
            // 3. Look for upload elements
            console.log('\n🔍 Checking for upload elements...');
            const uploadArea = await page.locator('[data-testid="file-upload-area"], .upload-area, input[type="file"]').first();
            const uploadExists = await uploadArea.count() > 0;
            console.log(`📎 Upload area found: ${uploadExists}`);
            
            // 4. Check for file input specifically
            const fileInput = await page.locator('input[type="file"]');
            const fileInputCount = await fileInput.count();
            console.log(`📁 File input elements: ${fileInputCount}`);
            
            if (fileInputCount > 0) {
                // Get file input attributes
                const inputElement = fileInput.first();
                const accept = await inputElement.getAttribute('accept');
                const multiple = await inputElement.getAttribute('multiple');
                console.log(`📋 File input accepts: ${accept || 'any'}`);
                console.log(`📋 Multiple files: ${multiple ? 'yes' : 'no'}`);
            }
            
            // 5. Look for drag-and-drop area
            const dropZone = await page.locator('[class*="drop"], [class*="drag"], [data-testid*="upload"]');
            const dropZoneCount = await dropZone.count();
            console.log(`🎯 Drop zone elements: ${dropZoneCount}`);
            
            // 6. Test file upload if possible
            console.log('\n📤 Testing file upload...');
            
            // Create a test PDF file if it doesn't exist
            const testPdfPath = path.join(__dirname, 'test-document.pdf');
            if (!fs.existsSync(testPdfPath)) {
                console.log('⚠️  Test PDF not found, creating minimal PDF...');
                // Create a minimal PDF content
                const minimalPdf = Buffer.from([
                    0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, // %PDF-1.4
                    0x25, 0xC4, 0xE5, 0xF2, 0xE5, 0xEB, 0xA7, 0xF3, 0xA0, 0xD0, 0xC4, 0xC6, 0x0A, // Binary comment
                    0x31, 0x20, 0x30, 0x20, 0x6F, 0x62, 0x6A, 0x0A, // 1 0 obj
                    0x3C, 0x3C, 0x2F, 0x54, 0x79, 0x70, 0x65, 0x2F, 0x43, 0x61, 0x74, 0x61, 0x6C, 0x6F, 0x67, 0x2F, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, // <</Type/Catalog/Pages 2 0 R>>
                    0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, // endobj
                    0x78, 0x72, 0x65, 0x66, 0x0A, 0x30, 0x20, 0x33, 0x0A, // xref 0 3
                    0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x0A, // 0000000000 65535 f
                    0x74, 0x72, 0x61, 0x69, 0x6C, 0x65, 0x72, 0x3C, 0x3C, 0x2F, 0x53, 0x69, 0x7A, 0x65, 0x20, 0x33, 0x2F, 0x52, 0x6F, 0x6F, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x3E, 0x3E, 0x0A, // trailer<</Size 3/Root 1 0 R>>
                    0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0A, 0x31, 0x38, 0x31, 0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46 // startxref 181 %%EOF
                ]);
                fs.writeFileSync(testPdfPath, minimalPdf);
                console.log(`✅ Created test PDF at: ${testPdfPath}`);
            }
            
            // Try to upload the file
            if (fileInputCount > 0) {
                try {
                    console.log('📎 Attempting file upload...');
                    await fileInput.first().setInputFiles(testPdfPath);
                    
                    // Wait a moment for any processing
                    await page.waitForTimeout(2000);
                    
                    // Take screenshot after upload attempt
                    await page.screenshot({ 
                        path: `C:\\Users\\pmart\\Desktop\\PDF Project\\test-${port}-after-upload.png`,
                        fullPage: true 
                    });
                    
                    console.log('✅ File upload attempted successfully');
                } catch (uploadError) {
                    console.log(`❌ File upload failed: ${uploadError.message}`);
                }
            } else {
                console.log('⚠️  No file input found, trying drag-and-drop...');
                
                // Try to find and interact with drop zone
                if (dropZoneCount > 0) {
                    try {
                        const dropArea = dropZone.first();
                        await dropArea.hover();
                        await page.screenshot({ 
                            path: `C:\\Users\\pmart\\Desktop\\PDF Project\\test-${port}-hover-drop.png`,
                            fullPage: true 
                        });
                        console.log('✅ Drop zone interaction attempted');
                    } catch (dropError) {
                        console.log(`❌ Drop zone interaction failed: ${dropError.message}`);
                    }
                }
            }
            
            // 7. Wait for any network activity after upload
            await page.waitForTimeout(3000);
            
            // Store results
            results[port] = {
                success: true,
                title,
                url,
                uploadExists,
                fileInputCount,
                dropZoneCount,
                consoleErrors: [...consoleErrors],
                networkRequests: networkRequests.filter(req => 
                    req.url.includes('upload') || req.url.includes('pdf') || req.url.includes('file')
                ),
                networkResponses: networkResponses.filter(resp => 
                    resp.url.includes('upload') || resp.url.includes('pdf') || resp.url.includes('file')
                )
            };
            
            console.log(`\n📊 Results for port ${port}:`);
            console.log(`   Console Errors: ${consoleErrors.length}`);
            console.log(`   Upload Requests: ${results[port].networkRequests.length}`);
            console.log(`   Upload Responses: ${results[port].networkResponses.length}`);
            
            if (consoleErrors.length > 0) {
                console.log('\n❌ Console Errors:');
                consoleErrors.forEach(error => console.log(`   - ${error}`));
            }
            
        } catch (error) {
            console.log(`❌ Error testing port ${port}: ${error.message}`);
            results[port] = {
                success: false,
                error: error.message,
                consoleErrors: [...consoleErrors],
                networkRequests: [],
                networkResponses: []
            };
        }
        
        await page.close();
    }
    
    // Compare results
    console.log('\n\n🔍 COMPARISON ANALYSIS');
    console.log('='.repeat(50));
    
    const port3000 = results[3000];
    const port3001 = results[3001];
    
    if (port3000.success && port3001.success) {
        console.log('✅ Both ports loaded successfully');
        
        console.log('\n📋 Feature Comparison:');
        console.log(`File Input Elements: 3000=${port3000.fileInputCount} vs 3001=${port3001.fileInputCount}`);
        console.log(`Drop Zone Elements: 3000=${port3000.dropZoneCount} vs 3001=${port3001.dropZoneCount}`);
        console.log(`Console Errors: 3000=${port3000.consoleErrors.length} vs 3001=${port3001.consoleErrors.length}`);
        console.log(`Upload Requests: 3000=${port3000.networkRequests.length} vs 3001=${port3001.networkResponses.length}`);
        
        if (port3000.consoleErrors.length !== port3001.consoleErrors.length) {
            console.log('\n⚠️  Different console error counts detected!');
            
            if (port3001.consoleErrors.length > port3000.consoleErrors.length) {
                console.log('❌ Port 3001 has MORE errors:');
                const extraErrors = port3001.consoleErrors.slice(port3000.consoleErrors.length);
                extraErrors.forEach(error => console.log(`   - ${error}`));
            }
        }
        
        // Check for network request differences
        console.log('\n🌐 Network Request Analysis:');
        console.log(`Port 3000 upload-related requests: ${port3000.networkRequests.length}`);
        port3000.networkRequests.forEach(req => 
            console.log(`   - ${req.method} ${req.url}`)
        );
        
        console.log(`Port 3001 upload-related requests: ${port3001.networkRequests.length}`);
        port3001.networkRequests.forEach(req => 
            console.log(`   - ${req.method} ${req.url}`)
        );
        
    } else {
        console.log('❌ One or both ports failed to load');
        if (!port3000.success) console.log(`   Port 3000 error: ${port3000.error}`);
        if (!port3001.success) console.log(`   Port 3001 error: ${port3001.error}`);
    }
    
    // Save detailed results
    const detailedResults = {
        timestamp: new Date().toISOString(),
        comparison: results,
        summary: {
            bothWorking: port3000.success && port3001.success,
            differences: {
                fileInputs: port3000.fileInputCount !== port3001.fileInputCount,
                dropZones: port3000.dropZoneCount !== port3001.dropZoneCount,
                consoleErrors: port3000.consoleErrors.length !== port3001.consoleErrors.length,
                networkActivity: port3000.networkRequests.length !== port3001.networkRequests.length
            }
        }
    };
    
    fs.writeFileSync(
        'C:\\Users\\pmart\\Desktop\\PDF Project\\upload-test-results.json', 
        JSON.stringify(detailedResults, null, 2)
    );
    
    console.log('\n💾 Detailed results saved to: upload-test-results.json');
    console.log('\n🏁 Testing completed!');
    
    await browser.close();
    return detailedResults;
}

// Run the test
testUploadFunctionality().catch(console.error);