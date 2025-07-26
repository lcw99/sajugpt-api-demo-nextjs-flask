'use client';

import { useState, FormEvent, useEffect } from 'react';
// Import SyntaxHighlighter and a style
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Choose a style you like!

// The Python sample code as a string
const pythonApiSampleCode = `
import json
from openai import OpenAI

def generate_text_example(stream=False):
    """
    A simple example to generate text using the OpenAI API.
    """
    try:
        client = OpenAI(
            base_url="https://api.sajugpt.net/v1",
            api_key="key" 
        )
        user_message = "오늘의 운세를 알려 주세요."
        # user_message = "내년 운세를 알려 주세요."

        print(f"Sending prompt to OpenAI: \"{user_message}\"")

        # all parameters are same as OpenAI API, make sure user_data is correctly formatted
        user_data = {
            "appVersion": 199, # do not change
            "userId": "KEY_PROVIDED_BY_STRAGIO_SOFT",  # use your own userId provided by Stragio Soft.
            "birthday": "196508220840", "gender": "male", "today": "20250518" # birthday format: YYYYMMDDHHMM, today format: YYYYMMDD, gender is male/female
        }
        user_str = json.dumps(user_data)
        response = client.chat.completions.create(
            model="stargio-saju-chat", # do not change
            user=user_str,
            messages=[
                {"role": "user", "content": user_message} # currently only one message is supported
            ],
            stream=stream,    # Set to True if you want to receive streaming responses
            max_tokens=800,  # Limit the length of the generated text
            n=1,    # do not change
            temperature=0.7, # do not change
            top_p=1.0, # do not change
            stop=None        
        )

        if stream:
            print("\nGenerated Text (Streaming):")
            full_response_content = ""
            for chunk in response:
                if chunk.choices:
                    content = chunk.choices[0].delta.content
                    if content:
                        print(content, end="", flush=True)
                        full_response_content += content
            print()
        else:    
            if response.choices:
                generated_text = response.choices[0].message.content.strip()
                print("\nGenerated Text:")
                print(generated_text)
            else:
                print("\nNo text was generated.")

    except Exception as e:
        print(f"An error occurred: {e}")

import time
if __name__ == "__main__":
    generate_text_example(stream=True)
`;


