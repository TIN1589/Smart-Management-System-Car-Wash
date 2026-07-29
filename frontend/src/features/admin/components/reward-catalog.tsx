import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { RewardItem } from '@/features/admin/data/admin-configuration'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import toast from 'react-hot-toast'

export function PointRateCard({ rate, onChange }: { rate: string; onChange: (val: string) => void }) {
  return (
    <Card className="p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-medium leading-7 text-on-surface">Tỷ lệ tích điểm</h3>
      <div className="flex items-center gap-4">
        <div className="flex flex-1 items-center rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3">
          <span className="text-base font-medium leading-6 text-primary">1 điểm</span>
          <span className="mx-4 text-on-surface-variant">=</span>
          <Input 
            className="h-8 border-0 bg-transparent px-0 text-right text-base font-medium shadow-none focus:ring-0" 
            value={rate} 
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="ml-2 text-on-surface-variant">VND</span>
        </div>
        <p className="w-32 text-xs italic leading-4 text-on-surface-variant">
          Tỷ lệ quy đổi doanh thu sang điểm thưởng hệ thống.
        </p>
      </div>
    </Card>
  )
}

export function RewardCatalog({ 
  rewards, 
  onAddReward, 
  onDeleteReward 
}: { 
  rewards: RewardItem[]; 
  onAddReward: (item: RewardItem) => void; 
  onDeleteReward: (index: number) => void 
}) {
  const [newName, setNewName] = useState('')
  const [newPoints, setNewPoints] = useState('')
  const [newTier, setNewTier] = useState('MEMBER')

  const handleAdd = () => {
    if (!newName.trim() || !newPoints.trim()) {
      toast.error('Vui lòng nhập tên thưởng và số điểm!')
      return
    }
    
    const tierClassNameMap: Record<string, string> = {
      MEMBER: 'bg-tier-member',
      SILVER: 'bg-tier-silver',
      GOLD: 'bg-tier-gold',
      PLATINUM: 'bg-tier-platinum'
    }

    onAddReward({
      name: newName.trim(),
      points: Number(newPoints).toLocaleString('vi-VN'),
      minimumTier: newTier.toUpperCase(),
      tierClassName: tierClassNameMap[newTier.toUpperCase()] || 'bg-tier-member'
    })

    setNewName('')
    setNewPoints('')
    toast.success('Đã thêm phần thưởng vào danh mục tạm thời!')
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="border-b border-border p-6">
        <h3 className="text-xl font-medium leading-7 text-on-surface">Danh mục đổi thưởng</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse text-left">
          <thead className="bg-surface-container-low text-xs text-on-surface-variant">
            <tr>
              <th className="border-b border-border px-4 py-3 font-medium">Tên thưởng</th>
              <th className="border-b border-border px-4 py-3 text-right font-medium">Điểm cần</th>
              <th className="border-b border-border px-4 py-3 font-medium">Tier tối thiểu</th>
              <th className="border-b border-border px-4 py-3 text-center font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm leading-5">
            {rewards.map((item, index) => (
              <tr className="transition-colors hover:bg-surface-container-low" key={item.name + '-' + index}>
                <td className="px-4 py-4">{item.name}</td>
                <td className="px-4 py-4 text-right font-medium">{item.points}</td>
                <td className="px-4 py-4">
                  <span className={cn('rounded px-2 py-1 text-[10px] font-medium leading-4 text-on-surface', item.tierClassName)}>
                    {item.minimumTier}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Button 
                      aria-label="Xóa thưởng" 
                      className="hover:text-danger text-red-500" 
                      size="icon-sm" 
                      type="button" 
                      variant="ghost"
                      onClick={() => {
                        onDeleteReward(index)
                        toast.success('Đã xóa phần thưởng khỏi danh mục!')
                      }}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-surface-container-low p-4">
        <p className="mb-3 text-xs font-medium leading-4 text-on-surface">Thêm thưởng mới</p>
        <div className="grid grid-cols-12 gap-2">
          <Input 
            className="col-span-5" 
            placeholder="Tên thưởng" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input 
            className="col-span-3" 
            placeholder="Điểm" 
            type="number" 
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
          />
          <select 
            className="col-span-3 h-12 rounded-lg border border-outline-variant bg-surface px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={newTier}
            onChange={(e) => setNewTier(e.target.value)}
          >
            <option value="MEMBER">Member</option>
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
            <option value="PLATINUM">Platinum</option>
          </select>
          <Button 
            aria-label="Thêm thưởng" 
            className="col-span-1 h-12 p-0 cursor-pointer" 
            type="button"
            onClick={handleAdd}
          >
            <Plus size={20} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
