from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    print("Navigating to app...")
    page.goto('http://localhost:5173')
    
    # Wait for app initialization
    print("Waiting for network idle...")
    page.wait_for_load_state('networkidle')
    
    # Check if startup overlay is visible
    overlay = page.locator('#startup-overlay')
    if overlay.is_visible():
        print("Startup overlay visible.")
        
        # Check Connect button
        btn = page.locator('#btn-start-app')
        if btn.is_visible():
            print(f"Connect button found. Text: {btn.text_content()}")
            
            # Click it
            print("Clicking Connect...")
            btn.click()
            
            # Wait for animation (overlay to disappear)
            print("Waiting for overlay to disappear...")
            overlay.wait_for(state='hidden', timeout=5000)
            print("Overlay hidden.")
            
            # Check if Photos view is active
            photos_view = page.locator('#view-photos')
            if photos_view.is_visible():
                print("Photos view is visible! Flow success.")
                
                # Check for mock photos
                page.wait_for_selector('.photo-item', timeout=5000)
                count = page.locator('.photo-item').count()
                print(f"Found {count} photos.")
            else:
                print("ERROR: Photos view not visible after connect.")
                print(f"Home class: {page.locator('#view-home').get_attribute('class')}")
                print(f"Photos class: {page.locator('#view-photos').get_attribute('class')}")
                
        else:
            print("ERROR: Connect button not found.")
    else:
        print("Startup overlay NOT visible. App might have started already?")
        
    browser.close()
