# Security Specification - Meu Carro (MeuCarro)

## 1. Data Invariants
- **User Ownership**: A user profile document at `/users/{userId}` can only be accessed by the user whose UID matches `{userId}`.
- **Credit Integrity**: `aiCredits` must always be a non-negative integer.
- **Role Integrity**: `isProMember` is a boolean flag. Only the user themselves can see it, and it can only be set to `true` by an "Upgrade" action.
- **Transaction Audit**: `transactionHistory` must be an array, and each entries must contain standardized fields.

## 2. The "Dirty Dozen" Payloads (Attack Vectors)
1. **Identity Theft**: Authenticated user A tries to read `/users/userB`.
2. **Credit Injection**: User tries to set `aiCredits` to 999999 without a transaction.
3. **Privilege Escalation**: User tries to set `isProMember` to `true` directly without an upgrade payment.
4. **History Erasure**: User tries to delete their `transactionHistory`.
5. **ID Poisoning**: User tries to create a document with a 2KB string as ID.
6. **Negative Credits**: User tries to set `aiCredits` to -100.
7. **Cross-User Write**: User A tries to update user B's transaction history.
8. **Shadow Field Injection**: User tries to add `role: 'admin'` to their document.
9. **Timestamp Spoofing**: User tries to send a manual `updatedAt` string from the past.
10. **Anonymous Access**: Unauthenticated user tries to read any user profile.
11. **Mass Extraction**: User tries to list all documents in `/users/`.
12. **Type Poisoning**: User tries to set `aiCredits` to a string `"lots"`.

## 3. Test Runner (Conceptual)
All the above payloads MUST return `PERMISSION_DENIED`.
