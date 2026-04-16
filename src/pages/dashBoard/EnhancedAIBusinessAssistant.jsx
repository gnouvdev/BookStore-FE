"use client";
import {
  TrendingUp,
  AlertCircle,
  Brain,
  RefreshCw,
  Sparkles,
  PackagePlus,
  Tag,
  Zap,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EnhancedAIBusinessAssistant({
  businessInsights,
  insightsLoading,
  onRefresh,
}) {
  return (
    <section className="relative bg-[#FBEAEB] border-2 border-gray-200/60 rounded-2xl shadow-lg overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-[#2F3C7E] rounded-lg blur-sm opacity-30 animate-pulse"></div>
                <Badge className="relative bg-[#2F3C7E] text-white border-0 px-3 py-1">
                  <Brain className="w-3 h-3 mr-1.5" />
                  <span className="font-semibold uppercase tracking-wide text-xs">
                    AI Business Assistant
                  </span>
                  <span className="ml-2 inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                </Badge>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#2F3C7E]">
              Phân tích nhu cầu & xu hướng khách hàng
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tổng hợp tìm kiếm, lượt xem, wishlist, chatbot và sách trending để
              đề xuất hành động thông minh
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all bg-transparent"
              onClick={onRefresh}
              disabled={insightsLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  insightsLoading ? "animate-spin text-blue-600" : ""
                }`}
              />
              Làm mới
            </Button>
          </div>
        </div>

        {insightsLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="bg-white/60 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-4 animate-pulse space-y-4"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-3 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : businessInsights ? (
          <>
            {businessInsights.topInsights?.length > 0 && (
              <ul className="grid md:grid-cols-2 gap-3">
                {businessInsights.topInsights.map((insight, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-xl p-3 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl">🔥</span>
                    <span className="text-sm text-gray-800 font-medium">
                      {insight}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Xu hướng tìm kiếm
                  </h3>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <ul className="space-y-2">
                  {businessInsights.metrics?.searchTrends
                    ?.slice(0, 5)
                    .map((trend) => (
                      <li
                        key={trend.query}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {trend.query}
                          </p>
                          <p className="text-xs text-gray-500">
                            {trend.count} lượt tìm
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            trend.change >= 0
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {trend.change > 0 ? "+" : ""}
                          {trend.change}%
                        </span>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Nhu cầu nổi bật
                  </h3>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase text-gray-500">Wishlist</p>
                    <ul className="mt-1 space-y-1">
                      {businessInsights.metrics?.wishlistLeaders
                        ?.slice(0, 3)
                        .map((item) => (
                          <li
                            key={item.bookId}
                            className="flex items-center justify-between text-sm text-gray-700"
                          >
                            <span>
                              {item.book?.title || "Sách chưa xác định"}
                            </span>
                            <span className="text-gray-500">
                              {item.count} lượt
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">
                      Chatbot giới thiệu
                    </p>
                    <ul className="mt-1 space-y-1">
                      {businessInsights.metrics?.chatbotHot
                        ?.slice(0, 3)
                        .map((item) => (
                          <li
                            key={item.bookId || item.title}
                            className="flex items-center justify-between text-sm text-gray-700"
                          >
                            <span>
                              {item.book?.title || item.title || "Sách"}
                            </span>
                            <span className="text-gray-500">
                              {item.hits} lần
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Sản phẩm cần chú ý
                  </h3>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <ul className="space-y-2">
                  {businessInsights.metrics?.lowConversion?.length ? (
                    businessInsights.metrics.lowConversion
                      .slice(0, 4)
                      .map((item) => (
                        <li
                          key={item.bookId}
                          className="text-sm text-gray-700 border border-gray-200 rounded-lg p-2"
                        >
                          <p className="font-medium">
                            {item.book?.title || "Sách"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.views} lượt xem · {item.sold} đơn ·{" "}
                            {item.conversion}% chuyển đổi
                          </p>
                        </li>
                      ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      Chưa có dữ liệu chuyển đổi.
                    </p>
                  )}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative bg-[#2F3C7E] rounded-xl p-[2px] overflow-hidden group hover:shadow-2xl transition-all">
                <div className="relative bg-white rounded-xl p-5 h-full backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-[#2F3C7E] rounded-lg">
                      <PackagePlus className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#2F3C7E]">
                      Gợi ý nhập hàng & Highlight
                    </h3>
                  </div>

                  {/* Stock Up Recommendations */}
                  {businessInsights.recommendations?.stockUp?.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <PackagePlus className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Nhập hàng ngay
                        </p>
                      </div>
                      <div className="space-y-3">
                        {businessInsights.recommendations.stockUp.map(
                          (item, idx) => (
                            <div
                              key={`stock-${idx}`}
                              className="px-4 py-3 bg-[#FBEAEB] border-2 border-[#2F3C7E]/30 rounded-lg hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-bold text-blue-700">{item.title}</span>
                                <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
                                  {item.reason}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                <strong>Phân tích:</strong> Sách này đang có nhu cầu cao từ phía khách hàng. 
                                Việc nhập thêm hàng sẽ giúp đáp ứng nhu cầu, tăng doanh thu và giảm tỷ lệ 
                                khách hàng bỏ lỡ cơ hội mua sắm. Nên ưu tiên nhập hàng ngay để không bỏ lỡ 
                                cơ hội kinh doanh.
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Highlight Recommendations */}
                  {businessInsights.recommendations?.highlight?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-purple-600" />
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          Khuyến mãi nổi bật
                        </p>
                      </div>
                      <div className="space-y-3">
                        {businessInsights.recommendations.highlight.map(
                          (item, idx) => (
                            <div
                              key={`highlight-${idx}`}
                              className="px-4 py-3 bg-[#FBEAEB] border-2 border-[#2F3C7E]/30 rounded-lg hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-bold text-purple-700">{item.title}</span>
                                <span className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded-full">
                                  {item.reason}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                <strong>Phân tích:</strong> Sản phẩm này đang được chatbot gợi ý nhiều hoặc 
                                có nhãn trending, cho thấy tiềm năng bán hàng cao. Nên triển khai các chương 
                                trình khuyến mãi như flash sale, giảm giá đặc biệt, hoặc pin banner để tăng 
                                khả năng tiếp cận và chuyển đổi. Đây là cơ hội tốt để tăng doanh số và thu hút 
                                khách hàng mới.
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {!businessInsights.recommendations?.stockUp?.length &&
                    !businessInsights.recommendations?.highlight?.length && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Chưa có gợi ý nhập hàng hoặc sản phẩm nổi bật
                      </p>
                    )}
                </div>
              </div>

              <div className="relative bg-[#2F3C7E] rounded-xl p-[2px] overflow-hidden group hover:shadow-2xl transition-all">
                <div className="relative bg-white rounded-xl p-5 h-full backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-[#2F3C7E] rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#2F3C7E]">
                      Thời điểm vàng & Cảnh báo giảm
                    </h3>
                  </div>

                  {/* Timing Recommendations */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Thời điểm vàng
                      </p>
                    </div>
                    <div className="space-y-3">
                      {businessInsights.recommendations?.timing?.length ? (
                        businessInsights.recommendations.timing.map(
                          (item, idx) => (
                            <div
                              key={`timing-${idx}`}
                              className="px-4 py-3 bg-[#FBEAEB] border-2 border-[#2F3C7E]/30 rounded-lg hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-bold text-green-700">Khoảng {item.window}</span>
                                <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                                  {item.reason}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                <strong>Phân tích:</strong> Đây là thời điểm khách hàng có xu hướng mua sắm 
                                nhiều nhất trong tháng. Nên triển khai các chương trình flash sale, banner 
                                quảng cáo, hoặc chương trình khuyến mãi đặc biệt trong khoảng thời gian này 
                                để tối đa hóa doanh số. Đầu tư marketing vào thời điểm này sẽ mang lại hiệu quả 
                                cao nhất.
                              </p>
                            </div>
                          )
                        )
                      ) : (
                        <span className="text-xs text-gray-500 italic">
                          Chưa có dữ liệu thời điểm vàng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Drop Warnings */}
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Cảnh báo giảm
                      </p>
                    </div>
                    <div className="space-y-3">
                      {businessInsights.recommendations?.drop?.length ? (
                        businessInsights.recommendations.drop.map(
                          (item, idx) => (
                            <div
                              key={`drop-${idx}`}
                              className="px-4 py-3 bg-[#FBEAEB] border-2 border-red-200 rounded-lg hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-bold text-red-700">{item.title}</span>
                                <span className="text-xs text-red-600 bg-red-200 px-2 py-1 rounded-full">
                                  {item.reason}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                <strong>Phân tích:</strong> Thể loại này đang có hiệu suất thấp với ít lượt xem, 
                                không có wishlist và không có đơn hàng. Nên cân nhắc giảm tồn kho, tạm ngừng nhập 
                                hàng mới, hoặc triển khai các chương trình giảm giá mạnh để thanh lý. Điều này sẽ 
                                giúp giải phóng vốn và không gian kho, tập trung vào các sản phẩm có tiềm năng hơn.
                              </p>
                            </div>
                          )
                        )
                      ) : (
                        <span className="text-xs text-gray-500 italic">
                          Không có cảnh báo giảm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Chưa có đủ dữ liệu để AI phân tích. Hệ thống sẽ tự động cập nhật
              khi có thêm hành vi người dùng.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
