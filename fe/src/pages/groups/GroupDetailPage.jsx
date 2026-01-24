import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Copy,
  Check,
  Receipt,
  Scale,
  Activity,
  Users,
  Settings,
} from "lucide-react";
import { Card, CardContent, Button, Spinner } from "../../components/ui";
import { formatCurrency, formatDate } from "../../lib/utils";
import api from "../../lib/axios";

function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [activeTab, setActiveTab] = useState("expenses");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [id]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/expenses`),
        api.get(`/groups/${id}/balances`).catch(() => ({ data: [] })),
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data || []);
      setBalances(balancesRes.data || []);
    } catch (error) {
      console.error("Failed to load group:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group?.invite_code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "expenses", label: "Chi phí", icon: Receipt },
    { id: "balances", label: "Số dư", icon: Scale },
    { id: "activity", label: "Hoạt động", icon: Activity },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Không tìm thấy nhóm</p>
        <Link
          to="/groups"
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Quay lại danh sách nhóm
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/groups")}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
            <p className="text-slate-500">
              {group.GroupMember?.length || 0} thành viên
            </p>
          </div>
        </div>
        <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Invite Code Card */}
      <Card className="bg-gradient-to-r from-primary-50 to-cyan-50 border-primary-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Mã mời nhóm</p>
              <p className="text-2xl font-mono font-bold tracking-wider text-primary-600">
                {group.invite_code}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyInviteCode}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Sao chép
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link to={`/groups/${id}/add-expense`} className="flex-1">
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Thêm chi phí
          </Button>
        </Link>
        <Link to={`/groups/${id}/settle`} className="flex-1">
          <Button variant="secondary" className="w-full">
            Thanh toán
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "expenses" && (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-1">
                  Chưa có chi phí nào
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Thêm chi phí đầu tiên để bắt đầu theo dõi
                </p>
                <Link to={`/groups/${id}/add-expense`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm chi phí
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            expenses.map((expense) => (
              <Card
                key={expense.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Receipt className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {expense.description}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {expense.GroupMember?.profiles?.name ||
                            expense.GroupMember?.temp_name ||
                            "Unknown"}{" "}
                          đã trả
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(expense.amount, group.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "balances" && (
        <div className="space-y-3">
          {group.GroupMember?.map((member) => {
            const memberBalance = balances.find(
              (b) => b.memberId === member.id,
            );
            const balance = memberBalance?.balance || 0;

            return (
              <Card key={member.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {member.profiles?.name ||
                            member.temp_name ||
                            "Unknown"}
                        </p>
                        {member.is_virtual && (
                          <span className="text-xs text-slate-400">
                            Thành viên ảo
                          </span>
                        )}
                      </div>
                    </div>
                    <p
                      className={`font-semibold ${
                        balance > 0
                          ? "text-emerald-600"
                          : balance < 0
                            ? "text-rose-600"
                            : "text-slate-500"
                      }`}
                    >
                      {balance > 0 ? "+" : ""}
                      {formatCurrency(balance, group.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-3">
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nhật ký hoạt động sẽ sớm ra mắt</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export { GroupDetailPage };
