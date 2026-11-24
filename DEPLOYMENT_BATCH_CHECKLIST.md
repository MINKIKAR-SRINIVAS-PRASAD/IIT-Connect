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

## Cross-IIT student connections and accepted-only private chat (new request)

- [ ] Any eligible student account can discover/search students from any IIT (not restricted to their own institute); show institute and safe public profile fields to distinguish users.
- [ ] Student A can send a connection request to Student B across IITs; prevent self-requests and duplicate/pending requests.
- [ ] Student B can accept or reject; requester can see request status and withdraw/cancel if supported.
- [ ] Create/maintain a connection only after acceptance; both students can see accepted connection state.
- [ ] Enable private one-to-one chat only for mutually accepted connections; pending/rejected/blocked users cannot start or continue private conversations.
- [ ] Enforce connection authorization on backend/API and socket/message endpoints, not only by hiding frontend buttons.
- [ ] Refresh/update request, acceptance, rejection, and chat access states reliably in both student UI copies.
- [ ] Preserve student/faculty separation, prevent unauthorized access, and avoid exposing private email or sensitive account data in discovery.
- [ ] Test cross-institute cases, both request directions, rejected/pending states, duplicate requests, and direct API/socket access before batch deployment.

## Community-wide public posts (new request)

- [ ] Posts are public to all eligible IITStudentsOS community members by default, regardless of the author's IIT/institute.
- [ ] Public posts are visible to students from every IIT, not filtered to same-institute users.
- [ ] Public posts are visible to all community members, not only accepted connections/friends.
- [ ] Connection status controls private messaging only; it must not gate visibility of public posts.
- [ ] Apply consistent public visibility across community feed, section feeds (News, Events, Gallery, Study, placements and other post sections as applicable), and public student profiles.
- [ ] Preserve admin moderation, removed/deleted content behavior, and any explicitly private content; do not accidentally expose private messages, private account fields, or unpublished drafts.
- [ ] Review backend query filters, authorization rules, and frontend feed filters in both student portal copies; verify cross-IIT and unconnected-user visibility.
- [ ] Test with users from different IITs and users who are not connected before batch deployment.

## Mobile unified post composer and swipe drawer (new request)

- [ ] On mobile, remove repeated Upload/Create Post controls from individual section pages; keep a clear post/upload entry point on the student's Profile page and/or one unified composer.
- [ ] Add a mobile left-edge left-to-right swipe gesture to open a page/section drawer; provide an accessible visible fallback trigger and close gesture/button.
- [ ] Drawer lists available post destinations/sections (e.g. News, Gallery, Events, Study, Placements and other supported sections) and lets the user choose where the post belongs.
- [ ] After choosing a destination, open a unified composer with destination-specific required fields/details and relevant media upload; validate required inputs.
- [ ] Publish to the selected section/category, with the established community-wide public visibility and moderation/approval rules.
- [ ] Ensure drawer gesture does not conflict with browser navigation, chat swipe/gestures, scrolling, or fixed bottom navigation; support touch and accessibility.
- [ ] Apply to mobile student portal; preserve desktop behavior and faculty/admin separation unless explicitly specified.
- [ ] Test composer destination, post metadata/category, public cross-IIT visibility, upload flow, and moderation before batch deployment.

## Post privacy controls (newly approved)

- [ ] Add an audience selector to the unified post composer; default visibility is Public.
- [ ] Public posts remain visible to all eligible IITStudentsOS community members across IITs, connected or not.
- [ ] Support Private audience options: (a) Only me, (b) accepted connections only, and (c) a custom list of specifically selected students.
- [ ] Persist visibility/audience and selected-user IDs per post; validate the author and allowed audience on the backend.
- [ ] Private posts must be excluded from public/community feeds, section-wide public feeds, public profile post lists, and public search/indexing.
- [ ] Enforce private visibility for post detail, media/file access, comments/reactions as applicable, APIs, and any direct URL; frontend hiding alone is insufficient.
- [ ] Only the author and selected audience can view a private post; only-me is author-only. Custom audience selection must use safe student identities and not expose email.
- [ ] Private post visibility must not be confused with connection/chat permissions; audience access does not automatically grant private chat, and accepted connection status does not reveal a private post unless its audience allows it.
- [ ] Respect moderation, deletion, and account access rules; do not leak private content through notifications, previews, cached responses, or profile/feed APIs.
- [ ] Test public defaults, each private audience mode, adding/removing audience members, unauthorized direct API/media access, and cross-IIT accounts before batch deployment.
