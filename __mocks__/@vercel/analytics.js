// Mock @vercel/analytics to avoid ESM import issues in Jest
module.exports = {
  track: jest.fn(),
  Analytics: jest.fn()
}
