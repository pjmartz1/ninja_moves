from playwright.sync_api import sync_playwright
import time

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        
        # Set viewport to desktop size
        page.set_viewport_size({"width": 1920, "height": 1080})
        
        try:
            # Navigate to the application
            page.goto("http://localhost:3003", wait_until="networkidle")
            
            # Wait for page to fully load
            time.sleep(2)
            
            # Take screenshot
            page.screenshot(path="current_ui_issues.png", full_page=True)
            print("Screenshot saved as current_ui_issues.png")
            
        except Exception as e:
            print(f"Error taking screenshot: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    take_screenshot()