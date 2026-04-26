"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { Card } from "@/components/ui/Card"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"
import { 
  Code2, 
  Loader2, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Lightbulb,
  FileCode,
  Clock,
  Star,
  Copy
} from "lucide-react"

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML/CSS" },
  { value: "shell", label: "Shell/Bash" },
]

interface ReviewItem {
  title?: string
  description?: string
  line?: number
}

interface CodeReview {
  id: string
  title: string
  code: string
  language: string
  reviewResult: string | null
  suggestions: ReviewItem[] | null
  issues: ReviewItem[] | null
  score: number | null
  status: string
  createdAt: string
}

export default function CodeReviewPage() {
  const { data: session, status } = useSession()
  const [reviews, setReviews] = useState<CodeReview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    language: "javascript",
    code: "",
  })

  useEffect(() => {
    if (session) {
      fetchReviews()
    }
  }, [session])

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/ai/code-review")
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch {
      toast.error("获取审查列表失败")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code.trim()) {
      toast.error("请输入代码")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/ai/code-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("代码审查完成！")
        setSelectedReview(data)
        setFormData({ title: "", language: "javascript", code: "" })
        fetchReviews()
      } else {
        toast.error("审查失败，请重试")
      }
    } catch {
      toast.error("审查失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm("确定要删除这个审查记录吗？")) return

    try {
      const res = await fetch(`/api/ai/code-review?id=${reviewId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("删除成功")
        setSelectedReview(null)
        fetchReviews()
      } else {
        toast.error("删除失败")
      }
    } catch {
      toast.error("删除失败")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("已复制到剪贴板")
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Code2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI代码审查</h1>
              <p className="text-sm text-gray-500">智能检查代码质量，提供优化建议</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <Card title="新建代码审查">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="标题"
                  placeholder="输入审查标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <Select
                  label="编程语言"
                  options={languages}
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                />

                <Textarea
                  label="代码"
                  placeholder="粘贴需要审查的代码..."
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={!formData.code.trim()}
                >
                  <Code2 className="w-4 h-4 mr-2" />
                  {isLoading ? "审查中..." : "开始审查"}
                </Button>
              </form>
            </Card>

            {/* History */}
            <Card title="审查历史" className="mt-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无审查记录</p>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      onClick={() => setSelectedReview(review)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedReview?.id === review.id
                          ? "bg-purple-50 border border-purple-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {review.title || "未命名审查"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {languages.find(l => l.value === review.language)?.label} · {formatDate(review.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(review.id)
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {review.status === "processing" && (
                        <div className="flex items-center mt-2 text-purple-600 text-xs">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          审查中...
                        </div>
                      )}
                      {review.score !== null && (
                        <div className={`inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium ${getScoreBg(review.score)} ${getScoreColor(review.score)}`}>
                          <Star className="w-3 h-3 mr-1" />
                          评分: {review.score}/100
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Result */}
          <div className="lg:col-span-2">
            {selectedReview ? (
              <div className="space-y-6">
                {/* Review Header */}
                <Card
                  title={selectedReview.title || "代码审查结果"}
                  action={
                    <div className="flex items-center space-x-2">
                      {selectedReview.score !== null && (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(selectedReview.score)} ${getScoreColor(selectedReview.score)}`}>
                          <Star className="w-4 h-4 mr-1" />
                          {selectedReview.score}/100
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete(selectedReview.id)}
                        className="text-gray-400 hover:text-red-500 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  }
                >
                  <div className="flex items-center space-x-4 text-sm text-gray-500 pb-4 border-b">
                    <span className="flex items-center">
                      <FileCode className="w-4 h-4 mr-1" />
                      {languages.find(l => l.value === selectedReview.language)?.label}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(selectedReview.createdAt)}
                    </span>
                  </div>
                </Card>

                {/* Original Code */}
                <Card title="原始代码">
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(selectedReview.code)}
                      className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      <code>{selectedReview.code}</code>
                    </pre>
                  </div>
                </Card>

                {/* Review Summary */}
                {selectedReview.reviewResult && (
                  <Card title="审查总结">
                    <p className="text-gray-700">{selectedReview.reviewResult}</p>
                  </Card>
                )}

                {/* Issues */}
                {selectedReview.issues && selectedReview.issues.length > 0 && (
                  <Card title={`发现的问题 (${selectedReview.issues.length})`}>
                    <div className="space-y-3">
                      {selectedReview.issues.map((issue, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-900">{issue.title || String(issue)}</p>
                            {issue.description && (
                              <p className="text-sm text-red-700 mt-1">{issue.description}</p>
                            )}
                            {issue.line && (
                              <p className="text-xs text-red-600 mt-1">行: {issue.line}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Suggestions */}
                {selectedReview.suggestions && selectedReview.suggestions.length > 0 && (
                  <Card title={`优化建议 (${selectedReview.suggestions.length})`}>
                    <div className="space-y-3">
                      {selectedReview.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">{suggestion.title || String(suggestion)}</p>
                            {suggestion.description && (
                              <p className="text-sm text-blue-700 mt-1">{suggestion.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* No Issues */}
                {selectedReview.issues && selectedReview.issues.length === 0 && selectedReview.status === "completed" && (
                  <Card>
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">代码质量良好</h3>
                        <p className="text-gray-500 mt-1">没有发现明显问题</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-xl border border-gray-200 border-dashed min-h-[400px]">
                <div className="text-center p-8">
                  <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">开始代码审查</h3>
                  <p className="text-gray-500">在左侧粘贴代码，让AI帮你检查质量和优化</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
