# GCP セットアップメモ

## Firebase Projectを作る

* デフォルトの GCP リソース ロケーション
* アプリの登録
* Authentication 匿名有効化
* Firestore 有効化

## functions 変数設定
```
firebase functions:config:set recaptcha.secret_code="(secret code)" schedule.tz="Asia/Tokyo" schedule.daily="31 3 * * *"
```

## IAM

〜@cloudbuild.gserviceaccount.com

* Cloud Scheduler 管理者


## Secret Manager APIを有効化

* app-env-tsを作成

## Firebase Buildコンテナ作成
https://cloud.google.com/cloud-build/docs/deploying-builds/deploy-firebase?hl=ja

## Cloud Build APIを有効化
* リポジトリの接続
* サービス アカウント権限
  * Cloud Functions 開発者
  * Secret Manager のシークレット アクセサー
  * Firebase 管理者


## CORS設定
https://firebase.google.com/docs/storage/web/download-files?hl=ja

## Storageライフサイクル設定
