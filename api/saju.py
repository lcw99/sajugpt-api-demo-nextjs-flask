# /api/saju.py
import json
from openai import OpenAI
import os
import datetime
from flask import Flask, request, Response, jsonify

# Initialize the Flask application
# Vercel will look for an 'app' instance by default in the file.
app = Flask(__name__)

# Retrieve the API key from environment variables (set this in your Vercel project settings)
SAJU_API_KEY = os.environ.get("SAJU_API_KEY", "key")

@app.route('/api/saju', methods=['POST'])
def get_saju_reading():
    if request.method == 'POST':
        try:
            payload = request.get_json()
            if not payload:
                return jsonify({"error": "Invalid JSON payload or empty request body"}), 400

            birthday = payload.get("birthday")  # Expected format: YYYYMMDDHHMM
            gender = payload.get("gender")
            user_message = payload.get("question")

            # --- Input Validation ---
            if not all([birthday, gender, user_message]):
                missing_fields = [field for field, value in {"birthday": birthday, "gender": gender, "question": user_message}.items() if not value]
                return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

            if not (isinstance(birthday, str) and len(birthday) == 12 and birthday.isdigit()):
                return jsonify({"error": "Invalid birthday format. Expected a 12-digit string YYYYMMDDHHMM."}), 400
            
            if gender not in ["male", "female"]:
                return jsonify({"error": "Invalid gender. Expected 'male' or 'female'."}), 400
            
            if not isinstance(user_message, str) or not user_message.strip():
                return jsonify({"error": "Question cannot be empty."}), 400

            # --- Prepare data for OpenAI API ---
            today_date = datetime.datetime.now().strftime("%Y%m%d")

            client = OpenAI(
                base_url="https://api.sajugpt.net/v1",
                api_key=SAJU_API_KEY
            )

            user_data = {
                "appVersion": 199, # As per your initial example
                "userId": SAJU_API_KEY, # Or any other identifier
                "birthday": birthday,
                "gender": gender,
                "today": today_date
            }
            user_str = json.dumps(user_data)

            # --- Streaming Logic ---
            def generate_stream():
                try:
                    api_response_stream = client.chat.completions.create(
                        model="stargio-saju-chat", # As per your initial example
                        user=user_str,
                        messages=[{"role": "user", "content": user_message}],
                        stream=True,
                        max_tokens=800, # As per your initial example
                        # n=1, temperature=0.7, top_p=1.0 (can be set if not default)
                    )
                    for chunk in api_response_stream:
                        if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                            content = chunk.choices[0].delta.content
                            yield content.encode('utf-8') # Yield bytes for the stream
                except Exception as e:
                    # This error will be part of the stream if it occurs after streaming started
                    app.logger.error(f"Error during OpenAI API stream: {e}") # Log server-side
                    yield f"\nSTREAM_ERROR: An error occurred during Saju data generation: {str(e)}".encode('utf-8')
            
            # Return a streaming response
            return Response(generate_stream(), mimetype='text/plain; charset=utf-8')

        except json.JSONDecodeError:
            app.logger.error("Invalid JSON received")
            return jsonify({"error": "Invalid JSON format in request body"}), 400
        except Exception as e:
            # Catch-all for other unexpected errors before streaming starts
            app.logger.error(f"Unexpected server error: {e}") # Log server-side
            return jsonify({"error": f"An unexpected server error occurred: {str(e)}"}), 500
    else:
        # This part should ideally not be reached if methods=['POST'] is respected by routing
        return jsonify({"error": "Method not allowed. Please use POST."}), 405

# This allows running the app locally for testing if needed,
# though Vercel will handle running it as a serverless function.
if __name__ == '__main__':
    # Port 5001 to avoid conflict if Next.js dev server is on 3000 and Vercel dev might use 5000
    app.run(debug=True, port=5001)