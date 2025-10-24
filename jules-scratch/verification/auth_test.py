from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    # Log in as admin
    page.goto('http://localhost:8000/login.html')
    page.locator('#username').fill('admin')
    page.locator('#password').fill('pass123')
    page.click('button[type="submit"]')
    time.sleep(5)

    # Check for successful login
    page.goto('http://localhost:8000/index.html')
    page.wait_for_selector('text=Welcome, admin')
    content = page.content()
    if "Welcome, admin" in content:
        print("Test passed: User is logged in.")
    else:
        print("Test failed: User is not logged in.")

    browser.close()
