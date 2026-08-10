import { useState, useEffect } from 'react';
import { 
  Search, Download, Plus, Mail, Phone, Calendar, 
  Eye, ChevronLeft, ChevronRight, X, CreditCard, Car
} from 'lucide-react';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { AdminTopbar } from '@/features/admin/components/admin-topbar'
import { adminService, type Customer, type AdminVehicle, type AdminBooking } from '@/features/admin/services/admin-service'

export function AdminCustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);
  const [selectedTierFilter, setSelectedTierFilter] = useState<{ [key: string]: boolean }>({
    MEMBER: true, SILVER: true, GOLD: true, PLATINUM: true
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'vehicles' | 'history'>('info');

  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [history, setHistory] = useState<AdminBooking[]>([]);

  // Add Customer modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTier, setNewTier] = useState('MEMBER');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách khách hàng:', err);
      setError(err?.message || 'Không thể tải danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      setVehicles([]);
      setHistory([]);
      
      adminService.getCustomerVehicles(selectedCustomerId)
        .then(setVehicles)
        .catch(err => console.error('Lỗi lấy danh sách xe:', err));

      adminService.getCustomerHistory(selectedCustomerId)
        .then(setHistory)
        .catch(err => console.error('Lỗi lấy lịch sử booking:', err));
    }
  }, [selectedCustomerId]);

  const currentCustomer = customers.find(c => c.id === selectedCustomerId);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, ''));
    
    const matchesTier = selectedTierFilter[customer.tier] === true;

    return matchesSearch && matchesTier;
  });

  const handleDisableCustomer = async (id: string | number) => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa khách hàng này?')) return;
    try {
      setLoading(true);
      await adminService.disableCustomer(id);
      await fetchCustomers();
      setSelectedCustomerId(null);
    } catch (err: any) {
      alert(err?.message || 'Không thể vô hiệu hóa khách hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) {
      alert('Vui lòng nhập tên và số điện thoại.');
      return;
    }
    try {
      setLoading(true);
      await adminService.createCustomer({
        fullName: newName,
        phone: newPhone,
        email: newEmail,
        tier: newTier,
      });
      setIsAddModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewTier('MEMBER');
      await fetchCustomers();
    } catch (err: any) {
      alert(err?.message || 'Lỗi khi thêm khách hàng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface relative overflow-hidden">
      <AdminSidebar activeItem="customers" />
      <AdminTopbar
        searchPlaceholder="Tìm kiếm khách hàng..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        actions={null}
      />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto max-w-7xl space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý khách hàng</h1>
          <p className="text-sm text-slate-500">
            Hiển thị: <span className="font-semibold text-blue-900">{filteredCustomers.length}</span> / {customers.length} khách hàng
            {loading ? ' (Đang tải...)' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-650 hover:bg-slate-50 transition">
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition"
          >
            <Plus className="w-4 h-4" /> Thêm khách hàng
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-650 p-3 rounded-xl border border-red-150 text-xs">
          {error}
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 min-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc số điện thoại..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="font-medium text-slate-500">Hạng thẻ:</span>
          {Object.keys(selectedTierFilter).map((tier) => (
            <label key={tier} className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={selectedTierFilter[tier]}
                onChange={(e) => setSelectedTierFilter({...selectedTierFilter, [tier]: e.target.checked})}
                className="rounded border-slate-300 text-blue-900 focus:ring-blue-900 w-4 h-4"
              />
              <span className="text-xs font-semibold">{tier}</span>
            </label>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 w-12"></th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Số điện thoại</th>
              <th className="p-4">Hạng</th>
              <th className="p-4">Điểm</th>
              <th className="p-4 text-right">Tổng chi tiêu</th>
              <th className="p-4 text-center">Số lần rửa</th>
              <th className="p-4">Lần cuối</th>
              <th className="p-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className={`hover:bg-slate-50 transition ${selectedCustomerId === customer.id ? 'bg-blue-50/50' : ''}`}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300" 
                      checked={selectedCustomerId === customer.id} 
                      onChange={() => {
                        setSelectedCustomerId(selectedCustomerId === customer.id ? null : customer.id);
                        setActiveTab('info');
                      }} 
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                      {customer.avatar || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{customer.fullName}</p>
                      <p className="text-xs text-slate-400">{customer.email || 'Chưa đăng ký email'}</p>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{customer.phone}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      customer.tier === 'GOLD' ? 'bg-amber-100 text-amber-700' :
                      customer.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {customer.tier}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{customer.totalPoints}</td>
                  <td className="p-4 text-right font-bold text-blue-900">
                    {(customer.totalSpend || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="p-4 text-center font-medium">{customer.totalVisits}</td>
                  <td className="p-4 text-slate-500">
                    {customer.lastVisitAt ? new Date(customer.lastVisitAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => {
                        setSelectedCustomerId(customer.id);
                        setActiveTab('info');
                      }}
                      className={`p-1.5 rounded-lg transition ${selectedCustomerId === customer.id ? 'bg-blue-900 text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-10 text-center text-slate-400 font-medium">
                  {loading ? 'Đang tải danh sách...' : 'Không tìm thấy kết quả phù hợp!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị 1 - {filteredCustomers.length} trên {customers.length} khách hàng</span>
          <div className="flex items-center gap-1">
            <button className="p-1 border border-slate-200 rounded hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-2.5 py-1 bg-blue-900 text-white font-medium rounded">1</button>
            <button className="p-1 border border-slate-200 rounded hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* --- SIDE DETAILS DRAWER --- */}
      {selectedCustomerId && currentCustomer && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40" onClick={() => setSelectedCustomerId(null)} />
          
          <div className="fixed right-0 top-0 h-full w-112 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 relative">
              <button 
                onClick={() => setSelectedCustomerId(null)}
                className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 mt-2">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xl relative">
                  {currentCustomer.avatar || 'U'}
                  <span className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${currentCustomer.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{currentCustomer.fullName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {currentCustomer.tier}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {currentCustomer.totalPoints} điểm • Đã chi tiêu: <span className="font-bold text-blue-900">{currentCustomer.totalSpend.toLocaleString('vi-VN')}đ</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Tabs Navigation */}
            <div className="px-6 border-b border-slate-100 flex gap-4 text-sm font-medium text-slate-400">
              <button 
                onClick={() => setActiveTab('info')}
                className={`py-3 transition-all ${activeTab === 'info' ? 'text-blue-900 border-b-2 border-blue-900 font-semibold' : 'hover:text-slate-600'}`}
              >
                Thông tin
              </button>
              <button 
                onClick={() => setActiveTab('vehicles')}
                className={`py-3 transition-all ${activeTab === 'vehicles' ? 'text-blue-900 border-b-2 border-blue-900 font-semibold' : 'hover:text-slate-600'}`}
              >
                Xe <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full text-xs ml-0.5">{vehicles.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`py-3 transition-all ${activeTab === 'history' ? 'text-blue-900 border-b-2 border-blue-900 font-semibold' : 'hover:text-slate-600'}`}
              >
                Lịch sử rửa <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full text-xs ml-0.5">{history.length}</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              
              {/* TAB 1: INFO */}
              {activeTab === 'info' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Chi tiết cá nhân</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><Mail className="w-3.5 h-3.5" /> Email</p>
                        <p className="font-medium text-slate-700 truncate">{currentCustomer.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><Phone className="w-3.5 h-3.5" /> Số điện thoại</p>
                        <p className="font-medium text-slate-700">{currentCustomer.phone}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5" /> Ngày tham gia</p>
                        <p className="font-medium text-slate-700">
                          {currentCustomer.registeredAt ? new Date(currentCustomer.registeredAt).toLocaleDateString('vi-VN') : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5" /> Lần hoạt động cuối</p>
                        <p className="font-medium text-slate-700">
                          {currentCustomer.lastVisitAt ? new Date(currentCustomer.lastVisitAt).toLocaleString('vi-VN') : 'Chưa có'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                      <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><CreditCard className="w-3.5 h-3.5" /> Tổng chi tiêu</p>
                      <p className="text-xl font-bold text-blue-900">
                        {currentCustomer.totalSpend.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                      <p className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><Car className="w-3.5 h-3.5" /> Tổng số lần rửa</p>
                      <p className="text-xl font-bold text-green-600">{currentCustomer.totalVisits} lần</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VEHICLES */}
              {activeTab === 'vehicles' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phương tiện đang sử dụng</h4>
                  
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs flex justify-between items-center transition">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Car className="w-5 h-5" /></div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{vehicle.licensePlate}</p>
                            <p className="text-xs text-slate-400">
                              {vehicle.brand || 'Khác'} • {vehicle.color || 'Không xác định'} ({vehicle.vehicleType})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-6 text-center text-xs text-slate-400 rounded-xl border border-dashed border-slate-200">
                      Khách hàng chưa đăng ký xe nào.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SERVICE HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lịch sử dịch vụ gần đây</h4>
                  
                  {history.length > 0 ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs space-y-4">
                      {history.map((item, index) => (
                        <div key={item.id} className="space-y-2">
                          {index > 0 && <div className="border-t border-dashed my-2"></div>}
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700">{item.serviceName}</span>
                            <span className={`font-semibold ${
                              item.status === 'DONE' ? 'text-green-650' :
                              item.status === 'CANCELLED' ? 'text-red-500' : 'text-amber-500'
                            }`}>{item.status}</span>
                          </div>
                          <p className="text-xs text-slate-455">
                            Xe: {item.carPlate} • {item.dateStr} lúc {item.timeStr}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Tổng tiền: {item.totalAmount?.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-6 text-center text-xs text-slate-400 rounded-xl border border-dashed border-slate-200">
                      Chưa có lịch sử dịch vụ.
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-1 gap-3">
              <button 
                onClick={() => handleDisableCustomer(currentCustomer.id)}
                disabled={!currentCustomer.isActive}
                className="py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                Vô hiệu hóa khách hàng
              </button>
            </div>

          </div>
        </>
      )}

      {/* --- ADD CUSTOMER MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200/80 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-tight text-slate-800">
                Thêm khách hàng mới
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-450 hover:text-slate-650 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">
                  Họ và tên *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="VD: Nguyễn Văn A"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 rounded-lg text-xs font-medium focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">
                  Số điện thoại *
                </label>
                <input 
                  type="tel" 
                  required
                  placeholder="VD: 0901234567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 rounded-lg text-xs font-medium focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input 
                  type="email" 
                  placeholder="VD: name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 rounded-lg text-xs font-medium focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">
                  Hạng thẻ
                </label>
                <select 
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 rounded-lg text-xs font-medium focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="SILVER">SILVER</option>
                  <option value="GOLD">GOLD</option>
                  <option value="PLATINUM">PLATINUM</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-blue-900 text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition shadow-lg cursor-pointer"
                >
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </div>
      </main>
    </div>
  );
}