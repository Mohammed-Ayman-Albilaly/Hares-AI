import { RewriteEngine } from './rewrite_engine.js';

/**
 * Test suite for the RewriteEngine.
 * Since this is a browser extension module, we simulate the 'detected' array.
 */

function runTests() {
    console.log("Running RewriteEngine tests...");
    const tests = [
        {
            name: "Basic Email Rewrite",
            text: "Contact me at test@example.com",
            detected: [{ type: "EMAIL", start: 14, end: 30 }],
            expected: "Contact me at [a user's email address]"
        },
        {
            name: "Multiple Entities Rewrite",
            text: "My email is a@b.com and phone is 1234567890",
            detected: [
                { type: "EMAIL", start: 12, end: 19 },
                { type: "PHONE", start: 33, end: 43 }
            ],
            expected: "My email is [a user's email address] and phone is [a contact phone number]"
        },
        {
            name: "API Key Rewrite",
            text: "The key is sk-1234567890abcdef",
            detected: [{ type: "API_KEY", start: 11, end: 31 }],
            expected: "The key is [an API key]"
        },
        {
            name: "Empty Detection",
            text: "Hello world",
            detected: [],
            expected: "Hello world"
        }
    ];

    let passed = 0;
    tests.forEach(t => {
        const result = RewriteEngine.rewrite(t.text, t.detected);
        if (result === t.expected) {
            console.log(`✅ ${t.name} passed`);
            passed++;
        } else {
            console.error(`❌ ${t.name} failed: Expected "${t.expected}", got "${result}"`);
        }
    });

    console.log(`RewriteEngine tests complete: ${passed}/${tests.length} passed.`);
}

runTests();
