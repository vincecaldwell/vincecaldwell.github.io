---
title: Meddy Tate
summary: >-
  A cross-platform meditation app built with Expo and React Native, with
  synthesised audio, offline-first session tracking, and streaks that survive a
  missed day without guilt-tripping you.
stack:
  - TypeScript
  - React Native
  - Expo
  - Expo Router
  - Jest
role: Designer and engineer
timeframe:
  start: 2026-08-01
  end: null
featured: true
order: 1
status: in-progress
---

<!-- TODO: add a screenshot or two once the UI settles, and a store link or
     public repo URL if the project goes public. -->

## The problem

Meditation apps tend to be either a subscription funnel wrapped around a
content library, or a bare timer. I wanted the middle: a small app with real
guided sessions, an honest timer, and enough structure to build a habit —
without an account, a paywall, or a network connection.

That framing decided most of the architecture. No backend means no sync, no
auth, and no server to keep running, but it also means everything about
progress tracking has to work locally and survive app restarts and upgrades.

## Approach

**Audio is content, not code.** The bells and ambient beds are synthesised by a
Python script in the repo rather than licensed or bundled as opaque assets. They
carry no licensing baggage and can be retuned by editing the script and
re-running it. Guided narration is the one piece that needs a recorded voice.

**Sessions degrade gracefully.** A session whose narration file doesn't exist
yet still runs — the sit is driven by the countdown clock and simply plays no
voice. The entire flow works end to end before any audio is recorded: start,
finish, log the sit, unlock a badge. That kept the app usable throughout
development instead of blocked on content.

**Storage is versioned from the start.** Local state carries a schema version,
so a future change to the record shape has somewhere to migrate from rather than
silently discarding someone's history. Streak, achievement and logging logic are
pure functions with unit tests, because those are the rules users notice
immediately when they're wrong.

## Architecture

Expo Router drives a small surface: three tabs (today, library, you), a session
player, and a standalone timer. Around 3,000 lines of TypeScript, split so the
interesting logic sits in `lib/` — audio, content manifest, stats, storage,
theme — and the screens stay thin.

Audio configures a `doNotMix` interruption mode deliberately rather than by
default, so lock-screen controls and background playback behave the way a
meditation app should when another app grabs the audio session.

Motion respects the system reduce-motion setting through a dedicated hook, which
matters more than usual here: the animations are ambient and persistent rather
than incidental.

## What I'd do differently

Starting with synthesised audio was the decision that paid off most — it removed
an entire category of licensing and asset-pipeline work that would otherwise
have blocked everything else. The thing I'd revisit is content modelling: the
session manifest is a single JSON file, which is fine at this size and will need
real structure before it holds a library.
