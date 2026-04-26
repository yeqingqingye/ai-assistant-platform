"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Card } from "@/components/ui/Card"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"
import { 
  FileText, 
  Loader2, 
  Trash2, 
  Plus,
  Send
} from "lucide-react"

interface DocumentQA {
  id: string
  question: string
  answer: string
  createdAt: string
}

interface Document {
  id: string
  title: string
  content: string
  fileType: string
  createdAt: string
  qas: DocumentQA[]
}

export default function DocumentsPage() {
  const { data: session, status } = useSession()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [showNewDocForm, setShowNewDocForm] = useState(false)
  const [newDocForm, setNewDocForm] = useState({ title: "", content: "" })
  const [question, setQuestion] = useState("")
  const [isAsking, setIsAsking] = useState(false)

  useEffect(() => {
    if (session) {
      fetchDocuments()
    }
  }, [session])

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/ai/document")
      if (res.ok) {
        const data = await res.json()
        setDocuments(data)
      }
    } catch {
      toast.error("获取文档列表失败")
    }
  }

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDocForm.title.trim() || !newDocForm.content.trim()) {
      toast.error("请填写标题和内容")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/ai/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDocForm.title,
          content: newDocForm.content,
          fileType: "txt",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("文档创建成功")
        setDocuments([data, ...documents])
        setSelectedDoc(data)
        setNewDocForm({ title: "", content: "" })
        setShowNewDocForm(false)
      } else {
        toast.error("创建失败")
      }
    } catch {
      toast.error("创建失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoc || !question.trim()) return

    setIsAsking(true)
    try {
      const res = await fetch("/api/ai/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          question: question,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("回答生成成功")
        // Update the selected doc with new QA
        const updatedDoc = {
          ...selectedDoc,
          qas: [data, ...selectedDoc.qas],
        }
        setSelectedDoc(updatedDoc)
        setDocuments(documents.map(d => d.id === updatedDoc.id ? updatedDoc : d))
        setQuestion("")
      } else {
        toast.error("获取回答失败")
      }
    } catch {
      toast.error("获取回答失败")
    } finally {
      setIsAsking(false)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("确定要删除这个文档吗？所有问答记录也会被删除。")) return

    try {
      const res = await fetch(`/api/ai/document?id=${docId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("删除成功")
        setSelectedDoc(null)
        setDocuments(documents.filter(d => d.id !== docId))
      } else {
        toast.error("删除失败")
      }
    } catch {
      toast.error("删除失败")
    }
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">智能文档问答</h1>
                <p className="text-sm text-gray-500">上传文档，让AI帮你解答问题</p>
              </div>
            </div>
            <Button onClick={() => setShowNewDocForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新建文档
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Document List */}
          <div className="lg:col-span-1">
            <Card title="我的文档">
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {documents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无文档</p>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDoc?.id === doc.id
                          ? "bg-green-50 border border-green-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(doc.createdAt)} · {doc.qas.length} 个问答
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDocument(doc.id)
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Document Content & Q&A */}
          <div className="lg:col-span-2 space-y-6">
            {showNewDocForm ? (
              <Card title="新建文档">
                <form onSubmit={handleCreateDocument} className="space-y-4">
                  <Input
                    label="文档标题"
                    placeholder="输入文档标题"
                    value={newDocForm.title}
                    onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                    required
                  />
                  <Textarea
                    label="文档内容"
                    placeholder="粘贴或输入文档内容..."
                    value={newDocForm.content}
                    onChange={(e) => setNewDocForm({ ...newDocForm, content: e.target.value })}
                    rows={10}
                    required
                  />
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowNewDocForm(false)}
                    >
                      取消
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                      创建文档
                    </Button>
                  </div>
                </form>
              </Card>
            ) : selectedDoc ? (
              <>
                {/* Document Content */}
                <Card 
                  title={selectedDoc.title}
                  action={
                    <button
                      onClick={() => handleDeleteDocument(selectedDoc.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  }
                >
                  <div className="max-h-64 overflow-y-auto">
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                      {selectedDoc.content}
                    </p>
                  </div>
                </Card>

                {/* Q&A Section */}
                <Card title="智能问答">
                  {/* Question Input */}
                  <form onSubmit={handleAskQuestion} className="mb-6">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="输入你的问题..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        disabled={isAsking}
                      />
                      <Button
                        type="submit"
                        isLoading={isAsking}
                        disabled={!question.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>

                  {/* Q&A History */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedDoc.qas.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">还没有问答记录</p>
                    ) : (
                      selectedDoc.qas.map((qa) => (
                        <div key={qa.id} className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-blue-600 font-medium">Q</span>
                            </div>
                            <p className="text-gray-900 font-medium">{qa.question}</p>
                          </div>
                          <div className="flex items-start space-x-2 ml-8">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-green-600 font-medium">A</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-600 text-sm">{qa.answer}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(qa.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-xl border border-gray-200 border-dashed min-h-[400px]">
                <div className="text-center p-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">选择文档</h3>
                  <p className="text-gray-500">选择一个文档查看内容或开始问答</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
