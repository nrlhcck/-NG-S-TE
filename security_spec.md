# Security Specification: Lingo Quest Firestore Database

## 1. Data Invariants
1. **User Identity Isolation**: A student's profile, study logs, quiz results, and friends subcollections can only be written to by that specific student (authed via `request.auth.uid`).
2. **Username Integrity**: Usernames are unique. A student can only register a document in `/usernames/{username}` if its `userId` matches their `auth.uid`, preventing username spoofing. Users cannot modify or delete someone else's username.
3. **Friend Request Mutual Consent**:
   - Creating a friend document under one's own list is restricted. When the recipient responds, they update their relative document.
4. **Activity Logs & Results**: Users can only record study logs and quiz results for themselves. Timestamp values must match `request.time`.

## 2. The "Dirty Dozen" Payloads
These payloads attempt to breach security rules and must return `PERMISSION_DENIED`:

1. **Spoofed User Registration**: Authenticated user `UID_1` attempts to create doc `/users/UID_2` (different UID).
2. **Ghost User Registration Privilege Escalation**: User attempts to assign positive XP or system privileges directly during creation.
3. **No-Authentication Read**: Unauthenticated user attempts to get profile `/users/UID_1`.
4. **Hijack Username Mapping**: Authenticated user `UID_1` attempts to register `/usernames/john` with `"userId": "UID_2"`.
5. **Overwrite Existing Username Mapping**: User `UID_1` attempts to overwrite someone else's username document in `/usernames/{un}`.
6. **Malicious Friend Add under Another User**: User `UID_1` attempts to write directly into `/users/UID_2/friends/UID_1`.
7. **Malicious Friend Status Force-Accept**: User `UID_1` claims to have an accepted relationship with `UID_2` without reciprocity or consent.
8. **Shadow Quiz Result Addition**: User `UID_1` inserts a perfect score result for user `UID_2`.
9. **Fake Timestamp Injection**: User attempts to upload `createdAt` or `completedAt` as a client-side string `2030-01-01` instead of `request.time`.
10. **Shadow Key Update Gap**: User attempts to update a user document changing `username` or other locked fields after initialization.
11. **Super Giant Field Entry (Wallet Exhaustion)**: User drafts an item with a 2MB nested field array to exhaust the project's disk capacity.
12. **Blanket Query Scraping**: User runs `getDocs(collection('users'))` without explicit query constraints matching their credentials.

## 3. Test Invariants
Our security rules must enforce all validation blocks on `create` and `update` and reject the above payloads, maintaining a zero-trust model.
