const React = require('react')

const ReactMarkdown = ({ children }: { children: string }) => {
  return React.createElement('div', { 'data-testid': 'markdown-content' }, children)
}

module.exports = ReactMarkdown
module.exports.default = ReactMarkdown
