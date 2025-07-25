# Saju GPT API Demo - Next.js + Flask

This is a hybrid Next.js + Flask application that demonstrates integration with the Saju GPT API for Korean fortune telling. The app uses Next.js as the frontend and Flask as the API backend.

## Features

- 🔮 Saju (Korean fortune telling) readings using GPT API
- ⚡ Next.js 13+ with App Router and TypeScript
- 🐍 Flask API backend with streaming responses
- 🎨 Tailwind CSS for styling
- 🚀 Vercel deployment ready
- 🐛 VS Code debugging configuration included
- 📱 Responsive design with dark/light mode support

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   pip3 install -r requirements.txt
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your SAJU_API_KEY
   ```

3. **Start development servers:**
   ```bash
   # Option 1: Run both servers concurrently
   npm run dev
   
   # Option 2: Run separately
   npm run next-dev    # Next.js on :3000
   npm run flask-dev   # Flask on :5328
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

### VS Code Debugging

This project includes comprehensive VS Code debugging configurations:

- **Next.js debugging**: Client-side and server-side React debugging
- **Flask debugging**: Python API debugging with breakpoints
- **Full-stack debugging**: Debug both frontend and backend simultaneously

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed debugging instructions.

## How It Works

The Python/Flask server is mapped into to Next.js app under `/api/`.

This is implemented using [`next.config.js` rewrites](https://github.com/vercel/examples/blob/main/python/nextjs-flask/next.config.js) to map any request to `/api/:path*` to the Flask API, which is hosted in the `/api` folder.

On localhost, the rewrite will be made to the `127.0.0.1:5328` port, which is where the Flask server is running.

In production, the Flask server is hosted as [Python serverless functions](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python) on Vercel.

## Demo

https://nextjs-flask-starter.vercel.app/

## Deploy Your Own

You can clone & deploy it to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-title=Next.js%20Flask%20Starter&demo-description=Simple%20Next.js%20boilerplate%20that%20uses%20Flask%20as%20the%20API%20backend.&demo-url=https%3A%2F%2Fnextjs-flask-starter.vercel.app%2F&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F795TzKM3irWu6KBCUPpPz%2F44e0c6622097b1eea9b48f732bf75d08%2FCleanShot_2023-05-23_at_12.02.15.png&project-name=Next.js%20Flask%20Starter&repository-name=nextjs-flask-starter&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fexamples%2Ftree%2Fmain%2Fpython%2Fnextjs-flask&from=vercel-examples-repo)

## Developing Locally

You can clone & create this repo with the following command

```bash
npx create-next-app nextjs-flask --example "https://github.com/vercel/examples/tree/main/python/nextjs-flask"
```

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The Flask server will be running on [http://127.0.0.1:5328](http://127.0.0.1:5328) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Flask Documentation](https://flask.palletsprojects.com/en/1.1.x/) - learn about Flask features and API.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
