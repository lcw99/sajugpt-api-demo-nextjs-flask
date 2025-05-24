'use client'; // Add this if you're using Next.js App Router and need client-side interactivity

import { useState, FormEvent } from 'react';
// You can keep the Image and Link imports if you plan to use them elsewhere,
// but they are not used in this specific form example.
// import Image from 'next/image';
// import Link from 'next/link';

export default function Home() {
  const [birthdate, setBirthdate] = useState(''); // YYYYMMDD
  const [birthtime, setBirthtime] = useState(''); // HHMM
  const [gender, setGender] = useState('male');
  const [question, setQuestion] = useState('');
  const [streamingResult, setStreamingResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    if (!question.trim()) {
      setError('Error: Saju question cannot be empty.');
      setIsLoading(false);
      return;
    }

    const birthday = birthdate + birthtime; // Combine for API

    try {
      // We'll assume your Python API endpoint is at /api/saju
      // This should be a Python file like `api/saju.py` in your Vercel project
      const response = await fetch('/api/saju', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthday: birthday,
          gender: gender,
          question: question,
        }),
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 lg:p-24 bg-gradient-to-b from-zinc-200 via-slate-100 to-stone-200 dark:from-zinc-800/30 dark:via-neutral-900 dark:to-black">
      <div className="z-10 w-full max-w-2xl items-center justify-between font-mono text-sm">
        <h1 className="text-3xl lg:text-4xl font-bold text-center pb-8 pt-4 text-gray-800 dark:text-gray-200">
          Saju GPT Demo
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-xl shadow-2xl">
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

          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Saju Question
            </label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., 오늘의 운세를 알려 주세요."
              required
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

        {streamingResult && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">API Response:</h2>
            <pre className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-md shadow text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {streamingResult}
            </pre>
          </div>
        )}
      </div>
      {/* You can add back the Vercel/Next.js promo content below if you wish */}
      {/* <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"> ... </div> */}
      {/* <div className="relative flex place-items-center ..."> ... </div> */}
      {/* <div className="mb-32 grid text-center ..."> ... </div> */}
    </main>
  );
}