/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the rewrites to let our custom API routes handle the proxying
  // This allows better control over the Flask integration and debugging
  
  // In development, we use pages/api/saju.js to proxy to Flask
  // In production, Vercel will directly serve the Flask serverless functions
}

module.exports = nextConfig
