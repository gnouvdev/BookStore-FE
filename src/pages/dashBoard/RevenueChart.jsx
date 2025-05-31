/* eslint-disable no-unused-vars */
"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const RevenueChart = ({ data }) => {
  const [chartType, setChartType] = useState("line")
  const [timeRange, setTimeRange] = useState("6months")

  // Process and filter data based on time range
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []

    const months = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12
    return data.slice(-months)
  }, [data, timeRange])

  // Calculate trends and statistics
  const stats = useMemo(() => {
    if (!processedData || processedData.length < 2) return null

    const current = processedData[processedData.length - 1]
    const previous = processedData[processedData.length - 2]

    const revenueChange = ((current.totalSales - previous.totalSales) / previous.totalSales) * 100
    const ordersChange = ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100
    const avgOrderChange = ((current.averageOrderValue - previous.averageOrderValue) / previous.averageOrderValue) * 100

    return {
      revenueChange,
      ordersChange,
      avgOrderChange,
      totalRevenue: processedData.reduce((sum, item) => sum + item.totalSales, 0),
      totalOrders: processedData.reduce((sum, item) => sum + item.totalOrders, 0),
    }
  }, [processedData])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-sm p-4 shadow-xl rounded-xl border border-gray-200"
        >
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-gray-600">
                {entry.name}:{" "}
                {entry.dataKey === "totalSales" || entry.dataKey === "averageOrderValue"
                  ? formatCurrency(entry.value)
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </motion.div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="font-medium">Không có dữ liệu</p>
          <p className="text-sm">Dữ liệu doanh thu sẽ xuất hiện ở đây khi có dữ liệu</p>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    const commonProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 10 },
    }

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="monthName" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" stroke="#8884d8" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="totalSales"
              name="Revenue"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="totalOrders"
              name="Orders"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#ordersGradient)"
            />
          </AreaChart>
        )

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="monthName" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" stroke="#8884d8" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="totalSales" name="Revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="totalOrders" name="Orders" fill="#82ca9d" radius={[4, 4, 0, 0]} />
          </BarChart>
        )

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="monthName" stroke="#666" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" stroke="#8884d8" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalSales"
              name="Revenue"
              stroke="#8884d8"
              strokeWidth={3}
              dot={{ r: 5, fill: "#8884d8" }}
              activeDot={{ r: 7, fill: "#8884d8" }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalOrders"
              name="Orders"
              stroke="#82ca9d"
              strokeWidth={3}
              dot={{ r: 5, fill: "#82ca9d" }}
              activeDot={{ r: 7, fill: "#82ca9d" }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="averageOrderValue"
              name="Avg Order"
              stroke="#ffc658"
              strokeWidth={3}
              dot={{ r: 5, fill: "#ffc658" }}
              activeDot={{ r: 7, fill: "#ffc658" }}
            />
          </LineChart>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Phân tích doanh thu</h3>
          <p className="text-sm text-gray-500">Theo dõi hiệu suất kinh doanh theo thời gian</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Time Range Selector */}
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

          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: "line", label: "Line" },
              { key: "area", label: "Area" },
              { key: "bar", label: "Bar" },
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

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="flex items-center gap-1">
                {stats.revenueChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <Badge variant={stats.revenueChange >= 0 ? "default" : "destructive"} className="text-xs">
                  {stats.revenueChange >= 0 ? "+" : ""}
                  {stats.revenueChange.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalOrders.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                {stats.ordersChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <Badge variant={stats.ordersChange >= 0 ? "default" : "destructive"} className="text-xs">
                  {stats.ordersChange >= 0 ? "+" : ""}
                  {stats.ordersChange.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm text-purple-600 font-medium">Giá trung bình đơn hàng</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(stats.totalRevenue / stats.totalOrders)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {stats.avgOrderChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <Badge variant={stats.avgOrderChange >= 0 ? "default" : "destructive"} className="text-xs">
                  {stats.avgOrderChange >= 0 ? "+" : ""}
                  {stats.avgOrderChange.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Chart Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="p-4">
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}

export default RevenueChart
