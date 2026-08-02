import React from 'react';
import Pagination from '../Pagination';

interface AdminCustomersTabProps {
  usersList?: any[];
  userSearch: string;
  setUserSearch: (search: string) => void;
  userStatusFilter: string;
  setUserStatusFilter: (filter: string) => void;
  usersPage: number;
  setUsersPage: (page: number) => void;
  handleToggleUserStatus: (user: any) => void;
}

export default function AdminCustomersTab({
  usersList = [],
  userSearch,
  setUserSearch,
  userStatusFilter,
  setUserStatusFilter,
  usersPage,
  setUsersPage,
  handleToggleUserStatus,
}: AdminCustomersTabProps) {
  const safeUsers = Array.isArray(usersList) ? usersList : [];
  const filtered = safeUsers.filter((u) => {
    const matchesSearch =
      !userSearch ||
      u?.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u?.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u?.phone?.includes(userSearch);
    const matchesStatus =
      userStatusFilter === 'ALL' ||
      (userStatusFilter === 'ACTIVE' && u?.enabled) ||
      (userStatusFilter === 'INACTIVE' && !u?.enabled);
    return matchesSearch && matchesStatus;
  });

  const pageSize = 10;
  const paginated = filtered.slice((usersPage - 1) * pageSize, usersPage * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-outline-variant">
        <div>
          <span className="font-label-caps text-label-caps text-secondary mb-1 block uppercase tracking-widest font-bold">
            USER MANAGEMENT & ACCOUNTS
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">Quản Lý Tài Khoản Khách Hàng</h2>
          <p className="font-body-md text-on-surface-variant/60 text-sm">
            Quản lý thông tin tài khoản người dùng, phân quyền và khóa/kích hoạt tài khoản.
          </p>
        </div>
      </div>

      {/* User Search & Status Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-surface-container-lowest p-4 border border-outline-variant rounded-md">
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo Tên, Email hoặc Số điện thoại..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full py-2 pl-9 pr-3 border border-outline-variant rounded text-xs outline-none bg-white font-body-md"
          />
        </div>

        <div className="flex items-center gap-2 font-label-caps text-xs">
          <span className="text-on-surface-variant font-bold">Trạng thái:</span>
          {[
            { key: 'ALL', label: 'Tất Cả' },
            { key: 'ACTIVE', label: 'Hoạt Động' },
            { key: 'INACTIVE', label: 'Đã Khóa' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setUserStatusFilter(item.key)}
              className={`px-3 py-1.5 rounded cursor-pointer transition-all font-bold ${
                userStatusFilter === item.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/60 border-b border-outline-variant">
              <th className="p-4 font-label-caps text-xs text-primary font-bold">ID</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Khách Hàng</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Email</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Số Điện Thoại</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold">Vai Trò</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-center">Trạng Thái</th>
              <th className="p-4 font-label-caps text-xs text-primary font-bold text-right">Thao Tác Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-on-surface-variant font-medium">
                  Chưa có tài khoản khách hàng nào phù hợp
                </td>
              </tr>
            ) : (
              paginated.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-on-surface-variant/70">#{u.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-primary">{u.fullName || 'Khách hàng DuoStyle'}</p>
                  </td>
                  <td className="p-4 text-on-surface-variant font-medium">{u.email}</td>
                  <td className="p-4 text-on-surface-variant">{u.phone || 'Chưa cập nhật'}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-label-caps font-bold ${
                        u.roles?.includes('ADMIN') || u.roles?.includes('ROLE_ADMIN')
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-surface-container text-on-surface-variant border border-outline-variant/40'
                      }`}
                    >
                      {u.roles?.includes('ADMIN') || u.roles?.includes('ROLE_ADMIN') ? 'ADMIN' : 'CUSTOMER'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-label-caps font-bold whitespace-nowrap border ${
                        u.enabled
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {u.enabled ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u)}
                      className={`text-xs px-3 py-1.5 rounded transition-colors cursor-pointer font-label-caps font-bold ${
                        u.enabled
                          ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      {u.enabled ? 'Khóa Tài Khoản' : 'Kích Hoạt'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Users Pagination */}
      <Pagination
        currentPage={usersPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        onPageChange={(p) => setUsersPage(p)}
      />
    </div>
  );
}
