import React from 'react';
import { formatVND } from '../ProductCard';

interface AdminAnalyticsTabProps {
  adminOrders?: any[];
  usersList?: any[];
  topProducts?: any[];
  chartPeriod: string;
  setChartPeriod: (period: string) => void;
  polylinePoints?: string;
  pointsCoords?: any[];
  hoveredPoint: any;
  setHoveredPoint: (pt: any) => void;
  maxRevenue?: number;
}

export default function AdminAnalyticsTab({
  adminOrders = [],
  usersList = [],
  topProducts = [],
  chartPeriod,
  setChartPeriod,
  polylinePoints = '',
  pointsCoords = [],
  hoveredPoint,
  setHoveredPoint,
  maxRevenue = 1000000,
}: AdminAnalyticsTabProps) {
  const safeOrders = Array.isArray(adminOrders) ? adminOrders : [];
  const safeUsers = Array.isArray(usersList) ? usersList : [];
  const safeTopProducts = Array.isArray(topProducts) ? topProducts : [];
  const safePointsCoords = Array.isArray(pointsCoords) ? pointsCoords : [];

  const totalRevenue = safeOrders.reduce((sum, o) => sum + (Number(o?.totalAmount) || 0), 0);

  // Peak revenue & total orders for stats summary
  const peakPoint = safePointsCoords.reduce(
    (max, pt) => (pt.revenue > (max?.revenue || 0) ? pt : max),
    safePointsCoords[0] || null
  );

  // Y-axis grid ticks calculation (4 levels: 100%, 67%, 33%, 0%)
  const yTicks = [
    { val: maxRevenue, y: 40 },
    { val: Math.round((maxRevenue * 2) / 3), y: 105 },
    { val: Math.round(maxRevenue / 3), y: 170 },
    { val: 0, y: 235 },
  ];

  // Polygon area points under curve
  const firstPtX = safePointsCoords[0]?.x || 100;
  const lastPtX = safePointsCoords[safePointsCoords.length - 1]?.x || 940;
  const areaPolygonPoints = `${firstPtX},235 ${polylinePoints} ${lastPtX},235`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-headline-md text-headline-md text-primary mb-1">Performance Dashboard</h2>
        <p className="font-body-md text-on-surface-variant/60 text-sm">
          Overview of your DuoStyle luxury fashion ecosystem's recent performance.
        </p>
      </div>

      {/* Key Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-8 border border-outline-variant flex flex-col justify-between h-48 group hover:border-primary transition-colors duration-300 rounded-md">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest font-bold">
              Total Revenue
            </span>
            <span className="material-symbols-outlined text-primary/30 group-hover:text-primary transition-colors">
              payments
            </span>
          </div>
          <div>
            <p className="font-headline-sm text-headline-sm text-primary mb-1 font-bold">
              {formatVND(totalRevenue)}
            </p>
            <p className="font-label-caps text-label-caps text-secondary font-bold">
              Tổng doanh thu hệ thống
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 border border-outline-variant flex flex-col justify-between h-48 group hover:border-primary transition-colors duration-300 rounded-md">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest font-bold">
              Total Orders
            </span>
            <span className="material-symbols-outlined text-primary/30 group-hover:text-primary transition-colors">
              local_mall
            </span>
          </div>
          <div>
            <p className="font-headline-sm text-headline-sm text-primary mb-1 font-bold">
              {safeOrders.length} Đơn Hàng
            </p>
            <p className="font-label-caps text-label-caps text-on-surface-variant/60">
              Đang được xử lý trong hệ thống
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 border border-outline-variant flex flex-col justify-between h-48 group hover:border-primary transition-colors duration-300 rounded-md">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest font-bold">
              Total Customers
            </span>
            <span className="material-symbols-outlined text-primary/30 group-hover:text-primary transition-colors">
              group
            </span>
          </div>
          <div>
            <p className="font-headline-sm text-headline-sm text-primary mb-1 font-bold">
              {safeUsers.length} Thành Viên
            </p>
            <p className="font-label-caps text-label-caps text-secondary font-bold">
              Tài khoản đã đăng ký
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Section SVG Line Chart */}
      <div className="bg-surface-container-lowest border border-outline-variant p-8 relative rounded-md shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-headline-sm text-headline-sm text-primary">Sales Overview</h3>
              {peakPoint && peakPoint.revenue > 0 && (
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded font-bold border border-emerald-200">
                  Peak: {peakPoint.label} ({formatVND(peakPoint.revenue)})
                </span>
              )}
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant/50 mt-1">
              Xu hướng tăng trưởng doanh thu (VNĐ)
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-lg border border-outline-variant/40">
            <button
              onClick={() => setChartPeriod('monthly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                chartPeriod === 'monthly'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant/70 hover:text-primary'
              }`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setChartPeriod('quarterly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                chartPeriod === 'quarterly'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant/70 hover:text-primary'
              }`}
            >
              Hàng quý
            </button>
          </div>
        </div>

        <div className="w-full relative mt-2">
          <svg className="w-full h-auto overflow-visible select-none" viewBox="0 0 1000 310">
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines & Y-Axis Scale Labels */}
            {yTicks.map((tick, idx) => (
              <g key={idx}>
                <line
                  stroke={idx === yTicks.length - 1 ? '#cbd5e1' : '#f1f5f9'}
                  strokeWidth={idx === yTicks.length - 1 ? '1.5' : '1'}
                  strokeDasharray={idx > 0 && idx < yTicks.length - 1 ? '4 4' : undefined}
                  x1="90"
                  x2="960"
                  y1={tick.y}
                  y2={tick.y}
                />
                <text
                  x="82"
                  y={tick.y + 4}
                  textAnchor="end"
                  className="fill-on-surface-variant/60 font-mono text-[11px] font-medium"
                >
                  {formatVND(tick.val)}
                </text>
              </g>
            ))}

            {/* Area Fill Under Line */}
            {polylinePoints && (
              <polygon
                points={areaPolygonPoints}
                fill="url(#salesGradient)"
                className="transition-all duration-700"
              />
            )}

            {/* Main Trend Line */}
            <polyline
              className="transition-all duration-700"
              fill="none"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints || ''}
            />

            {/* Hover Vertical Guide Crosshair */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x || 0}
                y1={35}
                x2={hoveredPoint.x || 0}
                y2={235}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="transition-all duration-150"
              />
            )}

            {/* Data Points & X-Axis Month Labels (Inside SVG so never clipped) */}
            {safePointsCoords.map((pt, idx) => {
              const isHovered = hoveredPoint?.label === pt.label;
              return (
                <g
                  key={idx}
                  className="group/node cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Outer Hover Glow Circle */}
                  {isHovered && (
                    <circle
                      cx={pt.x || 0}
                      cy={pt.y || 0}
                      r={10}
                      fill="#000000"
                      fillOpacity="0.15"
                      className="animate-ping"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={pt.x || 0}
                    cy={pt.y || 0}
                    r={isHovered ? 7 : 5}
                    fill={pt.revenue > 0 ? '#000000' : '#ffffff'}
                    stroke="#000000"
                    strokeWidth={isHovered ? '3' : '2.5'}
                    className="transition-all duration-200"
                  />

                  {/* X-Axis Label */}
                  <text
                    x={pt.x || 0}
                    y={272}
                    textAnchor="middle"
                    className={`font-label-caps text-[11px] transition-colors ${
                      isHovered
                        ? 'fill-primary font-bold underline'
                        : pt.revenue > 0
                        ? 'fill-on-surface font-bold'
                        : 'fill-on-surface-variant/60 font-medium'
                    }`}
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Dynamic Tooltip on Hover */}
          {hoveredPoint && (
            <div
              className="absolute z-30 bg-gray-900 text-white text-xs px-3.5 py-2.5 rounded-lg shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full border border-gray-700 transition-all duration-150"
              style={{
                left: `${((hoveredPoint.x || 0) / 1000) * 100}%`,
                top: `${((hoveredPoint.y || 0) / 310) * 100 - 4}%`,
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  {hoveredPoint.label}
                </span>
                <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded font-mono">
                  {hoveredPoint.orderCount || 0} Đơn hàng
                </span>
              </div>
              <p className="text-sm font-bold text-white font-mono">{formatVND(hoveredPoint.revenue)}</p>
            </div>
          )}
        </div>
      </div>

      {/* TOP 5 BEST SELLING PRODUCTS WIDGET */}
      <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-1">
              Top Sản Phẩm Bán Chạy (Best Sellers)
            </h3>
            <p className="font-label-caps text-label-caps text-on-surface-variant/50">
              Thống kê theo số lượng bán ra và tổng doanh thu mang lại
            </p>
          </div>
          <span className="material-symbols-outlined text-amber-500 text-2xl">workspace_premium</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant font-label-caps text-on-surface-variant uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Xếp Hạng</th>
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4 text-center">Đã Bán</th>
                <th className="py-3 px-4 text-right">Tổng Doanh Thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {safeTopProducts.length > 0 ? (
                safeTopProducts.map((prod: any, rank: number) => (
                  <tr key={prod.productId || rank} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3.5 px-4 font-bold text-center w-12">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          rank === 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : rank === 1
                            ? 'bg-slate-100 text-slate-700 border border-slate-300'
                            : rank === 2
                            ? 'bg-amber-800/10 text-amber-900 border border-amber-800/30'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        #{rank + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {prod.thumbnailUrl ? (
                          <img
                            src={prod.thumbnailUrl}
                            alt={prod.productName}
                            className="w-10 h-10 object-cover rounded border border-outline-variant"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-surface-container rounded border border-outline-variant flex items-center justify-center text-on-surface-variant/40">
                            <span className="material-symbols-outlined text-sm">image</span>
                          </div>
                        )}
                        <span className="font-bold text-primary max-w-xs truncate">{prod.productName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      {prod.categoryName || 'Thời Trang'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-secondary">
                      {prod.totalQuantitySold} sản phẩm
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-primary">
                      {formatVND(prod.totalRevenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant/50">
                    Chưa có dữ liệu bán hàng được ghi nhận trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
