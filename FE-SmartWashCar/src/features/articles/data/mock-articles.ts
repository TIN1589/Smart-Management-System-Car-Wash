
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

export const mockArticles: Article[] = [];