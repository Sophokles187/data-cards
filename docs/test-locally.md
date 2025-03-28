# Testing the Documentation Locally

This guide explains how to test the Docsify documentation locally before deploying it to GitHub Pages.

## Prerequisites

You need to have Node.js installed on your computer. If you don't have it, you can download it from [nodejs.org](https://nodejs.org/).

## Method 1: Using docsify-cli

The easiest way to preview the documentation locally is to use the docsify-cli tool.

1. Install docsify-cli globally:

```bash
npm install -g docsify-cli
```

2. Navigate to the docs directory:

```bash
cd docs
```

3. Start the local server:

```bash
docsify serve
```

4. Open your browser and visit http://localhost:3000

## Method 2: Using a Simple HTTP Server

If you don't want to install docsify-cli, you can use any HTTP server.

### Using Python (if installed):

```bash
# Python 3
cd docs
python -m http.server 3000

# Python 2
cd docs
python -m SimpleHTTPServer 3000
```

### Using Node.js:

```bash
# Install http-server
npm install -g http-server

# Serve the docs folder
cd docs
http-server -p 3000
```

## Troubleshooting

- If you see a blank page, check the browser console for errors
- Make sure all paths in your markdown files are correct
- Verify that the index.html file is properly configured
- If images aren't loading, check the paths in your markdown files

## Deploying to GitHub Pages

Once you're satisfied with your documentation:

1. Push your changes to GitHub
2. Go to your repository settings
3. Under "GitHub Pages", select the "docs" folder as the source
4. Your documentation will be available at https://yourusername.github.io/your-repo-name/