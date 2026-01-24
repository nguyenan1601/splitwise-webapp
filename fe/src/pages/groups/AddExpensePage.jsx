import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button, Input, Card, CardContent, Spinner } from "../../components/ui";
import { cn } from "../../lib/utils";
import api from "../../lib/axios";

const categories = [
  { id: "general", name: "Chung" },
  { id: "food", name: "Ăn uống" },
  { id: "transport", name: "Di chuyển" },
  { id: "accommodation", name: "Lưu trú" },
  { id: "entertainment", name: "Giải trí" },
  { id: "shopping", name: "Mua sắm" },
  { id: "utilities", name: "Tiện ích" },
  { id: "other", name: "Khác" },
];

function AddExpensePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [group, setGroup] = useState(null);
  const [splitType, setSplitType] = useState("equal");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "general",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const amount = watch("amount");

  useEffect(() => {
    loadGroup();
  }, [id]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${id}`);
      setGroup(response.data);
      const allMemberIds = response.data.GroupMember?.map((m) => m.id) || [];
      setSelectedMembers(allMemberIds);
    } catch (error) {
      console.error("Failed to load group:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const onSubmit = async (data) => {
    if (selectedMembers.length === 0) {
      setError("Vui lòng chọn ít nhất một thành viên để chia");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const splits = selectedMembers.map((memberId) => ({
        memberId,
        amount: parseFloat(data.amount) / selectedMembers.length,
      }));

      await api.post(`/groups/${id}/expenses`, {
        description: data.description,
        amount: parseFloat(data.amount),
        category: data.category,
        date: data.date,
        payerId: data.paidBy,
        splits,
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

  const splitAmount =
    amount && selectedMembers.length > 0
      ? (parseFloat(amount) / selectedMembers.length).toFixed(0)
      : 0;

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
        <h1 className="text-2xl font-bold text-slate-900">Thêm chi phí</h1>
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

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Số tiền
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  placeholder="0"
                  {...register("amount", {
                    required: "Vui lòng nhập số tiền",
                    min: { value: 1, message: "Số tiền phải lớn hơn 0" },
                  })}
                  className="w-full pl-12 pr-4 py-4 text-3xl font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {errors.amount && (
                <p className="mt-1.5 text-sm text-rose-500">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Description */}
            <Input
              label="Mô tả"
              placeholder="VD: Cơm trưa, Taxi..."
              error={errors.description?.message}
              {...register("description", {
                required: "Vui lòng nhập mô tả",
              })}
            />

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Danh mục
              </label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="cursor-pointer">
                    <input
                      type="radio"
                      value={cat.id}
                      {...register("category")}
                      className="sr-only peer"
                    />
                    <div className="p-2 text-center text-xs rounded-lg border border-slate-200 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-600 transition-colors">
                      {cat.name}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Ngày
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  {...register("date")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Người trả
              </label>
              <select
                {...register("paidBy", { required: "Vui lòng chọn người trả" })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Chọn...</option>
                {group?.GroupMember?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.profiles?.name || member.temp_name || "Unknown"}
                  </option>
                ))}
              </select>
              {errors.paidBy && (
                <p className="mt-1.5 text-sm text-rose-500">
                  {errors.paidBy.message}
                </p>
              )}
            </div>

            {/* Split Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cách chia
              </label>
              <div className="flex gap-2">
                {[
                  { id: "equal", name: "Chia đều" },
                  { id: "unequal", name: "Không đều" },
                  { id: "percentage", name: "Phần trăm" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSplitType(type.id)}
                    className={cn(
                      "flex-1 py-2 px-3 text-sm rounded-lg border transition-colors",
                      splitType === type.id
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Split With */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Chia cho
              </label>
              <div className="space-y-2">
                {group?.GroupMember?.map((member) => (
                  <label
                    key={member.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedMembers.includes(member.id)
                        ? "border-primary-500 bg-primary-50"
                        : "border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="font-medium text-slate-900">
                        {member.profiles?.name || member.temp_name || "Unknown"}
                      </span>
                    </div>
                    {selectedMembers.includes(member.id) &&
                      splitType === "equal" && (
                        <span className="text-sm text-primary-600 font-medium">
                          {currencySymbol}
                          {splitAmount}
                        </span>
                      )}
                  </label>
                ))}
              </div>
            </div>

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
                {submitting ? "Đang lưu..." : "Thêm chi phí"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { AddExpensePage };
