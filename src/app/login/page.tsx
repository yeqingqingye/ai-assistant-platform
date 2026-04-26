"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";
import { Sparkles, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Register
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          toast.success("注册成功！请登录");
          setIsRegistering(false);
        } else {
          const data = await res.json();
          toast.error(data.error || "注册失败");
        }
      } else {
        // Login
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("登录失败：邮箱或密码错误");
        } else {
          toast.success("登录成功！");
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch {
      toast.error("操作失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI助手平台
          </h1>
          <p className="text-gray-500 mt-2">智能写作 · 文档问答 · 代码审查</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-900">
              {isRegistering ? "创建账号" : "欢迎回来"}
            </h2>

            {isRegistering && (
              <Input
                label="姓名"
                type="text"
                placeholder="请输入您的姓名"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-[38px] w-5 h-5 text-gray-400" />
              <Input
                label="邮箱"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-[38px] w-5 h-5 text-gray-400" />
              <Input
                label="密码"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="pl-10"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {isRegistering ? "注册" : "登录"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-500">
                {isRegistering ? "已有账号？" : "还没有账号？"}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setFormData({ email: "", password: "", name: "" });
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isRegistering ? "立即登录" : "立即注册"}
              </button>
            </div>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
