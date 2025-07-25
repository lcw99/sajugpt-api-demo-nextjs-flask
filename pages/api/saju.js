// pages/api/saju.js
// This API route works in both development (proxying to Flask) and production (Vercel serverless)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  // In development, proxy to the local Flask server
  if (process.env.NODE_ENV === 'development') {
    try {
      const flaskUrl = 'http://localhost:5328/api/saju';
      
      console.log('Proxying to Flask server:', flaskUrl);
      console.log('Request body:', req.body);
      
      const response = await fetch(flaskUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      console.log('Flask response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Flask error response:', errorText);
        return res.status(response.status).json({ error: errorText });
      }

      // Check if response has a body
      if (!response.body) {
        return res.status(500).json({ error: 'Flask response has no body' });
      }

      // Stream the response from Flask
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
        res.end();
      } catch (streamError) {
        console.error('Streaming error:', streamError);
        res.end();
      }
      
    } catch (error) {
      console.error('Error proxying to Flask:', error);
      return res.status(500).json({ 
        error: `Failed to connect to Flask server. Make sure it's running on port 5328. Details: ${error.message}` 
      });
    }
  } else {
    // In production, this would be handled by Vercel's serverless functions
    // The Flask code in /api/saju.py will be automatically deployed as a serverless function
    return res.status(500).json({ 
      error: 'This route should be handled by the Flask serverless function in production.' 
    });
  }
}
