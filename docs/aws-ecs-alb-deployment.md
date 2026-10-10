# AWS ECS + ALB デプロイ手順（検証用）

この文書は、React/Vite の frontend、Hono の backend、PostgreSQL を使うこの Todo アプリを、AWS ECS Fargate と Application Load Balancer（ALB）で検証用に公開する手順です。

## 1. 最終構成

```text
Internet
   |
   v
ALB :80
   |-- /api/* ------> backend Target Group :3000
   |                    |
   |                    `-- backend コンテナ :3000
   |                        db コンテナ :5432
   |
   `-- その他 --------> frontend Target Group :5173
                        |
                        `-- frontend コンテナ :5173
```

ECS Service は2つ作ります。

| Service                      | Task Definition | コンテナ     |      ポート |
| ---------------------------- | --------------- | ------------ | ----------: |
| `todo-app5-frontend-service` | frontend 用     | frontend     |        5173 |
| `todo-app5-backend-service`  | backend 用      | backend + db | 3000 / 5432 |

backend と db は同じ ECS タスクに入れるため、backend から PostgreSQL へは `localhost` で接続します。

```text
DATABASE_URL=postgresql://user:password@localhost:5432/mydatabase
```

### 検証用構成の注意

- frontend は Vite の開発サーバーで動作する
- backend は `tsx watch` で動作する
- PostgreSQL は ECS タスク内のコンテナで動作する
- タスクが再起動・再作成されると PostgreSQL のデータは失われる
- ECS のタスクは `linux/amd64` で動作させる
- 本番運用では frontend の静的配信、backend の production 起動、RDS PostgreSQL への移行を推奨する

## 2. 前提

- AWS アカウント
- AWS コンソールへログインできること
- Docker Desktop
- AWS CLI
- このリポジトリをローカルに取得済みであること
- AWS リージョン（例: `ap-northeast-1`）

以下の値は例です。自分の環境に合わせて置き換えてください。

```text
AWS_REGION=ap-northeast-1
AWS_ACCOUNT_ID=318948072420
ECR_PREFIX=318948072420.dkr.ecr.ap-northeast-1.amazonaws.com/sandbox
CLUSTER=todo-app5-cluster
ALB=todo-app5-alb
```

AWS コンソールのリージョン、ECR、ECS、ALB、VPC はすべて同じリージョンに揃えます。

## 3. ECR リポジトリを作成

AWS コンソールで **ECR → リポジトリ → リポジトリを作成**を開き、次の2つを作成します。

```text
sandbox/todo-app5-frontend
sandbox/todo-app5-backend
```

リポジトリ名は、Docker image の push 先と完全に一致させます。

## 4. Apple Silicon から ECR へ image を push

Mac が Apple Silicon（arm64）の場合、通常の `docker build` では ECS の `linux/amd64` と合わず、次のエラーになります。

```text
CannotPullContainerError:
image Manifest does not contain descriptor matching platform 'linux/amd64'
```

必ず `--platform linux/amd64` を付けて build と push を行います。

### 4.1 ECR にログイン

```bash
aws ecr get-login-password --region ap-northeast-1 \
  | docker login \
      --username AWS \
      --password-stdin 318948072420.dkr.ecr.ap-northeast-1.amazonaws.com
```

### 4.2 frontend を push

リポジトリのルートで実行します。

```bash
docker buildx build \
  --platform linux/amd64 \
  --no-cache \
  --pull \
  -t 318948072420.dkr.ecr.ap-northeast-1.amazonaws.com/sandbox/todo-app5-frontend:v1 \
  --push \
  ./frontend
```

### 4.3 backend を push

```bash
docker buildx build \
  --platform linux/amd64 \
  --no-cache \
  --pull \
  -t 318948072420.dkr.ecr.ap-northeast-1.amazonaws.com/sandbox/todo-app5-backend:v1 \
  --push \
  ./backend
```

`latest` の上書きより、`v1`、`v2` のようなタグを付けてタスク定義から明示的に参照する方が、更新漏れを防げます。

### 4.4 platform を確認

```bash
docker buildx imagetools inspect \
  318948072420.dkr.ecr.ap-northeast-1.amazonaws.com/sandbox/todo-app5-frontend:v1

