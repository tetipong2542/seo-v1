export function convertMarkdownToHTML(markdownText: string): string {
  let html = markdownText;
  
  // Convert headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert links with red color for internal links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Check if it's an internal link (starts with /)
    if (url.startsWith('/')) {
      return `<a href="${url}" style="color: red; text-decoration: underline;">${text}</a>`;
    }
    return `<a href="${url}" target="_blank">${text}</a>`;
  });
  
  // Convert line breaks to paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  
  // Wrap in paragraph tags if not already wrapped
  if (!html.startsWith('<h1>') && !html.startsWith('<h2>') && !html.startsWith('<h3>')) {
    html = '<p>' + html + '</p>';
  }
  
  // Convert single line breaks to <br>
  html = html.replace(/\n/g, '<br>');
  
  // Add basic HTML structure
  const fullHTML = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Content</title>
    <style>
        body {
            font-family: 'Sarabun', 'Arial', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3 {
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h1 {
            font-size: 28px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            font-size: 24px;
            color: #2980b9;
        }
        h3 {
            font-size: 20px;
            color: #34495e;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        a {
            transition: color 0.3s ease;
        }
        a:hover {
            opacity: 0.8;
        }
        .meta-info {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #3498db;
            margin-bottom: 20px;
        }
        .meta-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .meta-description {
            color: #7f8c8d;
            font-style: italic;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
  
  return fullHTML;
} 