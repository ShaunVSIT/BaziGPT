// Comprehensive SocialFooter Debug Script
// Run this in the browser console to find the footer component

(function () {
    console.log('=== Comprehensive SocialFooter Debug Script ===');

    // Method 1: Check for data-testid
    const socialFooterByTestId = document.querySelector('[data-testid="social-footer"]');
    console.log('1. SocialFooter by data-testid:', !!socialFooterByTestId);

    // Method 2: Look for elements with "Get Daily Bazi Forecasts" text
    const elementsWithText = Array.from(document.querySelectorAll('*')).filter(el =>
        el.textContent && el.textContent.includes('Get Daily Bazi Forecasts')
    );
    console.log('2. Elements with "Get Daily Bazi Forecasts" text:', elementsWithText.length);
    elementsWithText.forEach((el, index) => {
        console.log(`   Element ${index + 1}:`, el.tagName, el.className);
    });

    // Method 3: Look for elements with "Follow on X" or "Join Telegram" text
    const elementsWithButtons = Array.from(document.querySelectorAll('*')).filter(el =>
        el.textContent && (el.textContent.includes('Follow on X') || el.textContent.includes('Join Telegram'))
    );
    console.log('3. Elements with social buttons:', elementsWithButtons.length);
    elementsWithButtons.forEach((el, index) => {
        console.log(`   Element ${index + 1}:`, el.tagName, el.className);
    });

    // Method 4: Look for elements with specific CSS classes or styles
    const elementsWithOrangeBg = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundColor && style.backgroundColor.includes('255, 152, 0');
    });
    console.log('4. Elements with orange background:', elementsWithOrangeBg.length);
    elementsWithOrangeBg.forEach((el, index) => {
        console.log(`   Element ${index + 1}:`, el.tagName, el.className, el.textContent?.substring(0, 50));
    });

    // Method 5: Look for Box components with specific styling
    const boxElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display === 'flex' &&
            style.flexDirection === 'column' &&
            style.alignItems === 'center';
    });
    console.log('5. Box elements with flex column center:', boxElements.length);
    boxElements.forEach((el, index) => {
        if (el.textContent && el.textContent.includes('Daily')) {
            console.log(`   Potential footer ${index + 1}:`, el.tagName, el.className, el.textContent?.substring(0, 100));
        }
    });

    // Method 6: Check if React DevTools can help
    console.log('6. React DevTools check:');
    console.log('   - Install React DevTools extension');
    console.log('   - Open DevTools and go to Components tab');
    console.log('   - Look for SocialFooter component');

    // Method 7: Check for any elements with "social" in class names
    const socialElements = Array.from(document.querySelectorAll('*')).filter(el =>
        el.className && typeof el.className === 'string' && el.className.toLowerCase().includes('social')
    );
    console.log('7. Elements with "social" in class name:', socialElements.length);
    socialElements.forEach((el, index) => {
        console.log(`   Element ${index + 1}:`, el.tagName, el.className);
    });

    // Method 8: Check for any elements with "footer" in class names
    const footerElements = Array.from(document.querySelectorAll('*')).filter(el =>
        el.className && typeof el.className === 'string' && el.className.toLowerCase().includes('footer')
    );
    console.log('8. Elements with "footer" in class name:', footerElements.length);
    footerElements.forEach((el, index) => {
        console.log(`   Element ${index + 1}:`, el.tagName, el.className);
    });

    // Method 9: Check for any elements with specific data attributes
    const dataElements = Array.from(document.querySelectorAll('[data-*]'));
    console.log('9. Elements with data attributes:', dataElements.length);
    dataElements.forEach((el, index) => {
        const dataAttrs = Array.from(el.attributes).filter(attr => attr.name.startsWith('data-'));
        console.log(`   Element ${index + 1}:`, el.tagName, dataAttrs.map(attr => `${attr.name}="${attr.value}"`));
    });

    console.log('=== End Comprehensive Debug Script ===');
    console.log('If you can see the footer visually, try:');
    console.log('1. Right-click on the footer and "Inspect Element"');
    console.log('2. Check what element it actually is');
    console.log('3. Look for any data-testid attributes');
})(); 