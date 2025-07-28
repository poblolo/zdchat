// ==UserScript==
// @name         ZendeskChat
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Copy ticket info to clipboard with Option+C or ¸
// @author       You
// @match        *://*/*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';
    if (window.top !== window.self) {
        // Don't run in iframes
        return;
    }

    function removeAllChatIframesAndButtons() {
        document.querySelectorAll('#shopify-chat-iframe').forEach(el => {
            console.log('Removing iframe:', el);
            el.remove();
        });
        document.querySelectorAll('#shopify-chat-toggle-btn').forEach(el => {
            console.log('Removing button:', el);
            el.remove();
        });
    }

    function getTicketNumber() {
        // Try to get ticket number from the currently selected Zendesk ticket tab
        const selectedTab = document.querySelector('[data-entity-type="ticket"][aria-selected="true"][data-entity-id]');
        if (selectedTab) {
            return '#' + selectedTab.getAttribute('data-entity-id');
        }
        // Fallback: Find text matching 'Question #58708461' (keep # and numbers)
        const regex = /Question\s+(#\d+)/;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            const match = node.textContent.match(regex);
            if (match) {
                return match[1];
            }
        }
        return '';
    }

    function getUserEmail() {
        // Find all possible email elements
        const emailEls = Array.from(document.querySelectorAll('[data-test-id="email-value-test-id"]'));
        // For debugging/future use: collect all emails
        const allEmails = emailEls.map(el => el.textContent.trim()).filter(Boolean);
        // Try to find the email under a parent with data-is-active="true"
        for (const el of emailEls) {
            let parent = el.parentElement;
            while (parent) {
                if (parent.hasAttribute('data-is-active') && parent.getAttribute('data-is-active') === 'true') {
                    return el.textContent.trim();
                }
                parent = parent.parentElement;
            }
        }
        // Fallback: return the first found email
        return emailEls.length > 0 ? emailEls[0].textContent.trim() : '';
        // Optionally, log all found emails for debugging
        // console.log('All found emails:', allEmails);
    }

    function createToggleButton() {
        let button = document.getElementById('shopify-chat-toggle-btn');
        if (button) return;
        button = document.createElement('button');
        button.id = 'shopify-chat-toggle-btn';
        button.textContent = 'Hide Chat';
        button.style.position = 'fixed';
        button.style.right = '20px';
        button.style.bottom = '20px'; // Always anchored to bottom right
        button.style.zIndex = '100000';
        button.style.padding = '8px 16px';
        button.style.background = '#008060';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        document.body.appendChild(button);
        button.addEventListener('click', function() {
            const iframe = document.getElementById('shopify-chat-iframe');
            if (iframe) {
                if (iframe.style.display === 'none') {
                    iframe.style.display = '';
                    button.textContent = 'Hide Chat';
                } else {
                    iframe.style.display = 'none';
                    button.textContent = 'Show Chat';
                }
            }
        });
    }

    function embedChatShopifyWithPrefill(textToPrefill) {
        removeAllChatIframesAndButtons();
        const iframe = document.createElement('iframe');
        iframe.id = 'shopify-chat-iframe';
        const encodedPrompt = encodeURIComponent(textToPrefill);
        iframe.src = `https://chat.shopify.io/c/new?endpoint=openAI&model=o3&prompt=${encodedPrompt}`;
        iframe.style.position = 'fixed';
        iframe.style.bottom = '20px';
        iframe.style.right = '20px';
        iframe.style.width = '600px';
        iframe.style.height = '800px';
        iframe.style.zIndex = '99999';
        iframe.style.border = '1px solid #ccc';
        iframe.style.background = '#fff';
        document.body.appendChild(iframe);
        console.log('Created new iframe:', iframe);
        createToggleButton();
        iframe.onload = function() {
            try {
                const textarea = iframe.contentDocument.getElementById('prompt-textarea');
                if (textarea) {
                    textarea.value = textToPrefill;
                }
            } catch (e) {
                // Cross-origin, can't access
            }
        };
    }

    function copyTicketInfo() {
        const ticketNumber = getTicketNumber();
        const userEmail = getUserEmail();
        const prompt = `You are a Shopify developer support expert with access to all necessary MCPs.

Find the ticket by: ${ticketNumber} ${userEmail}.

- Keep all ticket info in memory for follow-up questions.
- Consider any people in the conversation. Employees are identified by (Support Advisor) after their name and Merchants are the ones that are asking for help.
- Read the conversation and extract the following information:

> Main issue summary

| Internal | Shop URL |
|----------|----------|
| [Internal links] | [Shop URLs] |

**How the issue was described by the merchant:**
- [Merchant description]

If relevant include:
**Product names**
- [Product names]

**Screenshots**
- [Screenshot links]

**Any additional context:**
- [Additional context]

**Solution**
Then accessing the MCPs figure out what is the issue and provide a solution.
- [Solution or next steps]`;
        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(prompt);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(prompt);
        }
        console.log(prompt);
        return prompt;
    }

    document.addEventListener('keydown', function(e) {
        // Option+C (Alt+C on most keyboards)
        if ((e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === 'KeyC') ||
            (e.key === '¸')) {
            e.preventDefault();
                    removeAllChatIframesAndButtons();
        const prompt = copyTicketInfo();
        embedChatShopifyWithPrefill(prompt);
        }
    });
})();
