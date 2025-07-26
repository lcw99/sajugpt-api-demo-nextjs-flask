# /api/saju.py
import json
from openai import OpenAI
import os
import datetime
from flask import Flask, request, Response, jsonify

# Initialize the Flask application for Vercel compatibility
app = Flask(__name__)

# Retrieve the API key from environment variables (set this in your Vercel project settings)
SAJU_API_KEY = os.environ.get("SAJU_API_KEY", "key")

SAJU_PROMPT = """이 시스템은 Stargio Soft가 개발한 대규모 인공지능 언어모델인 사주GPT이다. 사주명리 철학자 선생님이 상담자의 운세를 봐주는 상황을 가정하세요. 전문적인 운세 해설과 인생의 지혜를 제공하세요. 상담자 호칭은 당신으로 합니다. 인사는 생략 하세요. 존대말을 사용하세요.
위 사주 정보에 기반하여 아래 질문에 답하세요. 상담자의 용기를 북 돋워 주세요. 사주 정보에 적절한 답이 없을 경우 정보를 기반으로 명리 이론을 적용하여 답변을 찾으세요. 오늘 날씨를 물어 보면 덥다고 답변하세요.
"""

GUNGHAP_PROMPT = """사주GPT는 Stargio Soft가 개발한 대규모 인공지능 언어모델 이다. 사주GPT는 다음 상황을 시뮬레이션 합니다. 사주 명리 상담센터에서 전문가가 연애상담을 해주는 상황을 가정하세요. 위 사주 정보에 기반하여 아래 질문에 답하세요. 위 사주 정보상의 '본인'이 상담 하러 온사람이고 '상대방'은 연애 상대방을 말합니다. 상담자 본인은 당신이라고 부르세요. 인사는 생략 하세요. 
존대말을 사용하세요. 위 사주 정보에 적절한 답이 없을 경우 정보를 기반으로 명리 이론을 적용하여 답변을 찾으세요.
"""

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
            system_prompt = payload.get("systemPrompt")  # Optional system prompt for v2 mode
            
            # Compatibility mode fields
            birthday2 = payload.get("birthday2")  # Second person's birthday
            gender2 = payload.get("gender2")      # Second person's gender
            is_compatibility_mode = birthday2 is not None and gender2 is not None

            # --- Input Validation ---
            if not all([birthday, gender, user_message]):
                missing_fields = [field for field, value in {"birthday": birthday, "gender": gender, "question": user_message}.items() if not value]
                return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

            if not (isinstance(birthday, str) and len(birthday) == 12 and birthday.isdigit()):
                return jsonify({"error": "Invalid birthday format. Expected a 12-digit string YYYYMMDDHHMM."}), 400
            
            if gender not in ["male", "female"]:
                return jsonify({"error": "Invalid gender. Expected 'male' or 'female'."}), 400
            
            # Validate second person's info if in compatibility mode
            if is_compatibility_mode:
                if not (isinstance(birthday2, str) and len(birthday2) == 12 and birthday2.isdigit()):
                    return jsonify({"error": "Invalid birthday2 format. Expected a 12-digit string YYYYMMDDHHMM."}), 400
                
                if gender2 not in ["male", "female"]:
                    return jsonify({"error": "Invalid gender2. Expected 'male' or 'female'."}), 400
            
            if not isinstance(user_message, str) or not user_message.strip():
                return jsonify({"error": "Question cannot be empty."}), 400

            # --- Prepare data for OpenAI API ---
            today_date = datetime.datetime.now().strftime("%Y%m%d")

            client = OpenAI(
                # base_url="https://stargio5.plan4.house/v1",
                base_url="https://api.sajugpt.net/v1",  
                api_key="key"
            )

            # Prepare user_data based on compatibility mode
            if is_compatibility_mode:
                user_data = {
                    "appVersion": 199,
                    "userId": SAJU_API_KEY,
                    "birthday": birthday,
                    "gender": gender,
                    "today": today_date,
                    "birthday2": birthday2,
                    "gender2": gender2
                }
            else:
                user_data = {
                    "appVersion": 199,
                    "userId": SAJU_API_KEY,
                    "birthday": birthday,
                    "gender": gender,
                    "today": today_date
                }
            
            user_str = json.dumps(user_data)

            # --- Streaming Logic ---
            def generate_stream():
                try:
                    # Prepare messages array based on mode and system prompt
                    messages = []
                    
                    # Determine which system prompt to use
                    if system_prompt and system_prompt.strip():
                        # Use custom system prompt if provided (v2 mode)
                        messages.append({"role": "system", "content": system_prompt})
                    else:
                        # Use default prompts based on compatibility mode
                        if is_compatibility_mode:
                            messages.append({"role": "system", "content": GUNGHAP_PROMPT})
                        else:
                            messages.append({"role": "system", "content": SAJU_PROMPT})
                    
                    messages.append({"role": "user", "content": user_message})

                    api_response_stream = client.chat.completions.create(
                        model="stargio-saju-chat",
                        user=user_str,
                        messages=messages,
                        stream=True,
                        max_tokens=800,
                        n=1,
                        temperature=0.7,
                        top_p=1.0,
                        stop=None
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
    # Port 5328 to match the existing npm script
    app.run(debug=True, port=5328)