# Sangeetham API

![GitHub License](https://img.shields.io/github/license/venubingi01/sangeetham-api)
![GitHub Release](https://img.shields.io/github/v/release/venubingi01/sangeetham-api)

An unofficial, high-performance API for searching, streaming, and retrieving songs, albums, playlists, and artists from [JioSaavn](https://jiosaavn.com).

## 📚 Documentation

Detailed interactive API documentation is available at `/docs` (via Scalar UI) and OpenAPI schema at `/swagger` when running the application.

## 📰 Changelog

For a detailed list of changes, see the [CHANGELOG](CHANGELOG.md).

## 🔌 Running Locally

### 1. Clone the repository

```sh
git clone https://github.com/venubingi01/sangeetham-api.git
cd sangeetham-api
```

### 2. Choose Run Method

#### Using Docker

```sh
docker-compose up
```

#### Manually with Bun or Node.js

> [!NOTE]
> Requires `Bun (1.0.29+)` or `Node.js (v20+)`

Install dependencies:

```sh
bun install
```

Launch development server:

```sh
bun run dev
```

The server will start at `http://localhost:3000`.

## ☁️ Deploying Your Own Instance

Sangeetham API can be easily deployed to Vercel or Cloudflare Workers.

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/venubingi01/sangeetham-api)

### Cloudflare Workers

[![Deploy with Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/venubingi01/sangeetham-api)

## 📜 License

Distributed under the [MIT License](https://opensource.org/licenses/MIT). See the [LICENSE](LICENSE) file for more information.
