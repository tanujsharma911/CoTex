# Architecture Documentation

## Architecture Diagram

```
               ┌─────────────────┐
               │   Web Client    │
               │  (Frontend UI)  │
               └────────┬────────┘
                        │
                   HTTP │ WS
                        │
┌───────────────────────▼──────────────────────────┐
│              Node.js Application                 │
│  ┌────────────────────────────────────────────┐  │
│  │  REST API Endpoints                        │  │
│  │  - /api/auth/*                             │  │
│  │  - /api/users/*                            │  │
│  │  - /api/docs/*                             │  │
│  │  - /health                                 │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  WebSocket Server (YJS CRDT)               │  │
│  │  - ws://server?token=<token>&docId=<docId> │  │
│  └────────────────────────────────────────────┘  │
└──────────────┬────────────────┬──────────────────┘
               │                │
               │                │
          ┌────▼─────┐    ┌─────▼──────┐
          │ MongoDB  │    │   Redis    │
          │          │    │            │
          │ - Users  │    │ - Pub/Sub  │
          │ - Docs   │    │            │
          │          │    │            │
          │          │    │            │
          │          │    │            │
          └──────────┘    └────────────┘
```

## Data Storage

```
Codes (latex):
    - In mongoDB document with doc information
    - Because fast implementation of initial version of project
    - Will be seperated out in future version

PDFs (Compiled):
    - In mongoDB document with doc information
    - Currently not used any where
    - Will be remove or seperated out in future version
```

### 3. Real-Time Collaboration Flow

```
User A                WebSocket Server           User B
  │                          │                     │
  ├─ Connect (ws) ──────────►│                     │
  │                          │                     │
  │                          │◄──── Connect (xs) ──┤
  │                          │                     │
  │                          │                     │
  ├─ Edit Document ─────────►│                     │
  │  (YJS update)            │                     │
  │                          ├──── Broadcast ─────►│
  │                          │   (YJS update)      │
  │                          │                     │
  │◄─────── Broadcast ───────┤◄──── Edit ──────────┤
  │                          │                     │
  │                          ▼                     │
  │                     Update DB                  │
  │                  (with debounce)               │
```



### MinIO/S3 (Object Storage future implementation)

**Why**: Infinite scalability, cheap, CDN-ready

**Stores**:
```
cotex-bucket/
├── projects/{projectId}/source/main.tex
├── projects/{projectId}/source/chapter1.tex     <- future: multi-file support
├── projects/{projectId}/output/main.pdf
├── projects/{projectId}/output/build.log
└── projects/{projectId}/assets/{uploadId}.png   <- future: user file uploads
```

How users will see
```
projects/{projectId}/
  ├── main.tex
  ├── chapter1.tex      (Future: multi-file support)
  ├── assets/           (Future: user uploads)
  │   ├── image1.png
  │   ├── figure.pdf
  │   └── data.csv
  └── output/           (compilation results)
      ├── main.pdf
      ├── main.aux
      └── main.log
```

**Access Patterns**:
- Direct uploads via presigned URLs
- Streaming downloads
- Automatic expiration for build artifacts

### Redis (Cache & State)

**Why**: Fast in-memory operations, pub/sub

**Data Structures**:
```
doc:{docId} → Channel for YJS updates, Share editors presence
presence:{docId}:{userId} → hash of user presence info (name, cursor position)
```

## Real-Time Collaboration (YJS)

### Why CRDT (Conflict-free Replicated Data Type)?

Traditional approaches (OT - Operational Transform) require a central server to serialize all operations. CRDTs allow:
- Offline editing
- P2P sync
- No central authority needed
- Automatic conflict resolution

### YJS Implementation

```markdown
# Per server maintains:
1. Active connections per document
2. Latest document state
3. Broadcasts updates or editor presence to all clients

# Client responsibilities:
1. Send local changes as YJS updates or cursor presence
2. Apply remote updates to local document
```

### Persistence Strategy (Future implementation)

```
Every N updates OR every T minutes:
  1. Serialize YJS document
  2. Save snapshot to Redis
  3. Optional: Save to DB for long-term storage

On client connect:
  1. Load latest snapshot
  2. Send to client
  3. Client applies and continues from there
```

### Endpoint Structure

```
/api
  ├── /auth
  │    ├── /register  [POST]
  │    ├── /login     [POST]
  │    └── /logout    [POST]
  │
  ├── /docs
  │    ├── /                 [GET]
  │    ├── /create           [POST]
  │    ├── /:docId           [GET, PUT, DELETE]
  │    └── /compile/:docId   [GET, POST]
  │
  └── /users
       └── /me            [GET]
```

## Security

### Authentication

- **Method**: JWT (JSON Web Tokens)
- **Flow**: Login → Token → Include in cookie
- **Expiration**: 1 day

### Password Security

- **Algorithm**: bcrypt
- **Never** store plain passwords

### Authorization

- **Ownership**:
     - Private Doc: Users can only access their own projects
     - Public Doc: Anyone can edit doc if they have the link
- **Future**: Add collaborators table for shared projects

### API Security

- **CORS**: Configured whitelist of allowed origins
- **Rate Limiting**: Implemented globally

## Deployment Architecture

### Development

```
Local Machine
  ├── Frontend (port 5173)
  ├── Server (port 3000)
  ├── Redis (Docker, port 6379)
  └── MongoDB (Atlas, cloud-hosted)
```

### Production

```
Docker Compose
  ├── Frontend (port 5175)
  ├── Load Balancer (port 8000)
  │    ├──► Server 1
  │    └──► Server 2
  ├── Redis (Docker, port 6379)
  └── MongoDB (Atlas, cloud-hosted)
```

## Monitoring & Observability

### Metrics to Track

- **Application**: Request latency, error rates, throughput
- **Database**: Connection pool usage, query performance
- **WebSocket**: Active connections, message throughput
- **Storage**: Upload/download speeds, storage usage

## Future Enhancements

### 1. Seperate LaTex Build System

### 2. Reduce DB calls for YJS updates

### 3. Build System

```
Client → Trigger Compile
         ↓
    Add job to Redis queue
         ↓
    Background worker picks up
         ↓
    Run LaTex in Docker sandbox
         ↓
    Upload PDF to MinIO
         ↓
    Notify client (WebSocket)
```

### 4. Project Collaboration

### 5. Version Control

```sql
file_versions (
    id,
    file_id,
    version,
    content,
    created_at,
    created_by
)
```
