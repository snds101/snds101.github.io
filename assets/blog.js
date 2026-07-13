function escapeHtml(str){
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function inlineMd(str){
  str = escapeHtml(str);
  str = str.replace(/`([^`]+)`/g, '<code>$1</code>');
  str = str.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  str = str.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  str = str.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return str;
}

function renderMarkdown(md){
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let i = 0;
  let inCode = false;
  let codeBuf = [];

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (!inCode) { inCode = true; codeBuf = []; i++; continue; }
      inCode = false;
      html += '<pre><code>' + escapeHtml(codeBuf.join('\n')) + '</code></pre>';
      i++; continue;
    }
    if (inCode) { codeBuf.push(line); i++; continue; }

    if (/^#{1,4}\s+/.test(line)) {
      const level = Math.min(line.match(/^#+/)[0].length + 1, 4);
      const text = line.replace(/^#{1,4}\s+/, '');
      html += `<h${level}>${inlineMd(text)}</h${level}>`;
      i++; continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inlineMd(lines[i].replace(/^[-*]\s+/, ''))}</li>`);
        i++;
      }
      html += `<ul>${items.join('')}</ul>`;
      continue;
    }

    if (line.trim() === '') { i++; continue; }

    const para = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,4}\s+/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i]);
      i++;
    }
    html += `<p>${inlineMd(para.join(' '))}</p>`;
  }

  return html;
}

function formatDate(iso){
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
