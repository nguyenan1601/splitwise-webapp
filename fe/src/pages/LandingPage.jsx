import { Link } from "react-router-dom";
import { Split, Users, CreditCard, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "../components/ui";

function LandingPage() {
  const features = [
    {
      icon: Split,
      title: "Chia đều dễ dàng",
      desc: "Chia chi phí đều hoặc theo số tiền tùy chỉnh chỉ với vài thao tác.",
    },
    {
      icon: Users,
      title: "Quản lý nhóm",
      desc: "Tạo nhóm cho chuyến đi, bạn cùng phòng, sự kiện hoặc bất kỳ chi phí chung nào.",
    },
    {
      icon: CreditCard,
      title: "Theo dõi số dư",
      desc: "Xem ai nợ ai và thanh toán bằng một giao dịch duy nhất.",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-cyan-50 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              Chia sẻ chi phí cùng bạn bè,{" "}
              <span className="bg-gradient-to-r from-primary-500 to-cyan-500 bg-clip-text text-transparent">
                Đơn giản hơn bao giờ hết
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Theo dõi chi phí chung, chia hóa đơn và thanh toán nợ với bạn bè,
              bạn cùng phòng và đồng hành du lịch. Không còn những cuộc trò
              chuyện khó xử về tiền bạc.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8">
                  Bắt đầu miễn phí
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8">
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary-600">
                10K+
              </p>
              <p className="mt-1 text-sm text-slate-500">Người dùng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary-600">
                50K+
              </p>
              <p className="mt-1 text-sm text-slate-500">Nhóm đã tạo</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary-600">
                2 tỷ+
              </p>
              <p className="mt-1 text-sm text-slate-500">Chi phí theo dõi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Mọi thứ bạn cần để chia sẻ chi phí
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Đơn giản, nhanh chóng và miễn phí. Bắt đầu theo dõi chi phí chung
              ngay.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative p-8 rounded-2xl bg-slate-50 hover:bg-gradient-to-br hover:from-primary-50 hover:to-cyan-50 transition-all duration-300 group"
              >
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 text-white mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Cách hoạt động</h2>
            <p className="mt-4 text-lg text-slate-300">
              Bắt đầu với 3 bước đơn giản
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tạo nhóm",
                desc: "Tạo nhóm mới và mời bạn bè bằng mã mời độc nhất.",
              },
              {
                step: "02",
                title: "Thêm chi phí",
                desc: "Ghi lại chi phí khi phát sinh. Chia đều hoặc tùy chỉnh số tiền.",
              },
              {
                step: "03",
                title: "Thanh toán",
                desc: "Xem ai nợ ai bao nhiêu và ghi nhận thanh toán để xóa nợ.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 text-2xl font-bold mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-primary-500 to-cyan-500 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
            <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4">
              Sẵn sàng đơn giản hóa việc chia sẻ chi phí?
            </h2>
            <p className="relative text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Tham gia cùng hàng nghìn người dùng đã làm việc chia chi phí trở
              nên dễ dàng.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-slate-50 px-8"
              >
                Bắt đầu miễn phí
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export { LandingPage };
