import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | QuickLinks",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
      <section>
        <h1 className="mb-4 text-3xl font-bold">
          QuickLinks プライバシーポリシー
        </h1>
        <p className="text-sm text-muted-foreground">最終更新日: 2025-12-03</p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed">
        <p>
          本プライバシーポリシーは、個人開発サービス「QuickLinks」（以下「本サービス」）における、
          ユーザーの情報の取り扱いについて定めるものです。
        </p>

        <h2 className="mt-6 text-xl font-semibold">1. 取得する情報</h2>
        <p>
          本サービスでは、ユーザーが拡張機能や Web
          アプリを利用する際に、主に次の情報を取得・保存します。
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            拡張機能から保存されたリンク情報（URL、タイトル、ドメイン名、任意のメモ等）
          </li>
          <li>保存操作を行ったページの URL</li>
          <li>認証のためのユーザー識別子（Clerk によるユーザーID）</li>
          <li>
            認証トークンおよび API 設定（ブラウザ拡張内の chrome.storage
            に保存）
          </li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">2. 情報の利用目的</h2>
        <p>取得した情報は、次の目的のためにのみ利用します。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            ユーザーが保存したリンクを Web
            ダッシュボード上で一覧・閲覧できるようにするため
          </li>
          <li>
            リンクのドメインや OGP 情報を表示し、あとから見返しやすくするため
          </li>
          <li>
            不具合調査やサービス改善のための統計的な分析（個人を特定しない範囲）
          </li>
        </ul>
        <p>
          取得した情報を、広告配信や追跡を目的として第三者に提供することはありません。
        </p>

        <h2 className="mt-6 text-xl font-semibold">3. 保存先と保存期間</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            保存されたリンク情報は、開発者が管理するデータベース（Supabase /
            Postgres）に保存されます。
          </li>
          <li>
            認証トークンや API 設定は、ブラウザ拡張の chrome.storage
            に保存され、一定期間経過後やログアウト時に削除されます。
          </li>
          <li>
            ユーザーは、将来提供予定の機能を通じて、自身のリンクデータを削除できるようになる予定です。
          </li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">4. 第三者提供について</h2>
        <p>次の場合を除き、取得した情報を第三者に提供することはありません。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>法令に基づく場合</li>
          <li>
            不正アクセスや不正利用などの調査のため、必要な範囲で外部サービス事業者と共有する場合
          </li>
        </ul>

        <h2 className="mt-6 text-xl font-semibold">5. 外部サービスの利用</h2>
        <p>本サービスでは、次の外部サービスを利用しています。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>認証: Clerk（ユーザーのログインおよびユーザー識別のため）</li>
          <li>
            ホスティング / API / データベース: Vercel, Railway, Supabase /
            Postgres
          </li>
        </ul>
        <p>
          各サービスにおけるデータ取り扱いについては、各サービス提供者のプライバシーポリシーもご確認ください。
        </p>

        <h2 className="mt-6 text-xl font-semibold">
          6. ユーザーからのお問い合わせ
        </h2>
        <p>
          本サービスおよび本ポリシーに関するお問い合わせは、開発者の連絡先（
          <a
            href="https://github.com/lvncer"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-500"
          >
            GitHubプロフィール
          </a>
          、
          <a
            href="https://x.com/kihhi_"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-500"
          >
            Twitter
          </a>
          、または
          <a
            href="mailto:negimasa58@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-500"
          >
            メール
          </a>
          までご連絡ください。
        </p>

        <h2 className="mt-6 text-xl font-semibold">
          7. プライバシーポリシーの変更
        </h2>
        <p>
          本ポリシーの内容は、必要に応じて変更されることがあります。重要な変更がある場合は、本サービスの
          Web サイト等でお知らせします。
        </p>
      </section>
    </main>
  );
}
