"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardGrid } from "@/components/ui/Card"
import { 
  PenTool, 
  FileText, 
  Code2, 
  Sparkles,
  ArrowRight
} from "lucide-react"

const features = [
  {
    title: "AI写作助手",
    description: "智能生成博客文章、邮件、社交媒体内容等各类文本",
    icon: PenTool,
    href: "/writing",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "智能文档问答",
    description: "上传文档，让AI帮你快速理解和回答文档内容",
    icon: FileText,
    href: "/documents",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "AI代码审查",
    description: "自动检查代码质量，提供优化建议和改进方案",
    icon: Code2,
    href: "/code-review",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              欢迎回来，{session.user?.name || session.user?.email}
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl">
            选择下方任一AI工具开始您的工作。我们的智能助手将帮助您提高效率，创造价值。
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">AI工具箱</h2>
        <CardGrid>
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.href} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-start space-x-4">
                    <div className={`${feature.bgColor} p-3 rounded-xl`}>
                      <Icon className={`w-6 h-6 bg-gradient-to-br ${feature.color} text-white rounded-lg p-1`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-500 mt-1 text-sm">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-blue-600 mt-4 text-sm font-medium">
                        <span>开始使用</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </CardGrid>

        {/* Quick Tips */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">使用提示</h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">清晰的提示词</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    向AI描述您的需求时，请尽量详细和具体，这样能得到更好的结果。
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">迭代优化</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    不要期望一次就得到完美结果，根据输出调整您的提示词，逐步优化。
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">保存重要内容</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    AI生成的内容会自动保存到您的历史记录中，随时查看和使用。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
