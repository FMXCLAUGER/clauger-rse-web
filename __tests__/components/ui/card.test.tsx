import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { createRef } from 'react'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with children', () => {
      render(<Card>Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Card className="custom-card">Content</Card>)
      const card = screen.getByText('Content')
      expect(card).toHaveClass('custom-card')
    })

    it('forwards ref correctly', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('applies base styling classes', () => {
      render(<Card>Content</Card>)
      const card = screen.getByText('Content')
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
    })
  })

  describe('CardHeader', () => {
    it('renders with children', () => {
      render(<CardHeader>Header Content</CardHeader>)
      expect(screen.getByText('Header Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CardHeader className="custom-header">Header</CardHeader>)
      const header = screen.getByText('Header')
      expect(header).toHaveClass('custom-header')
    })

    it('applies flex layout classes', () => {
      render(<CardHeader>Header</CardHeader>)
      const header = screen.getByText('Header')
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
    })
  })

  describe('CardTitle', () => {
    it('renders as h3 element', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByText('Title')
      expect(title.tagName).toBe('H3')
    })

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>)
      expect(screen.getByText('Title')).toHaveClass('custom-title')
    })

    it('applies font styling classes', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByText('Title')
      expect(title).toHaveClass('font-semibold')
    })
  })

  describe('CardDescription', () => {
    it('renders as p element', () => {
      render(<CardDescription>Description</CardDescription>)
      const desc = screen.getByText('Description')
      expect(desc.tagName).toBe('P')
    })

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>)
      expect(screen.getByText('Description')).toHaveClass('custom-desc')
    })

    it('applies text color classes', () => {
      render(<CardDescription>Description</CardDescription>)
      const desc = screen.getByText('Description')
      expect(desc).toHaveClass('text-sm')
    })
  })

  describe('CardContent', () => {
    it('renders with children', () => {
      render(<CardContent>Content Body</CardContent>)
      expect(screen.getByText('Content Body')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>)
      const content = screen.getByText('Content')
      expect(content).toHaveClass('custom-content')
    })

    it('applies padding classes', () => {
      render(<CardContent>Content</CardContent>)
      const content = screen.getByText('Content')
      expect(content).toHaveClass('p-6')
    })
  })

  describe('CardFooter', () => {
    it('renders with children', () => {
      render(<CardFooter>Footer Content</CardFooter>)
      expect(screen.getByText('Footer Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer">Footer</CardFooter>)
      const footer = screen.getByText('Footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('applies flex layout classes', () => {
      render(<CardFooter>Footer</CardFooter>)
      const footer = screen.getByText('Footer')
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
    })
  })

  describe('Composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByText('Test Footer')).toBeInTheDocument()
    })
  })
})
