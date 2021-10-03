# NKN Codeshare Communications Protocol

## Document ID

- Every document created by the user gets a unique ID in the form of a base58-encoded 64-bit random sequence.
- Each client entering the view of a given document gets subscribed to a topic on the NKN network. The topic is a hex-encoded sha-256 digest of the string `codeshare_${id}`, where `id` is the document ID.

## Message types

- A detailed list of interfaces used in the messaging protocol is available in [protocol.ts](src/common/types/protocol.ts).

## Sessions

- Sessions are instances of one or more client (browser window) viewing and/or editing the same document.
- Messages used in a session 
- A client entering a session first starts out by publishing a `join` message (`Message<JoinMessage>`, `action = 'join'`).
- Other clients in the session respond with a `welcome` message (`Message<WelcomeMessage>`, `action = 'welcome'`).

## The Authority

- The current version of the protocol uses the coordinated (as opposed to distributed) collaborative editing model. Doing so in a decentralized network requires that all clients agree on one member of a session that holds "a single source of truth" regarding the current state of the document at any given time.
- The authority is decided based on who entered the session first. Each new client entering the session first assumes it is the authority, until it receive a `welcome` message with `authority` set to `true`.
- For authority communications, each client connects to the authority client via the `dial` NKN function.
- The communication between the authority and the peer is based on https://codemirror.net/6/examples/collab/. Detailed interfaces for the main messages used can be found in `protocol.ts`, under the `AuthorityMessage<Type>` section (`Authority*` and `Authority*Response` interfaces).
