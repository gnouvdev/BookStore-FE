import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RevenueChart({ data, dateRange, onDateRangeChange }) {
  const [chartType, setChartType] = useState("line");
  const [timeRange, setTimeRange] = useState("6months");
  const [localDateRange, setLocalDateRange] = useState({
    startDate: dateRange?.startDate || "",
    endDate: dateRange?.endDate || "",
  });

  useEffect(() => {
    setLocalDateRange({
      startDate: dateRange?.startDate || "",
      endDate: dateRange?.endDate || "",
    });
  }, [dateRange]);

  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    let filtered = [...data];

    if (localDateRange.startDate || localDateRange.endDate) {
      filtered = filtered.filter((item) => {
        if (!item.month) {
          return false;
        }

        const itemDate = new Date(item.month);
        const startDate = localDateRange.startDate
          ? new Date(localDateRange.startDate)
          : null;
        const endDate = localDateRange.endDate
          ? new Date(localDateRange.endDate)
          : null;

        if (startDate && itemDate < startDate) {
          return false;
        }

        if (endDate) {
          const inclusiveEnd = new Date(endDate);
          inclusiveEnd.setHours(23, 59, 59, 999);
          if (itemDate > inclusiveEnd) {
            return false;
          }
        }

        return true;
      });
    } else {
      const months = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
      filtered = filtered.slice(-months);
    }

    return filtered;
  }, [data, localDateRange, timeRange]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value || 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-sm p-4 shadow-xl rounded-xl border border-gray-200"
      >
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={`${entry.dataKey}-${index}`} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-600">
              {entry.name}:{" "}
              {entry.dataKey === "totalSales" || entry.dataKey === "averageOrderValue"
                ? formatCurrency(entry.value)
                : Number(entry.value || 0).toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </motion.div>
    );
  };

  const handleDateChange = (field, value) => {
    const nextRange = {
      ...localDateRange,
      [field]: value,
    };
    setLocalDateRange(nextRange);
    onDateRangeChange?.(nextRange);
  };

  const clearDateFilter = () => {
    const clearedRange = { startDate: "", endDate: "" };
    setLocalDateRange(clearedRange);
    onDateRangeChange?.(clearedRange);
  };

  const chartCommonProps = {
    data: processedData,
    margin: { top: 20, right: 30, left: 20, bottom: 10 },
  };

  const renderChart = () => {
    if (chartType === "area") {
      return (
        <AreaChart {...chartCommonProps}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5a0a11" stopOpacity={0.82} />
              <stop offset="95%" stopColor="#5a0a11" stopOpacity={0.08} />
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#775a19" stopOpacity={0.72} />
              <stop offset="95%" stopColor="#775a19" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eadfce" />
          <XAxis dataKey="monthName" stroke="#6b5550" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            stroke="#5a0a11"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
          />
          <YAxis yAxisId="right" orientation="right" stroke="#775a19" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="totalSales" name="Revenue" stroke="#5a0a11" fill="url(#revenueGradient)" />
          <Area yAxisId="right" type="monotone" dataKey="totalOrders" name="Orders" stroke="#775a19" fill="url(#ordersGradient)" />
        </AreaChart>
      );
    }

    if (chartType === "bar") {
      return (
        <BarChart {...chartCommonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eadfce" />
          <XAxis dataKey="monthName" stroke="#6b5550" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            stroke="#5a0a11"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
          />
          <YAxis yAxisId="right" orientation="right" stroke="#775a19" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar yAxisId="left" dataKey="totalSales" name="Revenue" fill="#5a0a11" radius={[0, 0, 0, 0]} />
          <Bar yAxisId="right" dataKey="totalOrders" name="Orders" fill="#775a19" radius={[0, 0, 0, 0]} />
        </BarChart>
      );
    }

    return (
      <LineChart {...chartCommonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eadfce" />
        <XAxis dataKey="monthName" stroke="#6b5550" tick={{ fontSize: 12 }} />
        <YAxis
          yAxisId="left"
          stroke="#5a0a11"
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
        />
        <YAxis yAxisId="right" orientation="right" stroke="#775a19" tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="totalSales"
          name="Revenue"
          stroke="#5a0a11"
          strokeWidth={3}
          dot={{ r: 4, fill: "#5a0a11" }}
          activeDot={{ r: 6, fill: "#5a0a11" }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="totalOrders"
          name="Orders"
          stroke="#775a19"
          strokeWidth={3}
          dot={{ r: 4, fill: "#775a19" }}
          activeDot={{ r: 6, fill: "#775a19" }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="averageOrderValue"
          name="Avg Order"
          stroke="#b48c3b"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#b48c3b" }}
          activeDot={{ r: 6, fill: "#b48c3b" }}
        />
      </LineChart>
    );
  };

  if (!processedData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-700">Không có dữ liệu doanh thu</p>
          <p className="text-sm">Dữ liệu sẽ hiển thị tại đây khi hệ thống có bản ghi hợp lệ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Phân tích doanh thu</h3>
            <p className="text-sm text-gray-500">Theo dõi doanh thu, đơn hàng và giá trị đơn trung bình theo thời gian.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: "3months", label: "3M" },
                { key: "6months", label: "6M" },
                { key: "12months", label: "1Y" },
              ].map((range) => (
                <Button
                  key={range.key}
                  variant={timeRange === range.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(range.key)}
                  className="rounded-md"
                >
                  {range.label}
                </Button>
              ))}
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: "line", label: "Line" },
                { key: "area", label: "Vùng" },
                { key: "bar", label: "Cột" },
              ].map((type) => (
                <Button
                  key={type.key}
                  variant={chartType === type.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType(type.key)}
                  className="rounded-md"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Lọc theo ngày:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex-1">
              <Label htmlFor="startDate" className="text-xs text-gray-600 mb-1 block">
                Từ ngày
              </Label>
              <Input
                id="startDate"
                type="date"
                value={localDateRange.startDate}
                onChange={(event) => handleDateChange("startDate", event.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate" className="text-xs text-gray-600 mb-1 block">
                Đến ngày
              </Label>
              <Input
                id="endDate"
                type="date"
                value={localDateRange.endDate}
                onChange={(event) => handleDateChange("endDate", event.target.value)}
                className="h-9"
                min={localDateRange.startDate}
              />
            </div>
            {(localDateRange.startDate || localDateRange.endDate) && (
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={clearDateFilter} className="h-9">
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="p-4">
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