docker buildx imagetools inspect \
  318948072420.dkr.ecr.ap-northeast-1.amazonaws.com/sandbox/todo-app5-backend:v1
```

両方に `linux/amd64` が表示されることを確認します。

## 5. Security Group を作成

### 5.1 ALB 用 Security Group

名前の例:

```text
todo-app5-alb-sg
```

Inbound rule:

| Type | Port | Source                      |
| ---- | ---: | --------------------------- |
| HTTP |   80 | Anywhere-IPv4 (`0.0.0.0/0`) |

Outbound は検証用として全許可にします。

### 5.2 ECS 用 Security Group

名前の例:

```text
todo-app5-ecs-sg
```

Inbound rule の Source は、CIDR ではなく **ALB の Security Group** を指定します。

| Type       | Port | Source             |
| ---------- | ---: | ------------------ |
| Custom TCP | 5173 | `todo-app5-alb-sg` |
| Custom TCP | 3000 | `todo-app5-alb-sg` |

`5432` は ALB から接続しないため、ECS 用 Security Group に不要です。backend と db は同一タスク内で `localhost:5432` を使います。

Outbound は検証用として全許可にします。

## 6. ECS クラスターを作成

AWS コンソールで **ECS → クラスター → 作成**を開きます。

```text
クラスター名: todo-app5-cluster
インフラストラクチャ: AWS Fargate
```

## 7. Target Group を作成

**EC2 → ターゲットグループ → ターゲットグループの作成**を開きます。

ターゲットは ECS Service が自動登録するため、この段階で手動登録しません。

### 7.1 frontend Target Group

```text
ターゲットタイプ: IP addresses
名前: todo-app5-frontend-tg
プロトコル: HTTP
ポート: 5173
VPC: ECS で使用する VPC
ヘルスチェックプロトコル: HTTP
ヘルスチェックパス: /
```

### 7.2 backend Target Group

```text
ターゲットタイプ: IP addresses
名前: todo-app5-backend-tg
プロトコル: HTTP
ポート: 3000
VPC: ECS で使用する VPC
ヘルスチェックプロトコル: HTTP
ヘルスチェックパス: /
```

backend の `/` は現在 `Hello Hono!` を返すため、ヘルスチェックパス `/` で HTTP 200 になります。

## 8. ALB を作成

**EC2 → ロードバランサー → ロードバランサーの作成 → Application Load Balancer**を開きます。

### 8.1 基本設定

```text
名前: todo-app5-alb
スキーム: Internet-facing
IP アドレスタイプ: IPv4
```

### 8.2 ネットワークマッピング

ECS で使う VPC を選び、異なる Availability Zone の Public Subnet を2つ選びます。

例:

```text
ap-northeast-1a: Public Subnet
ap-northeast-1c: Public Subnet
```

後で ECS Service に選ぶサブネットは、ALB が有効化されている AZ と揃えます。異なる AZ のサブネットでタスクを起動すると、Target Group に次の状態が表示されます。

```text
Target is in an Availability Zone that is not enabled for the load balancer
```

### 8.3 Security Group と Listener

```text
Security Group: todo-app5-alb-sg
Listener: HTTP / 80
Default action: todo-app5-frontend-tg へ転送
```

ALB の作成時に Default action が設定できない場合は、作成後に `HTTP:80` リスナーのデフォルトアクションを編集します。

### 8.4 `/api/*` ルール

ALB 作成後、**リスナーとルール → HTTP:80 → ルールを追加**で次を設定します。

```text
優先度: 1
条件: パスが /api/*
アクション: todo-app5-backend-tg へ転送
```

最終状態:

```text
優先度 1: /api/* → todo-app5-backend-tg
Default: その他 → todo-app5-frontend-tg
```

## 9. backend 用タスク定義を作成

**ECS → タスク定義 → 新しいタスク定義を作成**を開きます。

### 9.1 基本設定

```text
タスク定義ファミリー: todo-app5-backend
起動タイプ: Fargate
CPU: 0.5 vCPU
メモリ: 1 GB
```

タスク実行ロールがなければ、ECS の案内に従って新規作成します。ECR から image を pull し、CloudWatch Logs を使う権限が必要です。

### 9.2 backend コンテナ

```text
コンテナ名: backend
イメージ: 318948072420.dkr.ecr.ap-northeast-1.amazonaws.com/sandbox/todo-app5-backend:v1
コンテナポート: 3000
アプリケーションプロトコル: HTTP
必須コンテナ: 有効
```

環境変数:

```text
DATABASE_URL=postgresql://user:password@localhost:5432/mydatabase
FRONTEND_URL=http://<ALBのDNS名>
```

### 9.3 db コンテナ

同じタスク定義にコンテナを追加します。

```text
コンテナ名: db
イメージ: postgres:16-alpine
コンテナポート: 5432
アプリケーションプロトコル: None
必須コンテナ: 有効
```

環境変数:

```text
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=mydatabase
```

`db` コンテナは ALB の Target Group に登録しません。

### 9.4 db の Health check

db コンテナの Health check に次を設定します。

```text
コマンド形式: CMD-SHELL
コマンド: pg_isready -U user -d mydatabase
```

例:

```text
Interval: 30 seconds
Timeout: 5 seconds
Retries: 3
Start period: 10 seconds
```

backend コンテナの依存関係で、`db` が `HEALTHY` になってから backend を起動するようにします。

## 10. frontend 用タスク定義を作成

```text
タスク定義ファミリー: todo-app5-frontend
起動タイプ: Fargate
CPU: 0.25 vCPU
メモリ: 0.5 GB
```

frontend コンテナ:

```text
コンテナ名: frontend
イメージ: 318948072420.dkr.ecr.ap-northeast-1.amazonaws.com/sandbox/todo-app5-frontend:v1
コンテナポート: 5173
アプリケーションプロトコル: HTTP
必須コンテナ: 有効
```

現在の frontend Dockerfile は `npm run dev -- --host 0.0.0.0` を実行するため、ECS ではポート `5173` を使います。

環境変数:

```text
VITE_API_URL=http://<ALBのDNS名>
__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=<ALBのDNS名>
```

`VITE_API_URL` に `:3000` は付けません。ブラウザは ALB の `80` 番ポートにアクセスし、ALB が `/api/*` を backend の `3000` 番ポートへ転送します。

`__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` には `http://` やポート番号を付けず、ホスト名だけを入力します。

### `.env.production` について

今回の frontend は `npm run dev` で起動するため、`.env.production` の値だけを変更しても、ECS の実行環境変数として設定されるとは限りません。ECS タスク定義の環境変数を正として設定します。

誤った例:

```text
VITE_API_URL=http://<ALBのDNS名>:3000
```

正しい例:

```text
VITE_API_URL=http://<ALBのDNS名>
```

## 11. ECS Service を作成

### 11.1 backend Service

**ECS → クラスター → todo-app5-cluster → サービスを作成**。

```text
タスク定義: todo-app5-backend
サービス名: todo-app5-backend-service
起動タイプ: Fargate
必要数: 1
```

ネットワーク:

```text
VPC: ECS で使う VPC
サブネット: ALB が有効な AZ の Public Subnet
パブリック IP: 検証用として有効
Security Group: todo-app5-ecs-sg
```

ALB が `ap-northeast-1a` と `ap-northeast-1c` で有効なら、ECS もその AZ のサブネットを選びます。`ap-northeast-1d` など、ALB が有効でない AZ は選びません。

ロードバランシング:

```text
ロードバランサー: todo-app5-alb
既存リスナー: HTTP:80
既存ターゲットグループ: todo-app5-backend-tg
コンテナ: backend
コンテナポート: 3000
```

backend Service には frontend Target Group を紐付けません。

### 11.2 frontend Service

同じクラスターでサービスを作成します。

```text
タスク定義: todo-app5-frontend
サービス名: todo-app5-frontend-service
起動タイプ: Fargate
必要数: 1
```

ネットワークは backend と同じ ALB 有効 AZ のサブネットを選びます。

ロードバランシング:

```text
ロードバランサー: todo-app5-alb
既存リスナー: HTTP:80
既存ターゲットグループ: todo-app5-frontend-tg
コンテナ: frontend
コンテナポート: 5173
```

frontend Service には backend Target Group を紐付けません。

## 12. デプロイ後の確認

### 12.1 ECS

両方の Service で次を確認します。

```text
タスク: RUNNING
デプロイ: 完了
```

backend タスク内では `db` が起動した後、backend のログに次が表示されます。

```text
Server is running on http://localhost:3000
```

`contract.emit` と `db.init` が成功していることも確認します。

### 12.2 Target Group

手動で IP を登録する必要はありません。ECS Service が自動登録します。

```text
todo-app5-frontend-tg:
  frontend タスクだけ → healthy

todo-app5-backend-tg:
  backend タスクだけ → healthy
```

`frontend TG に backend がいる`、または `backend TG に frontend がいる`状態なら、各 ECS Service のロードバランシング設定を修正します。

### 12.3 URL

```text
http://<ALBのDNS名>/
```

frontend の画面が表示されます。

```text
http://<ALBのDNS名>/api/todos
```

backend の Todo JSON が表示されます。

`/` で `Hello Hono!` が表示される場合は、ALB の Default action が backend になっています。Default action を frontend Target Group に戻してください。

## 13. 失敗したときの確認順

### image を pull できない

```text
CannotPullContainerError
image Manifest does not contain descriptor matching platform 'linux/amd64'
```

`docker buildx build --platform linux/amd64 --push` で image を作り直し、ECR の image URI を新しいタグにしてタスク定義を更新します。image を push しただけでは、既存のタスク定義は変わりません。

```text
新しい image を push
→ タスク定義の新しいリビジョンを作成
→ Service をそのリビジョンへ更新
```

### `Essential container in task exited`

停止タスクの `Stopped reason` と各コンテナの `Reason`、CloudWatch Logs を確認します。今回の構成では、db が起動する前に backend が起動すると接続に失敗するため、db の Health check と backend の依存関係を確認します。

### `getaddrinfo ENOTFOUND base`

`DATABASE_URL` のホスト名が誤っています。同一タスクの db へ接続する値は次です。

```text
postgresql://user:password@localhost:5432/mydatabase
```

### `Blocked request. This host is not allowed.`

frontend のタスク定義に次を追加し、タスク定義の新リビジョンを作成して Service を更新します。

```text
名前: __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS
値: <現在のALBのDNS名>
```

`http://`、`:80` は付けません。

### Target Group が unhealthy

次を確認します。

1. frontend Target Group は HTTP `5173`、backend Target Group は HTTP `3000` か
2. ECS Service のコンテナとポートが正しいか
3. ECS Security Group が ALB Security Group から `5173` / `3000` を許可しているか
4. Target Group のヘルスチェックパスが `/` か
5. ECS タスクが ALB 有効 AZ のサブネットで起動しているか
6. Target Group の詳細理由が `Request timed out`、`Connection refused`、`HTTP 403` のどれか

### `Target is in an Availability Zone that is not enabled for the load balancer`

ALB のネットワークマッピングにない AZ で ECS タスクが起動しています。ALB の有効 AZ を確認し、frontend/backend Service のサブネットを同じ AZ に変更して再デプロイします。

### `Draining` / `Target deregistration is in progress`

古い ECS タスクの入れ替え中に表示される正常な状態です。新しいタスクが `RUNNING` になり、Target Group で `healthy` になれば、古いターゲットは自動的に解除されます。手動登録は不要です。

## 14. デプロイ後に設定を変更する方法

ECR に新しい image を push しただけでは、ECS の実行中タスクは変わりません。

```text
1. image を新しいタグで push
2. ECS タスク定義の新しいリビジョンを作成
3. image URI、環境変数、ポートなどを更新
4. ECS Service を最新リビジョンへ更新
5. 新しいタスクが healthy になるまで待つ
```

環境変数だけを変更した場合も、タスク定義の新リビジョンと Service 更新が必要です。

## 15. 検証終了後

不要になったら、次の順で停止・削除します。

1. frontend Service の desired count を `0` にする、または Service を削除
2. backend Service の desired count を `0` にする、または Service を削除
3. ALB と Target Group を削除
4. ECS クラスターを削除
5. 不要な ECR image を削除
6. Security Group など不要なリソースを整理

この構成では PostgreSQL のデータを永続化していないため、backend タスクを削除すると Todo データも失われます。
