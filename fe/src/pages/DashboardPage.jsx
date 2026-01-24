import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, Spinner } from "../components/ui";
import { formatCurrency, formatRelativeTime } from "../lib/utils";
import api from "../lib/axios";

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalGroups: 0,
    pendingSettlements: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [groupsRes] = await Promise.all([api.get("/groups")]);
      setGroups(groupsRes.data?.slice(0, 4) || []);
      setStats({
        totalBalance: 0,
        totalGroups: groupsRes.data?.length || 0,
        pendingSettlements: 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng số dư</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    stats.totalBalance >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {formatCurrency(stats.totalBalance)}
                </p>
              </div>
              <div
                className={`p-2 rounded-lg ${
                  stats.totalBalance >= 0 ? "bg-emerald-100" : "bg-rose-100"
                }`}
              >
                {stats.totalBalance >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Nhóm đang hoạt động</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.totalGroups}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary-100">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Thanh toán chờ xử lý</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.pendingSettlements}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-secondary-100">
                <Clock className="h-5 w-5 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Groups */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Nhóm gần đây</h2>
          <Link
            to="/groups"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {groups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">
                Chưa có nhóm nào
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Tạo nhóm đầu tiên để bắt đầu theo dõi chi phí chung
              </p>
              <Link to="/groups/create">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  <Plus className="h-4 w-4" />
                  Tạo nhóm đầu tiên
                </button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <Card className="hover:shadow-md transition-all hover:scale-[1.01]">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {group.name?.charAt(0) || "G"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {group.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {group._count?.GroupMember || 0} thành viên
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatRelativeTime(group.updated_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/groups/create">
          <Card className="hover:shadow-md transition-all hover:bg-primary-50 cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <Plus className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Tạo nhóm mới</h3>
                  <p className="text-sm text-slate-500">
                    Bắt đầu nhóm chi phí mới
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/groups/join">
          <Card className="hover:shadow-md transition-all hover:bg-secondary-50 cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary-100 rounded-xl">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Tham gia nhóm
                  </h3>
                  <p className="text-sm text-slate-500">Tham gia bằng mã mời</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export { DashboardPage };
