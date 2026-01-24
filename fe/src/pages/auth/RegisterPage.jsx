import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, Card, CardContent } from "../../components/ui";

function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      await registerUser(data.email, data.password, data.name);
      navigate("/dashboard");
    } catch (err) {
      if (err.message?.includes("already registered")) {
        setError("Email này đã được đăng ký");
      } else {
        setError(err.message || "Đã xảy ra lỗi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Đăng ký</h1>
          <p className="mt-2 text-slate-600">Tạo tài khoản mới để bắt đầu</p>
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
                label="Họ và tên"
                type="text"
                icon={User}
                placeholder="Nguyễn Văn A"
                error={errors.name?.message}
                {...register("name", {
                  required: "Vui lòng nhập tên",
                  minLength: {
                    value: 2,
                    message: "Tên phải có ít nhất 2 ký tự",
                  },
                })}
              />

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

              <Input
                label="Xác nhận mật khẩu"
                type={showPassword ? "text" : "password"}
                icon={Lock}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Vui lòng xác nhận mật khẩu",
                  validate: (value) =>
                    value === password || "Mật khẩu không khớp",
                })}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { RegisterPage };
