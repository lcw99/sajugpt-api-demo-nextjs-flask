#!/bin/bash

# Test script to verify the full stack setup

echo "🧪 Testing Full Stack Setup..."
echo ""

# Test Flask server directly
echo "1. Testing Flask server directly..."
FLASK_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:5328/api/saju \
  -H "Content-Type: application/json" \
  -d '{"birthday": "199001011200", "gender": "male", "question": "test"}' \
  -o /tmp/flask_response.txt)

if [ "$FLASK_RESPONSE" = "200" ]; then
  echo "✅ Flask server is responding correctly"
else
  echo "❌ Flask server failed (HTTP $FLASK_RESPONSE)"
  exit 1
fi

# Test Next.js API route
echo ""
echo "2. Testing Next.js API proxy..."
NEXTJS_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/saju \
  -H "Content-Type: application/json" \
  -d '{"birthday": "199001011200", "gender": "male", "question": "test"}' \
  -o /tmp/nextjs_response.txt)

if [ "$NEXTJS_RESPONSE" = "200" ]; then
  echo "✅ Next.js API proxy is working correctly"
else
  echo "❌ Next.js API proxy failed (HTTP $NEXTJS_RESPONSE)"
  exit 1
fi

# Test frontend
echo ""
echo "3. Testing frontend availability..."
FRONTEND_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000 -o /dev/null)

if [ "$FRONTEND_RESPONSE" = "200" ]; then
  echo "✅ Frontend is accessible"
else
  echo "❌ Frontend failed (HTTP $FRONTEND_RESPONSE)"
  exit 1
fi

echo ""
echo "🎉 All tests passed! Your debugging environment is ready."
echo ""
echo "📱 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Flask API: http://localhost:5328/api/saju"
echo ""
echo "🐛 VS Code debugging:"
echo "   Press F5 and select 'Launch Full Stack' to start debugging"
echo "   Set breakpoints in app/page.tsx (frontend) and api/saju.py (backend)"
