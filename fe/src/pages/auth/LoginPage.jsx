import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, Card, CardContent } from "../../components/ui";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="mt-2 text-slate-600">Chào mừng bạn trở lại!</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email không hợp lệ",
                  },
                })}
              />

              <div className="relative">
                <Input
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  icon={Lock}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-600">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { LoginPage };
