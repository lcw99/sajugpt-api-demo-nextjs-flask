import json
from openai import OpenAI
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs
import datetime # Required for 'today'

# It's good practice to get API keys from environment variables
# You'll need to set this in your Vercel project settings
SAJU_API_KEY = os.environ.get("SAJU_API_KEY", "key") # Fallback to "key" if not set

class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data_bytes = self.rfile.read(content_length)
        post_data_str = post_data_bytes.decode('utf-8')

        try:
            payload = json.loads(post_data_str)
            birthday = payload.get("birthday") # Expected format: YYYYMMDDHHMM
            gender = payload.get("gender")
            user_message = payload.get("question")

            if not all([birthday, gender, user_message]):
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing required fields: birthday, gender, question"}).encode('utf-8'))
                return

            # Validate birthday format (YYYYMMDDHHMM)
            if not (len(birthday) == 12 and birthday.isdigit()):
                 self.send_response(400)
                 self.send_header('Content-type', 'application/json')
                 self.end_headers()
                 self.wfile.write(json.dumps({"error": "Invalid birthday format. Expected YYYYMMDDHHMM."}).encode('utf-8'))
                 return

            # Get today's date in YYYYMMDD format
            today_date = datetime.datetime.now().strftime("%Y%m%d")

            client = OpenAI(
                base_url="https://api.sajugpt.net/v1",
                api_key=SAJU_API_KEY
            )

            user_data = {
                "appVersion": 199,
                "userId": "skk-test", # Replace with a more robust user ID if needed
                "birthday": birthday,
                "gender": gender,
                "today": today_date
            }
            user_str = json.dumps(user_data)

            self.send_response(200)
            self.send_header('Content-type', 'text/plain; charset=utf-8') # For streaming
            self.send_header('X-Content-Type-Options', 'nosniff') # Important for some browsers
            self.end_headers()

            try:
                stream = client.chat.completions.create(
                    model="stargio-saju-chat",
                    user=user_str,
                    messages=[
                        {"role": "user", "content": user_message}
                    ],
                    stream=True,
                    max_tokens=800,
                    n=1,
                    temperature=0.7,
                    top_p=1.0,
                    stop=None
                )

                for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        self.wfile.write(content.encode('utf-8'))
                        # Vercel automatically flushes for serverless functions,
                        # but if running locally or in different envs, you might need self.wfile.flush()
                
            except Exception as e:
                # This error will be caught by the client-side if stream already started
                # If it happens before stream starts, a 500 might be better
                # For simplicity, just writing error to stream if it happens mid-stream
                print(f"API call error: {e}") # Log to Vercel logs
                self.wfile.write(f"\nAn error occurred during API call: {e}".encode('utf-8'))

        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JSON payload"}).encode('utf-8'))
            return
        except Exception as e:
            print(f"Server error: {e}") # Log to Vercel logs
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"An internal server error occurred: {e}"}).encode('utf-8'))
            return

    # Optional: Handle GET requests or other methods if needed
    def do_GET(self):
        self.send_response(405)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Method Not Allowed"}).encode('utf-8'))