# Simple LinksDB

A simple short link manager, with support for views tracking and QR codes. This repository only contains the backend (API) part, designed to be deployed to Cloudflare workers.

## Explanation

This project is in fact two repositories:

1. Workers backend for the API routes
2. NuxtJS frontend for client list and admin panel

This projet make extensive use of the Cloudflare platform:

- Workers: API routes and redirect link
- KV: Storing information on all links
- Pages: frontend deployment
- Macrometa (Cloudflare partner): view tracking database, using Workers `waitUntil` function to not block the user redirection

## Demo

Go to []() and use the `demo` user with the same password to login. Data resetted every day thanks to Workers Cron.

## More instructions comming soon