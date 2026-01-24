import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, Input, Card, CardContent, Spinner } from "../../components/ui";
import api from "../../lib/axios";

function SettlePaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [group, setGroup] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    loadGroup();
  }, [id]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${id}`);
      setGroup(response.data);
    } catch (error) {
      console.error("Failed to load group:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      await api.post(`/groups/${id}/settlements`, {
        senderId: data.from,
        receiverId: data.to,
        amount: parseFloat(data.amount),
        note: data.note,
      });

      navigate(`/groups/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const currencySymbol =
    group?.currency === "VND" ? "₫" : group?.currency === "USD" ? "$" : "€";

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
        <h1 className="text-2xl font-bold text-slate-900">
          Ghi nhận thanh toán
        </h1>
        <p className="text-slate-600">{group?.name}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm">
                {error}
              </div>
            )}

            {/* From / To */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Người trả
                </label>
                <select
                  {...register("from", { required: "Bắt buộc" })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Chọn...</option>
                  {group?.GroupMember?.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.profiles?.name || member.temp_name || "Unknown"}
                    </option>
                  ))}
                </select>
              </div>

              <ArrowRight className="h-5 w-5 text-slate-400 mt-6" />

              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Người nhận
                </label>
                <select
                  {...register("to", { required: "Bắt buộc" })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Chọn...</option>
                  {group?.GroupMember?.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.profiles?.name || member.temp_name || "Unknown"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Số tiền
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  placeholder="0"
                  {...register("amount", {
                    required: "Vui lòng nhập số tiền",
                    min: { value: 1, message: "Số tiền phải lớn hơn 0" },
                  })}
                  className="w-full pl-10 pr-4 py-3 text-xl font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {errors.amount && (
                <p className="mt-1.5 text-sm text-rose-500">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Note */}
            <Input
              label="Ghi chú"
              placeholder="VD: Chuyển khoản, Tiền mặt..."
              {...register("note")}
            />

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Ghi nhận"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { SettlePaymentPage };
