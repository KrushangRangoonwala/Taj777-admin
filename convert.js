import fs from 'fs';

const html = fs.readFileSync('src/components/raw.html', 'utf8');

// Find end of header
const headerEnd = html.indexOf('</header>') + '</header>'.length;
let headerHtml = html.substring(0, headerEnd);
let sidebarHtml = html.substring(headerEnd);

function htmlToJsx(str) {
  return str
    .replace(/class=/g, 'className=')
    .replace(/tabindex=/g, 'tabIndex=')
    .replace(/spellcheck=/g, 'spellCheck=')
    .replace(/autocomplete=/g, 'autoComplete=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<!--.*?-->/gs, '')
    // Close unclosed tags conservatively
    .replace(/<(img|input|br|hr)([^>]*?)(?<!\/)>/g, '<$1$2 />')
    // Convert style strings to objects
    .replace(/style="([^"]*)"/g, (match, styles) => {
       const obj = {};
       styles.split(';').forEach(s => {
         if (!s.trim()) return;
         const [key, val] = s.split(':').map(str => str.trim());
         if (key && val) {
           const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
           obj[camelKey] = val;
         }
       });
       return `style={${JSON.stringify(obj)}}`;
    });
}

headerHtml = htmlToJsx(headerHtml);
sidebarHtml = htmlToJsx(sidebarHtml);

fs.writeFileSync('src/components/Header.jsx', `import React from 'react';\n\nexport default function Header() {\n  return (\n    <>\n${headerHtml}\n    </>\n  );\n}`);
fs.writeFileSync('src/components/Sidebar.jsx', `import React from 'react';\n\nexport default function Sidebar() {\n  return (\n    <>\n${sidebarHtml}\n    </>\n  );\n}`);
