"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  PenTool,
  Loader2,
  Copy,
  Trash2,
  FileText,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const contentTypes = [
  { value: "blog", label: "博客文章" },
  { value: "email", label: "邮件" },
  { value: "social", label: "社交媒体" },
  { value: "essay", label: "论文/报告" },
  { value: "story", label: "故事/小说" },
  { value: "marketing", label: "营销文案" },
  { value: "technical", label: "技术文档" },
];

const tones = [
  { value: "professional", label: "专业正式" },
  { value: "casual", label: "轻松随意" },
  { value: "friendly", label: "友好亲切" },
  { value: "formal", label: "严肃正式" },
  { value: "humorous", label: "幽默风趣" },
  { value: "persuasive", label: "说服力强" },
];

interface WritingTask {
  id: string;
  title: string;
  contentType: string;
  prompt: string;
  generatedContent: string | null;
  tone: string | null;
  wordCount: number | null;
  status: string;
  createdAt: string;
}

export default function WritingPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<WritingTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WritingTask | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    contentType: "blog",
    prompt: "",
    tone: "professional",
    wordCount: 500,
  });

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/ai/writing");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      toast.error("获取任务列表失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("内容生成成功！");
        setSelectedTask(data);
        setFormData({
          title: "",
          contentType: "blog",
          prompt: "",
          tone: "professional",
          wordCount: 500,
        });
        fetchTasks();
      } else {
        toast.error("生成失败，请重试");
      }
    } catch {
      toast.error("生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("确定要删除这个任务吗？")) return;

    try {
      const res = await fetch(`/api/ai/writing?id=${taskId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("删除成功");
        setSelectedTask(null);
        fetchTasks();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PenTool className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI写作助手</h1>
              <p className="text-sm text-gray-500">智能生成各类文本内容</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <Card title="新建写作任务">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="标题"
                  placeholder="输入任务标题"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />

                <Select
                  label="内容类型"
                  options={contentTypes}
                  value={formData.contentType}
                  onChange={(e) =>
                    setFormData({ ...formData, contentType: e.target.value })
                  }
                />

                <Select
                  label="语气风格"
                  options={tones}
                  value={formData.tone}
                  onChange={(e) =>
                    setFormData({ ...formData, tone: e.target.value })
                  }
                />

                <Input
                  label="目标字数"
                  type="number"
                  placeholder="500"
                  value={formData.wordCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wordCount: parseInt(e.target.value) || 500,
                    })
                  }
                />

                <Textarea
                  label="提示词"
                  placeholder="描述你想要生成的内容..."
                  value={formData.prompt}
                  onChange={(e) =>
                    setFormData({ ...formData, prompt: e.target.value })
                  }
                  rows={5}
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isGenerating}
                  disabled={!formData.prompt}
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  {isGenerating ? "生成中..." : "开始生成"}
                </Button>
              </form>
            </Card>

            {/* History */}
            <Card title="历史记录" className="mt-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无历史记录</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTask?.id === task.id
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {task.title || "未命名任务"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {
                              contentTypes.find(
                                (t) => t.value === task.contentType,
                              )?.label
                            }{" "}
                            · {formatDate(task.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {task.status === "processing" && (
                        <div className="flex items-center mt-2 text-blue-600 text-xs">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          生成中...
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
            {selectedTask ? (
              <Card
                title={selectedTask.title || "生成结果"}
                action={
                  selectedTask.generatedContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(selectedTask.generatedContent!)
                      }
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </Button>
                  )
                }
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 pb-4 border-b">
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {
                        contentTypes.find(
                          (t) => t.value === selectedTask.contentType,
                        )?.label
                      }
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(selectedTask.createdAt)}
                    </span>
                  </div>

                  {selectedTask.status === "processing" ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">
                        AI正在生成内容...
                      </span>
                    </div>
                  ) : selectedTask.generatedContent ? (
                    <div className="prose prose-blue max-w-none">
                      <ReactMarkdown>
                        {selectedTask.generatedContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      暂无生成内容
                    </p>
                  )}
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center bg-white rounded-xl border border-gray-200 border-dashed">
                <div className="text-center p-8">
                  <PenTool className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    开始创作
                  </h3>
                  <p className="text-gray-500">
                    在左侧输入提示词，让AI帮你生成内容
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