export default function Home() {
  const [birthdate, setBirthdate] = useState('');
  const [birthtime, setBirthtime] = useState('');
  const [gender, setGender] = useState('male');
  const [question, setQuestion] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [streamingResult, setStreamingResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSampleCode, setShowSampleCode] = useState(false); // State for code block visibility
  const [isV2Mode, setIsV2Mode] = useState(false); // State for v=2 mode
  const [copyMessage, setCopyMessage] = useState(''); // State for copy confirmation message
  const [isCompatibilityMode, setIsCompatibilityMode] = useState(false); // State for 궁합 mode
  const [birthdate2, setBirthdate2] = useState('');
  const [birthtime2, setBirthtime2] = useState('');
  const [gender2, setGender2] = useState('male');

  // Check for v=2 URL parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vParam = urlParams.get('v');
    const isV2 = vParam === '2';
    setIsV2Mode(isV2);
  }, []);

  // Dynamically set system prompt based on v2 mode and compatibility mode
  useEffect(() => {
    if (isV2Mode) {
      if (isCompatibilityMode) {
        // Set compatibility mode system prompt
        setSystemPrompt('사주GPT는 Stargio Soft가 개발한 대규모 인공지능 언어모델 이다. 사주GPT는 다음 상황을 시뮬레이션 합니다. 사주 명리 상담센터에서 전문가가 연애상담을 해주는 상황을 가정하세요. 위 사주 정보에 기반하여 아래 질문에 답하세요. 위 사주 정보상의 \'본인\'이 상담 하러 온사람이고 \'상대방\'은 연애 상대방을 말합니다. 상담자 본인은 당신이라고 부르세요. 인사는 생략 하세요. \n존대말을 사용하세요. 위 사주 정보에 적절한 답이 없을 경우 정보를 기반으로 명리 이론을 적용하여 답변을 찾으세요.');
      } else {
        // Set regular v2 mode system prompt
        setSystemPrompt('이 시스템은 Stargio Soft가 개발한 대규모 인공지능 언어모델인 사주GPT이다. 사주명리 철학자 선생님이 상담자의 운세를 봐주는 상황을 가정하세요. 전문적인 운세 해설과 인생의 지혜를 제공하세요. 상담자 호칭은 당신으로 합니다. 인사는 생략 하세요. 존대말을 사용하세요.\n위 사주 정보에 기반하여 아래 질문에 답하세요. 상담자의 용기를 북 돋워 주세요. 사주 정보에 적절한 답이 없을 경우 정보를 기반으로 명리 이론을 적용하여 답변을 찾으세요.');
      }
    }
  }, [isV2Mode, isCompatibilityMode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // ... (your existing handleSubmit function remains unchanged)
    event.preventDefault();
    setIsLoading(true);
    setStreamingResult('');
    setError('');

    if (!/^\d{8}$/.test(birthdate)) {
      setError('Error: Birthday must be in YYYYMMDD format.');
      setIsLoading(false);
      return;
    }
    if (!/^\d{4}$/.test(birthtime)) {
      setError('Error: Birth time must be in HHMM format.');
      setIsLoading(false);
      return;
    }
    
    // Validate second person's info if compatibility mode is enabled
    if (isCompatibilityMode) {
      if (!/^\d{8}$/.test(birthdate2)) {
        setError('Error: Second person\'s birthday must be in YYYYMMDD format.');
        setIsLoading(false);
        return;
      }
      if (!/^\d{4}$/.test(birthtime2)) {
        setError('Error: Second person\'s birth time must be in HHMM format.');
        setIsLoading(false);
        return;
      }
    }
    
    if (!question.trim()) {
      setError('Error: Saju question cannot be empty.');
      setIsLoading(false);
      return;
    }

    const birthday = birthdate + birthtime;

    try {
      const requestBody: any = {
        birthday: birthday,
        gender: gender,
        question: question,
      };

      // Add second person's info if compatibility mode is enabled
      if (isCompatibilityMode) {
        const birthday2Full = birthdate2 + birthtime2;
        requestBody.birthday2 = birthday2Full;
        requestBody.gender2 = gender2;
      }

      // Add system prompt to request body if in v2 mode
      if (isV2Mode && systemPrompt.trim()) {
        requestBody.systemPrompt = systemPrompt;
      }

      const response = await fetch('/api/saju', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.' }));
        setError(`Error: ${response.status} ${response.statusText} - ${errorData.error || 'Failed to fetch from API'}`);
        setIsLoading(false);
        return;
      }

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          setStreamingResult((prevResult) => prevResult + chunk);
        }
      } else {
        setError('Response body is null.');
      }
    } catch (err) {
      console.error('Error fetching Saju data:', err);
      setError(`An error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSampleCode = () => {
    setShowSampleCode(!showSampleCode);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(streamingResult);
      setCopyMessage('Copied!');
      // Clear the message after 2 seconds
      setTimeout(() => {
        setCopyMessage('');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyMessage('Failed to copy');
      // Clear the error message after 2 seconds
      setTimeout(() => {
        setCopyMessage('');
      }, 2000);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 lg:p-24 bg-gradient-to-b from-zinc-200 via-slate-100 to-stone-200 dark:from-zinc-800/30 dark:via-neutral-900 dark:to-black">
      <div className="z-10 w-full max-w-2xl items-center justify-between font-mono text-sm">
        <h1 className="text-3xl lg:text-4xl font-bold text-center pb-8 pt-4 text-gray-800 dark:text-gray-200">
          Saju GPT API Demo{isV2Mode ? ' (v2)' : ''}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-xl shadow-2xl">
          {/* ... (your existing form inputs for birthdate, birthtime, gender, question) ... */}
          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Birthday (YYYYMMDD)
            </label>
            <input
              type="text"
              id="birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              pattern="\d{8}"
              placeholder="e.g., 19900101"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="birthtime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Birth Time (HHMM)
            </label>
            <input
              type="text"
              id="birthtime"
              value={birthtime}
              onChange={(e) => setBirthtime(e.target.value)}
              pattern="\d{4}"
              placeholder="e.g., 1430"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Compatibility checkbox */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isCompatibilityMode}
                onChange={(e) => setIsCompatibilityMode(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-600 rounded dark:bg-zinc-700"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                궁합 (Compatibility Mode)
              </span>
            </label>
          </div>

          {/* Second person's info - only show when compatibility mode is enabled */}
          {isCompatibilityMode && (
            <>
              <div>
                <label htmlFor="birthdate2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Second Person's Birthday (YYYYMMDD)
                </label>
                <input
                  type="text"
                  id="birthdate2"
                  value={birthdate2}
                  onChange={(e) => setBirthdate2(e.target.value)}
                  pattern="\d{8}"
                  placeholder="e.g., 19900101"
                  required={isCompatibilityMode}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="birthtime2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Second Person's Birth Time (HHMM)
                </label>
                <input
                  type="text"
                  id="birthtime2"
                  value={birthtime2}
                  onChange={(e) => setBirthtime2(e.target.value)}
                  pattern="\d{4}"
                  placeholder="e.g., 1430"
                  required={isCompatibilityMode}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="gender2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Second Person's Gender
                </label>
                <select
                  id="gender2"
                  value={gender2}
                  onChange={(e) => setGender2(e.target.value)}
                  required={isCompatibilityMode}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </>
          )}

          {/* System Prompt field - only show in v=2 mode */}
          {isV2Mode && (
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                System Prompt (v2 mode)
              </label>
              <textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter system prompt..."
                rows={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
              />
            </div>
          )}

          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Saju Question
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., 오늘의 운세를 알려 주세요."
              required
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Get Saju Reading'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {/* Button to show/hide the sample API code */}
        <div className="mt-8 text-center">
          <button
            onClick={toggleSampleCode}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            {showSampleCode ? 'Hide' : 'Show'} Sample API Client Code (Python)
          </button>
        </div>

        {/* Conditionally rendered code block */}
        {showSampleCode && (
          <div className="mt-6 w-full">
            <SyntaxHighlighter
              language="python"
              style={atomDark} // Or any other style you imported
              showLineNumbers={true}
              customStyle={{
                borderRadius: '0.5rem', // 8px
                padding: '1rem', // 16px
                fontSize: '0.875rem', // 14px
              }}
            >
              {pythonApiSampleCode.trim()}
            </SyntaxHighlighter>
          </div>
        )}

        {streamingResult && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">API Response:</h2>
              <div className="flex items-center gap-2">
                {copyMessage && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    {copyMessage}
                  </span>
                )}
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
            <pre className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-md shadow text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {streamingResult}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}