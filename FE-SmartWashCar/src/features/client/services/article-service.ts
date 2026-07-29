import { authorizeAxios } from '@/shared/lib/api-client'

export interface Article {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  coverImage: string
  category: 'VEHICLE' | 'SERVICE'
  status: 'DRAFT' | 'PUBLISHED'
  author: string
  createdAt: string
  updatedAt: string
}

export const articleService = {
  async getClientArticles(category?: string, search?: string): Promise<Article[]> {
    const params: Record<string, string> = {}
    if (category && category !== 'ALL') {
      params.category = category
    }
    if (search) {
      params.search = search
    }
    const { data } = await authorizeAxios.get<Article[]>('/articles', { params })
    return data
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const { data } = await authorizeAxios.get<Article>(`/articles/${slug}`)
    return data
  },

  async getArticleById(id: string): Promise<Article> {
    const { data } = await authorizeAxios.get<Article>(`/articles/detail/${id}`)
    return data
  }
}
