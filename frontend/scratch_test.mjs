import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const badText = `| Topic | Definition (≈60 words) | Key Points / Formula / Diagram |
|-------|------------------------|--------------------------------| | Introduction to Computer | A computer is an electronic device... | Think of it... |
| Computer Hardware – Introduction | ... | ... | | Input Devices | ... | ... |`;

const uncleanedHtml = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, badText)
);
console.log('WITHOUT cleanMarkdown contains <table>?', uncleanedHtml.includes('<table'));
console.log('WITHOUT cleanMarkdown HTML:\n', uncleanedHtml);

function cleanMarkdown(text) {
  if (!text || typeof text !== 'string') return '';
  let clean = text;
  clean = clean.replace(/\|\s*\|\s*/g, '|\n| ');
  clean = clean.replace(/\|\n\n+(\|\s*)/g, '|\n$1');
  clean = clean.replace(/([^\n|])\n+(\|(?:\s*[^|\n]+\s*\|)+)/g, '$1\n\n$2');
  clean = clean.replace(/([^\n])\n+(#{1,6}\s+)/g, '$1\n\n$2');
  clean = clean.replace(/([^\n\-*•\d])\n+([-*•]\s+)/g, '$1\n\n$2');
  return clean;
}

const cleanedHtml = ReactDOMServer.renderToStaticMarkup(
  React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, cleanMarkdown(badText))
);
console.log('WITH cleanMarkdown contains <table>?', cleanedHtml.includes('<table'));
