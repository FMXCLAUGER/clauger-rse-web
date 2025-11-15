import { createElement } from 'react'

const ReactMarkdown = ({ children }: { children: string }) => {
  return createElement('div', { 'data-testid': 'markdown-content' }, children)
}

export default ReactMarkdown
