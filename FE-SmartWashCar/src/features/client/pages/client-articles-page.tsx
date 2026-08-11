import { useState, useEffect } from 'react'
import { BookOpen, Calendar, User, Search, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { ClientSidebar } from '@/features/client/components/client-sidebar'
import { ClientTopbar } from '@/features/client/components/client-topbar'
import { Card as UICard, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { articleService, type Article } from '@/features/client/services/article-service'

export function ClientArticlesPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'ALL' | 'VEHICLE' | 'SERVICE'>('ALL')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch articles from backend API
  useEffect(() => {
    let active = true
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await articleService.getClientArticles(
          activeTab === 'ALL' ? undefined : activeTab,
          searchQuery.trim() || undefined
        )
        if (active) {
          const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setArticles(sorted)
        }
      } catch (error) {
        console.error('Lỗi khi nạp cẩm nang từ server:', error)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      active = false
      clearTimeout(delayDebounceFn)
    }
  }, [searchQuery, activeTab])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <ClientSidebar />
      <ClientTopbar title="Cẩm nang & Dịch vụ" />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto max-w-[1280px] space-y-6">
          {/* Header & Search Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-medium leading-8 text-on-background">Kinh nghiệm chăm sóc & Dịch vụ xe</h2>
              <p className="text-sm text-outline">Tìm hiểu các bí quyết bảo vệ xe hơi từ chuyên gia AutoWash Pro</p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 border-b border-outline-variant pb-px">
            {(['ALL', 'VEHICLE', 'SERVICE'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-outline hover:text-on-surface'
                }`}
              >
                {tab === 'ALL' && 'Tất cả'}
                {tab === 'VEHICLE' && 'Kinh nghiệm chăm sóc'}
                {tab === 'SERVICE' && 'Thông tin dịch vụ'}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto size-10 animate-spin text-primary mb-3" />
              <p className="text-base text-outline">Đang đồng bộ cẩm nang từ server...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto size-12 text-outline mb-3 opacity-60" />
              <p className="text-base text-outline">Không tìm thấy bài viết nào phù hợp.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <UICard
                  key={article.id}
                  className="group overflow-hidden rounded-xl border border-outline-variant bg-surface transition-all duration-300 hover:shadow-lg hover:border-primary/30 flex flex-col h-full cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${
                      article.category === 'VEHICLE' ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}>
                      {article.category === 'VEHICLE' ? 'Chăm sóc xe' : 'Dịch vụ'}
                    </span>
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-base font-semibold leading-6 text-on-surface group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="line-clamp-3 text-sm leading-5 text-outline">
                        {article.summary}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-outline border-t border-outline-variant/50 pt-3">
                      <span className="flex items-center gap-1.5 font-medium">
                        <User className="size-3.5" />
                        {article.author.split(' (')[0]}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {formatDate(article.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </UICard>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-surface border border-outline-variant rounded-2xl shadow-2xl p-6 sm:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute right-4 top-4 p-2 text-outline hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
                aria-label="Đóng"
              >
                <X className="size-5" />
              </button>

              <div className="space-y-6">
                {/* Meta */}
                <div className="space-y-3">
                  <span className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${
                    selectedArticle.category === 'VEHICLE' ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}>
                    {selectedArticle.category === 'VEHICLE' ? 'Kinh nghiệm chăm sóc' : 'Thông tin dịch vụ'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-on-surface leading-snug">
                    {selectedArticle.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-outline border-b border-outline-variant/60 pb-4">
                    <span className="flex items-center gap-1.5">
                      <User className="size-4 text-primary" />
                      Tác giả: <strong>{selectedArticle.author}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4" />
                      Ngày đăng: {formatDate(selectedArticle.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 shadow-inner">
                  <img
                    src={selectedArticle.coverImage}
                    alt={selectedArticle.title}
                    className="size-full object-cover"
                  />
                </div>

                {/* Article Content */}
                <div 
                  className="prose prose-slate max-w-none text-on-surface-variant leading-7 space-y-4"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />

                {/* Footer Action */}
                <div className="flex justify-end border-t border-outline-variant pt-6">
                  <Button
                    onClick={() => setSelectedArticle(null)}
                    variant="outline"
                    className="px-6"
                  >
                    Đóng cẩm nang
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
