# IITStudentsOS deployment batch checklist

This file is the running deployment queue. Do not remove an item until the code is merged, production deployment is **Ready**, and the feature has been checked on the live site. A Git commit or PR is not a production deployment.

## Previously failed production deployment — carry forward

- [ ] Vercel production deployment `dpl_Enozw5yXz2aeoznoJA4uAdjFfq8a`
- [ ] Commit `a1b08861e87cc7dd11bfa7bf01d64bcb6b18e5e4` (student names open public profiles from production chat)
- [ ] Prior build error: `npm run build` exited 1. Inspect/fix, rebuild, deploy, and verify production profile navigation.

## Contribution streaks, badges, and certificate — draft PR #13

- [ ] Review and merge draft PR: https://github.com/MINKIKAR-SRINIVAS-PRASAD/IIT-Connect/pull/13
- [ ] One point for each approved post across post-enabled sections; no points for chat, DMs, or messages.
- [ ] Award is idempotent per source post; retract points if an approved post is later rejected.
- [ ] Silver at 1,000; Gold at 5,000; Platinum at 10,000.
- [ ] Profile badge/progress/reward UI; earned badge on Enhanced public student profile.
- [ ] Platinum certificate issued to eligible student accounts, with certificate ID and verification endpoint.
- [ ] Certificate must clearly say it is IITStudentsOS platform contribution recognition, not an official IIT/institute certificate.
- [ ] Test approval/rejection/duplicate approval and verify point counts before production.

## Chat, connections, and public profiles

- [ ] Fix connection request API route failures and request/accept/reject refresh.
- [ ] Verify Discover, incoming/outgoing requests, accepted connections, and private DMs.
- [ ] Private messaging is available only after connection acceptance.
- [ ] Clicking a student's name/avatar opens their public profile.
- [ ] Profile shows safe public details, posts by section, and connections; never expose email publicly.
- [ ] Test profile navigation and API in student portal and mobile web/app.

## News and posts

- [ ] Campus News page and student campus-news posting.
- [ ] Consistent Create/Add Post controls and layout across relevant post pages.
- [ ] Verify posts land in the correct section/category and profile feed.
- [ ] Admin approval and moderation work for every post type.

## Faculty portal

- [ ] Faculty portal remains a separate role/interface from student portal.
- [ ] Faculty Chat & Community and faculty AI entry point work.
- [ ] Align navigation/shared UI while checking student/faculty API isolation.
- [ ] Test both portals after shared components or API changes.

## OTP / mail sender

- [ ] Use `connectingiitsoverindia@gmail.com` for all OTP-related sending: registration, resend, verification, password reset, and other OTP flows.
- [ ] Confirm production SMTP environment configuration and student/faculty delivery.

## Trip and Travel

- [ ] Keep Trip and Travel Home as separate pages/modules.
- [ ] Trip page contains trip-specific functionality; Travel Home contains its own forms/details.
- [ ] Required fields validated on client and server.
- [ ] Check student and faculty portal behavior as applicable.

## Mobile / final release checks

- [ ] Check responsive layouts, navigation, profile, chat, news, and post creation.
- [ ] Check APK/WebView authentication/session and unauthorized-notification issue.
- [ ] Batch deployment only after the queued code is reviewed and build-tested.
- [ ] Verify Vercel production and backend status, environment variables, API proxy, and live flows.
- [ ] Keep the checklist open until each feature is verified in production.

## Mobile-first student navigation (new request)

- [ ] Keep desktop navigation/layout unchanged; redesign the student mobile experience to feel like a native social app (Instagram-inspired, not copied).
- [ ] Add a fixed, safe-area-aware bottom navigation on mobile with exactly five destinations: Home, Study, Chat, Students Search, Profile.
- [ ] Keep the bottom bar visible while scrolling, with active-route state, accessible labels, and enough page bottom padding so content is not obscured.
- [ ] Move all other student sections (News, Events, Gallery, Placements, Trip, Travel Home, AI, etc.) into a discoverable menu on the Home page/mobile home experience; avoid cluttering the fixed bottom bar.
- [ ] Ensure Students Search points to the actual student discovery/search experience (confirm route/API; do not point it to a placeholder).
- [ ] Apply the mobile navigation consistently to the student portal in both frontend copies; do not unintentionally replace the separate faculty/admin navigation.
- [ ] Test mobile widths, Android safe-area/browser bars, route transitions, and profile/chat navigation before batch deployment.
