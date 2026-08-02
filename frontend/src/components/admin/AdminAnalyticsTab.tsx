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
}: AdminAnalyticsTabProps) {
  const safeOrders = Array.isArray(adminOrders) ? adminOrders : [];
  const safeUsers = Array.isArray(usersList) ? usersList : [];
  const safeTopProducts = Array.isArray(topProducts) ? topProducts : [];
  const safePointsCoords = Array.isArray(pointsCoords) ? pointsCoords : [];

  const totalRevenue = safeOrders.reduce((sum, o) => sum + (Number(o?.totalAmount) || 0), 0);

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
      <div className="bg-surface-container-lowest border border-outline-variant p-8 overflow-hidden relative rounded-md">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Sales Overview</h3>
            <p className="font-label-caps text-label-caps text-on-surface-variant/50">
              Monthly growth trend (VNĐ)
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setChartPeriod('monthly')}
              className={`font-label-caps text-label-caps pb-1 border-b-2 cursor-pointer ${
                chartPeriod === 'monthly'
                  ? 'border-primary font-bold text-primary'
                  : 'border-transparent text-on-surface-variant/50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setChartPeriod('quarterly')}
              className={`font-label-caps text-label-caps pb-1 border-b-2 cursor-pointer ${
                chartPeriod === 'quarterly'
                  ? 'border-primary font-bold text-primary'
                  : 'border-transparent text-on-surface-variant/50'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>

        <div className="w-full h-72 relative mt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300">
            <line stroke="#e2e2e2" strokeWidth="1" x1="0" x2="1000" y1="280" y2="280" />
            <line stroke="#f3f3f3" strokeWidth="1" x1="0" x2="1000" y1="180" y2="180" />
            <line stroke="#f3f3f3" strokeWidth="1" x1="0" x2="1000" y1="80" y2="80" />

            <polyline
              className="transition-all duration-700"
              fill="none"
              stroke="#000000"
              strokeWidth="3"
              points={polylinePoints || ''}
            />

            {safePointsCoords.map((pt, idx) => (
              <g
                key={idx}
                className="group/node cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={pt.x || 0}
                  cy={pt.y || 0}
                  r={hoveredPoint?.label === pt.label ? 7 : 5}
                  fill={pt.revenue > 0 ? '#000000' : '#ffffff'}
                  stroke="black"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
              </g>
            ))}
          </svg>

          {/* Dynamic Tooltip on Hover */}
          {hoveredPoint && (
            <div
              className="absolute z-20 bg-primary text-white text-xs px-3 py-2 rounded shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full font-label-caps font-bold transition-all duration-150"
              style={{
                left: `${((hoveredPoint.x || 0) / 1000) * 100}%`,
                top: `${((hoveredPoint.y || 0) / 300) * 100 - 4}%`,
              }}
            >
              <p className="text-[10px] text-amber-300 uppercase tracking-widest">{hoveredPoint.label}</p>
              <p className="text-sm font-bold">{formatVND(hoveredPoint.revenue)}</p>
              <p className="text-[10px] opacity-80">{hoveredPoint.orderCount} Đơn hàng</p>
            </div>
          )}

          <div className="flex justify-between w-full mt-6 font-label-caps text-[10px] text-on-surface-variant/60 font-bold">
            {safePointsCoords.map((pt, idx) => (
              <span
                key={idx}
                className={hoveredPoint?.label === pt.label ? 'text-primary font-bold underline' : ''}
              >
                {pt.label}
              </span>
            ))}
          </div>
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
