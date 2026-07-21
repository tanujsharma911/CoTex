## K6 Benchmark Results (API Testing)

Tested on `GET /api/docs` fetch user docs for 200 virtual users for 30 seconds.

| Metric                | Single Server | Multi Server | Locally Running MongoDB |
| --------------------- | ------------: | -----------: | ----------------------: |
| Average Response (ms) |       5264.19 |      2871.05 |                   13.65 |
| Median Response (ms)  |       5202.63 |      2564.73 |                    9.05 |
| Minimum Response (ms) |        345.17 |       838.95 |                    0.90 |
| Maximum Response (ms) |      12674.88 |     17154.27 |                  145.64 |
| P90 (ms)              |       6904.57 |      4407.99 |                   19.69 |
| P95 (ms)              |       7151.47 |      5542.90 |                   36.94 |
| Requests/sec          |         28.94 |        48.73 |                  196.92 |
| Total Requests        |          1069 |         1652 |                    6000 |
| Failed Requests (%)   |          0.00 |         0.00 |                    0.00 |

## Lighthouse Benchmark Results (Client Testing)

1. First: No caching, No optimization at all
2. Second: Compressed images
3. Third: Lazy loading components
4. Forth: Removing google fonts and using local fonts and caching fonts
5. Fifth: Compressed images from png to avif

| Metric                   | First | Second | Third | Forth |  Fifth |
| ------------------------ | ----: | -----: | ----: | ----: | -----: |
| Performance Score        |    32 |     35 |    54 |    54 |     63 |
| Accessibility Score      |    85 |     85 |    85 |    85 |     85 |
| Best Practices Score     |   100 |    100 |   100 |   100 |    100 |
| SEO Score                |    83 |     83 |    83 |    83 |     75 |
| First Contentful Paint   | 26sec |  26sec | 13sec | 14sec | 4.7sec |
| Largest Contentful Paint | 42sec |  32sec | 27sec | 28sec |   8sec |
| Total Blocking Time      |  80ms |   50ms | 120ms | 110ms |  110ms |
| Cumulative Layout Shift  |  0.58 |   0.43 | 0.001 | 0.001 |      0 |
| Speed Index              | 26sec |  26sec | 13sec | 14sec | 4.7sec |
