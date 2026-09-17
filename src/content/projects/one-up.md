---
title: One-Up
summary: >-
  A goal tracker dressed up as a friendly rivalry: couples, families and friend
  groups compete on challenges with stakes on the line. Shipped as a PWA and an
  Android app on ASP.NET Core and React.
stack:
  - C#
  - ASP.NET Core 10
  - EF Core
  - PostgreSQL
  - React 19
  - TypeScript
  - TanStack Query
  - Firebase Auth
role: Designer and engineer
timeframe:
  start: 2026-07-01
  end: null
liveUrl: https://one-up-app.com
featured: true
order: 1
status: shipped
---

<!-- TODO: add a screenshot or two of the arena and a win card. -->

## The problem

Goal trackers are easy to start and easy to abandon, because nothing happens
when you quietly stop. The thing that actually keeps people going is someone
else noticing.

One-Up is a goal tracker built around that: you and a partner, family or friend
group compete on challenges — run a 5k, 20k steps a day, no takeout for a week,
read five books in thirty days — with real stakes attached. Loser cooks dinner.
The tracking is the same as any other app; the accountability is the product.

## Approach

**A real backend, not a toy.** ASP.NET Core 10 Web API with EF Core over
PostgreSQL, deployed for real: Neon for the database, Render for the API, Vercel
for the client. Authentication is Firebase — email/password and Google — with
the API verifying ID tokens through the Firebase Admin SDK, so no password
material is ever stored or handled by my code.

**Installable and offline-capable.** The client is React 19 on Vite with
TanStack Query, shipped as a PWA with an offline app shell, plus web push
through VAPID for nudges and reminders. There's an Android build on top of the
same codebase.

**Tested at three levels.** Unit tests with EF Core's in-memory provider,
integration tests against a real Postgres instance, and end-to-end tests that
spin up an actual API, Vite dev server and the Firebase Auth emulator together.
The e2e layer exists because the auth and service-worker bugs that mattered most
were exactly the ones that only appear when real pieces talk to each other.

## The expensive lesson

The most useful thing this project taught me had nothing to do with features.

The managed Postgres I use bills wall-clock awake time rather than queries, and
its compute cannot suspend while any client connection stays open. Npgsql's
connection pool holds idle connections open indefinitely by default, so the
database never slept — and a month's allowance burned in eighteen days.

The pool was the easy half: capping the minimum pool size at zero, with a short
idle lifetime and aggressive pruning, let the compute suspend between requests.
The real culprit was invisible from inside the repository. An external uptime
monitor was polling on a shorter interval than the database's autosuspend
window, so the database structurally never got a chance to sleep. No amount of
reading the code would have found it, because the cause lived in a third-party
dashboard that the repo has no knowledge of.

What I took from it: with managed infrastructure, the billing model is part of
the architecture. Connection pooling had always been a performance concern to
me, and here it was a cost one. And the monitoring you add for safety can
quietly become the thing you are paying for.

## Outcome

Live at [one-up-app.com](https://one-up-app.com), with seasons, a stakes ledger,
badges, handicaps for uneven matchups, rest days, shareable win cards, and dark
mode. The repository is private, but the decision log behind it is the part I'd
point at in an interview: every milestone records what was chosen, what was
traded away, and what broke afterwards.
