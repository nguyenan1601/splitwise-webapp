import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Image, DollarSign } from "lucide-react";
import { Button, Input, Card, CardContent } from "../../components/ui";
import api from "../../lib/axios";

const currencies = [
  { code: "VND", name: "Đồng Việt Nam", symbol: "₫" },
  { code: "USD", name: "Đô la Mỹ", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
];

function CreateGroupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currency: "VND",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      console.log("Creating group with data:", {
        name: data.name,
        currency: data.currency,
      });
      const response = await api.post("/groups", {
        name: data.name,
        currency: data.currency,
      });
      console.log("Group created successfully:", response.data);
      navigate(`/groups/${response.data.id}`);
    } catch (err) {
      console.error("Create group error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setError(err.response?.data?.message || err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Tạo nhóm mới</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Tên nhóm"
              placeholder="VD: Chuyến đi Đà Lạt, Bạn cùng phòng..."
              error={errors.name?.message}
              {...register("name", {
                required: "Vui lòng nhập tên nhóm",
                minLength: {
                  value: 2,
                  message: "Tên phải có ít nhất 2 ký tự",
                },
              })}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Loại tiền
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select
                  {...register("currency")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Ảnh bìa (tùy chọn)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <Image className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Nhấn để tải lên hoặc kéo thả
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG tối đa 5MB
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo nhóm"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { CreateGroupPage };
