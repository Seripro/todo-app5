# Todo App

React と Hono、PostgreSQL で構成されたシンプルなTodoアプリケーションです。
Todoの追加、完了状態の切り替え、削除ができます。

## 技術スタック

- React
- Hono
- PostgreSQL
- Docker/docker-compose

## 起動方法

プロジェクトのルートディレクトリで実行します。

```bash
docker compose up
```

ブラウザで次のURLを開きます。

- フロントエンド: http://localhost:5173
- API: http://localhost:3000
- PostgreSQL: `localhost:5432`

バックグラウンドで起動する場合は、次を実行します。

```bash
docker compose up -d
```

ログを確認する場合は、次を実行します。

```bash
docker compose logs -f
```

## 停止方法

コンテナを停止します。

```bash
docker compose down
```

コンテナとPostgreSQLの永続ボリュームを削除して、データを初期化する場合は次を実行します。

```bash
docker compose down -v
```

## API

ベースURLは `http://localhost:3000` です。

| メソッド | パス             | 説明                 |
| -------- | ---------------- | -------------------- |
| `GET`    | `/api/todos`     | Todo一覧を取得       |
| `POST`   | `/api/todos`     | Todoを追加           |
| `PATCH`  | `/api/todos/:id` | Todoの完了状態を更新 |
| `DELETE` | `/api/todos/:id` | Todoを削除           |

### Todoの追加

```bash
curl -X POST http://localhost:3000/api/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"READMEを確認する"}'
```

### 完了状態の更新

```bash
curl -X PATCH http://localhost:3000/api/todos/1 \
  -H 'Content-Type: application/json' \
  -d '{"completed":true}'
```

### Todoの削除

```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

## ディレクトリ構成

```text
.
├── backend/         # APIサーバーとPrisma関連ファイル
├── frontend/        # Reactアプリケーション
└── docker-compose.yml
```

## ローカル開発

Docker Composeを使わずに個別起動する場合は、PostgreSQLを用意したうえで、各ディレクトリで依存関係をインストールします。

```bash
cd backend
npm install
npm run dev
```

別のターミナルでフロントエンドを起動します。

```bash
cd frontend
npm install
npm run dev
```

ローカル起動時のAPI接続先は、フロントエンドの `src/App.tsx` に定義されています。

## Prismaコマンド

Prismaの設定ファイルは `backend/prisma.config.ts`、データモデルは `backend/src/prisma/contract.prisma` です。
Docker Composeで起動中の場合は、ルートディレクトリから次のコマンドを実行します。

```bash
# contract.prismaからcontract.jsonとcontract.d.tsを生成
npx prisma contract emit

# データベースにテーブルを作成
npx prisma db init

# マイグレーションの状態を確認
npx prisma migration status
```

スキーマを変更した場合は、`contract emit` を実行して生成ファイルを更新したあと、必要に応じて `db init` を実行してください。
