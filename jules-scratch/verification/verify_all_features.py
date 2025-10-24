from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    # Register a new user
    page.goto('http://localhost:8000/register.html')
    page.locator('#username').fill('testuser')
    page.locator('#email').fill('testuser@example.com')
    page.locator('#password').fill('password')
    page.click('button[type="submit"]')
    time.sleep(5)

    # Log in
    page.goto('http://localhost:8000/login.html')
    page.locator('#username').fill('testuser')
    page.locator('#password').fill('password')
    page.click('button[type="submit"]')
    time.sleep(5)

    # Go to a show page and add it to favorites
    page.goto('http://localhost:8000/show.html?id=1396')  # ID for "Breaking Bad"
    page.wait_for_selector('#favBtn')
    page.click('#favBtn')
    time.sleep(5)

    # Mark an episode as watched
    page.goto('http://localhost:8000/show.html?id=1396')
    page.wait_for_selector('#ep-1-1')
    page.click('#ep-1-1')
    time.sleep(5)

    # Go to the main page to check notifications
    page.goto('http://localhost:8000/index.html')
    page.wait_for_selector('text=Breaking Bad')
    page.screenshot(path='jules-scratch/verification/verification.png')

    browser.close()
