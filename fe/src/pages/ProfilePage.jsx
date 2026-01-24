import { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, CreditCard, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui";
import api from "../lib/axios";

function ProfilePage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.user_metadata?.name || "",
      phone: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await api.put("/profile", {
        name: data.name,
        phone: data.phone,
      });
      setMessage("Cập nhật thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hồ sơ</h1>
        <p className="text-slate-600">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.user_metadata?.name?.charAt(0) ||
                  user?.email?.charAt(0) ||
                  "U"}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                <Camera className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {user?.user_metadata?.name || "Người dùng"}
              </h2>
              <p className="text-slate-500">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {message && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                {message}
              </div>
            )}

            <Input
              label="Họ và tên"
              icon={User}
              error={errors.name?.message}
              {...register("name", { required: "Vui lòng nhập tên" })}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Email không thể thay đổi
              </p>
            </div>

            <Input
              label="Số điện thoại"
              icon={Phone}
              placeholder="+84 xxx xxx xxx"
              {...register("phone")}
            />

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Thông tin thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm mb-4">
            Thêm thông tin thanh toán để người khác biết cách trả tiền cho bạn.
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-dashed border-slate-300 text-center">
              <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Chưa có phương thức thanh toán
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Thêm phương thức
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { ProfilePage };
