# webcrawlerhttp

A command-line web crawler built with Node.js. Give it a website URL and it will follow every internal link it can find, then print a report showing how many times each page was linked to, sorted from most to least linked.

This project was built as part of an HTTP course code-along.

## Table of Contents

- [webcrawlerhttp](#webcrawlerhttp)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [How It Works](#how-it-works)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Example Output](#example-output)
  - [Running the Tests](#running-the-tests)
  - [Project Structure](#project-structure)
  - [Module Reference](#module-reference)
    - [`main.js`](#mainjs)
    - [`crawl.js`](#crawljs)
    - [`report.js`](#reportjs)

## Features

- Crawls an entire website starting from a single URL
- Stays on the starting domain and ignores external links
- Normalizes URLs so that `http://site.com/about/` and `https://SITE.com/about` count as the same page
- Skips pages it has already visited, which prevents infinite loops
- Handles HTTP errors, non-HTML responses, and network failures without crashing
- Prints a ranked report of internal links
- Includes unit tests for URL handling, HTML parsing, and report sorting

## How It Works

1. `main.js` reads the starting URL from the command line.
2. `crawlPage` fetches that page over HTTP using Node's built-in `fetch`.
3. If the response is a successful HTML page, `getURLsFromHTML` extracts every `<a>` link using jsdom.
4. Each link is normalized by `normalizeURL`, checked against the pages already seen, and crawled recursively if it is new and on the same domain.
5. A shared `pages` object keeps a running count of how many times each normalized URL was linked to.
6. When the crawl finishes, `printReport` sorts the counts in descending order and prints the report.

## Requirements

- **Node.js**: the project pins `18.7.0` in `.nvmrc`. Node 18 or newer is required for the built-in `fetch`. Jest 30 may require a slightly newer release than 18.7.0 (around 18.14 or later), so if you run into odd errors when running the tests, switch to a current LTS version of Node.
- **npm**: installed alongside Node.

Optional: [nvm](https://github.com/nvm-sh/nvm) to switch Node versions easily.

## Installation

```bash
# Clone the repository
git clone https://github.com/ehsanul18/webcrawlerhttp.git
cd webcrawlerhttp

# (Optional) use the Node version from .nvmrc
nvm use

# Install dependencies
npm install
```

Dependencies installed:

| Package | Type | Purpose |
|---|---|---|
| `jsdom` | dependency | Parses HTML into a DOM so links can be extracted |
| `jest` | devDependency | Test runner |

## Usage

```bash
npm start <website-url>
```

Example:

```bash
npm start https://blog.boot.dev
```

The program expects **exactly one** argument, the URL to start crawling from. It exits with an error message if you provide none or more than one:

```
no website provided
too many command line args
```

Always include the protocol (`https://` or `http://`). A bare domain such as `blog.boot.dev` is not a valid URL for the crawler.

Note: `npm start` runs `node --no-warnings main.js`. The `--no-warnings` flag suppresses Node's experimental-feature warnings for `fetch` on older Node versions.

## Example Output

While crawling, the program logs each new page it visits and any problems it meets:

```
Starting crawl of https://blog.boot.dev
actively crawling: https://blog.boot.dev
actively crawling: https://blog.boot.dev/about/
error in fetch with status code : 404 on page: https://blog.boot.dev/missing/
non html response, content type : image/png on page: https://blog.boot.dev/logo.png
```

When it finishes, it prints the report:

```
=========
REPORT
=========
Found 42 links to page: blog.boot.dev
Found 17 links to page: blog.boot.dev/about
Found 3 links to page: blog.boot.dev/tags/go
=========
END OF REPORT
=========
```

(The numbers above are illustrative. Real output depends on the site.)

Report keys are **normalized URLs**: the protocol, query string, hash, and trailing slash are removed, and the hostname is lowercased.

## Running the Tests

```bash
npm test
```

This runs Jest, which finds and runs every `*.test.js` file.

What is covered:

| Test file | What it checks |
|---|---|
| `crawl.test.js` | `normalizeURL`: strips protocols (`http` and `https`), strips trailing slashes, lowercases hostnames |
| `crawl.test.js` | `getURLsFromHTML`: absolute links, relative links, a mix of both, and invalid links being skipped |
| `report.test.js` | `sortPages`: sorts by hit count in descending order (2-page and 5-page cases) |

You will see a `TypeError: Invalid URL` message printed during the "invalid" test. That is the expected `console.log` from the error handler and not a test failure.

The network-based `crawlPage` function and `printReport` are not covered by automated tests.

## Project Structure

```
webcrawlerhttp/
├── .gitignore         # Ignores node_modules/
├── .nvmrc             # Pins Node version (18.7.0)
├── crawl.js           # Core crawler logic
├── crawl.test.js      # Tests for crawl.js
├── main.js            # Command-line entry point
├── package.json       # Project manifest and scripts
├── package-lock.json  # Exact dependency versions
├── report.js          # Sorting and printing of results
└── report.test.js     # Tests for report.js
```

## Module Reference

### `main.js`

The entry point. Validates command-line arguments, starts the crawl with an empty `pages` object, and passes the result to `printReport`.

### `crawl.js`

**`normalizeURL(urlString)`**

Converts a URL into a canonical `hostname + pathname` string.

```js
normalizeURL('https://BLOG.boot.dev/path/')  // 'blog.boot.dev/path'
normalizeURL('http://blog.boot.dev/path')    // 'blog.boot.dev/path'
```

Throws if `urlString` is not a valid URL.

**`getURLsFromHTML(htmlBody, baseURL)`**

Parses an HTML string and returns an array of absolute URLs for every `<a>` element.

- Links starting with `/` are resolved against `baseURL`.
- Other links are treated as absolute URLs.
- Invalid links are logged and skipped.

```js
getURLsFromHTML('<a href="/about">About</a>', 'https://blog.boot.dev')
// ['https://blog.boot.dev/about']
```

**`crawlPage(baseURL, currentURL, pages)`**

Recursively crawls a site and returns the `pages` object.

- `baseURL`: the starting site, used to restrict the crawl to one domain
- `currentURL`: the page to crawl now
- `pages`: an object mapping normalized URLs to link counts

For each page, it:

1. Returns immediately if the hostname differs from `baseURL`.
2. Increments the count and returns if the page was already seen.
3. Otherwise fetches the page, and returns early on a status code above 399 or a non-HTML content type.
4. Extracts links and crawls each one in order.

### `report.js`

**`sortPages(pages)`**

Converts the `pages` object into an array of `[url, hits]` pairs sorted by hits in descending order.

**`printReport(pages)`**

Prints the sorted results in a readable report format.