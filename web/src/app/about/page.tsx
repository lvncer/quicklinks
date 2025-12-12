import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Bookmark, LayoutGrid, Zap } from "lucide-react";
import WebHeader from "@/components/layouts/WebHeader";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { ScrollStagger } from "@/components/motion/ScrollStagger";

export const metadata: Metadata = {
  title: "QuickLinks - リンク保存が秒で終わる",
  description:
    "気になった記事を一瞬で保存し、後でまとめて読めるツール。ブラウザ拡張で簡単保存、Web でスッキリ閲覧。",
  openGraph: {
    title: "QuickLinks - リンク保存が秒で終わる",
    description: "気になった記事を一瞬で保存し、後でまとめて読めるツール。",
    images: ["/images/toppage.jpeg"],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WebHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 text-center max-w-5xl mx-auto space-y-8">
          <ScrollReveal
            y={24}
            range={[0.08, 0.58]}
            spring={{ stiffness: 80, damping: 24, mass: 1.2 }}
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                リンク保存が、
                <span className="text-primary block md:inline">
                  秒で終わる。
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                気になった記事を一瞬で保存し、後でまとめて読める。
                <br className="hidden md:inline" />
                あなたの情報収集を加速させるブックマークツール。
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal
            y={18}
            range={[0.14, 0.64]}
            shift={0.1}
            spring={{ stiffness: 80, damping: 24, mass: 1.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="h-12 px-8 text-lg" asChild>
                <Link href="/sign-up">
                  今すぐ始める <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <ScrollStagger
              className="grid md:grid-cols-3 gap-8"
              step={0.09}
              y={18}
              range={[0.1, 0.7]}
              // このセクションは高さが短く、scrollYProgress が 1.0 まで到達しにくいことがあるので
              // offset を早めに終わらせて、opacity が確実に 1 まで上がるようにする
              offset={["start 92%", "start 62%"]}
              spring={{ stiffness: 120, damping: 20, mass: 1 }}
            >
              <Card className="bg-background border-none shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    <Bookmark className="h-6 w-6" />
                  </div>
                  <CardTitle>ブラウザ拡張で保存</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    PCなら右クリック、スマホなら共有メニューから一瞬で保存。
                    もう「後で読む」リストが散らかることはありません。
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    <LayoutGrid className="h-6 w-6" />
                  </div>
                  <CardTitle>Web でまとめて閲覧</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    保存したリンクは美しいカード形式で整理されます。
                    OGP画像やタイトルも自動取得され、視認性も抜群です。
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-background border-none shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle>AI ダイジェスト</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    週次・月次で保存した記事をAIが要約してダイジェストを作成。
                    積読の消化を強力にサポートします。（Coming Soon）
                  </CardDescription>
                </CardContent>
              </Card>
            </ScrollStagger>
          </div>
        </section>

        {/* Demo Images Section */}
        <section className="py-20 px-4 max-w-6xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <ScrollReveal
              className="flex-1"
              y={18}
              range={[0.12, 0.72]}
              spring={{ stiffness: 75, damping: 26, mass: 1.25 }}
            >
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">
                  一瞬で保存、フローを止めない
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  ブラウジング中に気になったら、右クリックして「Save
                  link」を選ぶだけ。
                  ページ遷移も待ち時間もありません。あなたの集中力を途切れさせることなく、
                  興味のある情報をストックできます。
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal
              className="flex-1"
              y={18}
              range={[0.12, 0.72]}
              shift={0.12}
              spring={{ stiffness: 75, damping: 26, mass: 1.25 }}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-border">
                <Image
                  src="/images/extension.jpeg"
                  alt="QuickLinks Extension Demo"
                  fill
                  className="object-cover"
                />
              </div>
            </ScrollReveal>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <ScrollReveal
              className="flex-1"
              y={18}
              range={[0.12, 0.72]}
              spring={{ stiffness: 75, damping: 26, mass: 1.25 }}
            >
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">
                  見やすく整理、すぐに探せる
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  保存したリンクは専用のダッシュボードで一覧表示。
                  自動取得されたアイキャッチ画像やタイトルで、何の記事だったか一目で分かります。
                  デバイスを問わず、どこからでもアクセス可能です。
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal
              className="flex-1"
              y={18}
              range={[0.12, 0.72]}
              shift={0.12}
              spring={{ stiffness: 75, damping: 26, mass: 1.25 }}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-border">
                <Image
                  src="/images/toppage.jpeg"
                  alt="QuickLinks Dashboard Demo"
                  fill
                  className="object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal
              y={18}
              range={[0.1, 0.65]}
              spring={{ stiffness: 75, damping: 26, mass: 1.25 }}
            >
              <h2 className="text-3xl font-bold mb-16">3ステップで始める</h2>
            </ScrollReveal>
            <div className="relative">
              {/* Connector Line (Desktop) - grid の子要素にするとレイアウトが崩れるので外に出す */}
              <div className="hidden md:block pointer-events-none absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />
              <ScrollStagger
                className="grid md:grid-cols-3 gap-8"
                step={0.14}
                y={18}
                range={[0.1, 0.8]}
                spring={{ stiffness: 75, damping: 26, mass: 1.25 }}
              >
                <div className="space-y-4 bg-background/50 p-6 rounded-xl backdrop-blur-sm">
                  <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mx-auto shadow-sm">
                    1
                  </div>
                  <h3 className="text-xl font-bold">拡張機能を導入</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    現状は手動でパッケージ化する必要があります。
                    <Link
                      href="https://github.com/lvncer/quicklinks/blob/main/documents/SETUP_Extension.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      セットアップ手順
                    </Link>
                    <br />
                    Chrome ウェブストア公開は Coming Soon。
                  </p>
                </div>

                <div className="space-y-4 bg-background/50 p-6 rounded-xl backdrop-blur-sm">
                  <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mx-auto shadow-sm">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Web で認証する</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    まずは
                    <Link
                      href="/"
                      className="mx-1 underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      こちら
                    </Link>
                    からサインアップ/サインインして認証を完了します。
                  </p>
                </div>

                <div className="space-y-4 bg-background/50 p-6 rounded-xl backdrop-blur-sm">
                  <div className="w-24 h-24 bg-background border-4 border-primary/20 rounded-full flex items-center justify-center text-3xl font-bold text-primary mx-auto shadow-sm">
                    3
                  </div>
                  <h3 className="text-xl font-bold">保存＆閲覧</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    気になったリンクを拡張機能からサッと保存。保存後は Web
                    の一覧画面から見返せます。
                  </p>
                </div>
              </ScrollStagger>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 text-center">
          <ScrollReveal
            y={24}
            range={[0.08, 0.62]}
            spring={{ stiffness: 75, damping: 26, mass: 1.25 }}
          >
            <div className="max-w-3xl mx-auto space-y-8 p-8 md:p-12 rounded-3xl bg-primary/5 border border-primary/10">
              <h2 className="text-3xl md:text-4xl font-bold">
                あなたの情報収集を、
                <br />
                もっと快適に。
              </h2>
              <p className="text-lg text-muted-foreground">
                QuickLinks で、積読を消化する新しい習慣を始めましょう。
                <br />
                完全無料で利用できます。
              </p>
              <Button
                size="lg"
                className="h-14 px-8 text-lg w-full sm:w-auto"
                asChild
              >
                <Link href="/sign-up">
                  サインアップして使ってみる{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/50 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <span className="text-lg font-bold">QuickLinks</span>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} QuickLinks. All rights reserved.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/sign-in"
              className="hover:text-foreground transition-colors"
            >
              サインイン
            </Link>
            <a
              href="https://github.com/lvncer/quicklinks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
