import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Search, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Spinner,
  Modal,
} from "../../components/ui";
import { formatRelativeTime } from "../../lib/utils";
import api from "../../lib/axios";

function GroupsPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get("/groups");
      setGroups(response.data || []);
    } catch (error) {
      console.error("Failed to load groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) return;

    try {
      setJoining(true);
      await api.post("/groups/join", { inviteCode: inviteCode.trim() });
      setShowJoinModal(false);
      setInviteCode("");
      loadGroups();
    } catch (error) {
      console.error("Failed to join group:", error);
    } finally {
      setJoining(false);
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhóm của bạn</h1>
          <p className="text-slate-600">{groups.length} nhóm</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoinModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Tham gia nhóm
          </Button>
          <Link to="/groups/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo nhóm
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm nhóm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Chưa có nhóm nào
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Tạo nhóm mới hoặc tham gia nhóm để bắt đầu chia sẻ chi phí
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/groups/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo nhóm đầu tiên
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowJoinModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Tham gia nhóm
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <Link key={group.id} to={`/groups/${group.id}`}>
              <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                {/* Cover Image or Gradient */}
                <div className="h-24 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-t-xl relative overflow-hidden">
                  {group.cover_image && (
                    <img
                      src={group.cover_image}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-3 left-4">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur rounded text-xs font-medium text-slate-700">
                      {group.currency}
                    </span>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-slate-900 truncate text-lg">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group._count?.GroupMember || 0}
                    </span>
                    <span>{formatRelativeTime(group.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Join Group Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Tham gia nhóm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">Nhập mã mời để tham gia nhóm có sẵn</p>
          <Input
            label="Mã mời"
            placeholder="Nhập mã mời"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="text-center text-2xl tracking-widest font-mono"
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowJoinModal(false)}
            >
              Hủy
            </Button>
            <Button
              className="flex-1"
              onClick={handleJoinGroup}
              disabled={!inviteCode.trim() || joining}
            >
              {joining ? "Đang xử lý..." : "Tham gia"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export { GroupsPage };
