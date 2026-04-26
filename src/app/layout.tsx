import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/SessionProvider"
import { ToastProvider } from "@/components/ToastProvider"
import { Navbar } from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI助手平台 - 智能写作、文档问答、代码审查",
  description: "一站式AI助手平台，提供智能写作助手、智能文档问答、AI代码审查等功能",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <SessionProvider>
          <ToastProvider />
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
