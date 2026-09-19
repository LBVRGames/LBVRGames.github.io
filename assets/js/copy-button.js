document.addEventListener('DOMContentLoaded', function() {
    // Find all <pre><code> blocks
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach((codeBlock) => {
        // Get the parent <pre> element
        const preElement = codeBlock.parentElement;

        // Create a new container div
        const codeContainer = document.createElement('div');
        codeContainer.classList.add('code-container');

        // Create the header div for the "Copy" button
        const codeHeader = document.createElement('div');
        codeHeader.classList.add('code-header');

        // Create the copy button
        const copyButton = document.createElement('button');
        copyButton.classList.add('copy-btn');
        copyButton.innerText = 'Copy';

        // Append the button to the header
        codeHeader.appendChild(copyButton);

        // Wrap the header and <pre> element inside the container
        preElement.replaceWith(codeContainer);
        codeContainer.appendChild(codeHeader);
        codeContainer.appendChild(preElement);

        // Add copy functionality to the button
        copyButton.addEventListener('click', () => {
            const code = codeBlock.innerText;

            // Copy the code to clipboard
            navigator.clipboard.writeText(code).then(() => {
                // Change button text to "Copied!" for feedback
                copyButton.innerText = 'Copied!';
                setTimeout(() => {
                    copyButton.innerText = 'Copy';
                }, 2000); // Change back to "Copy" after 2 seconds
            });
        });
    });
});