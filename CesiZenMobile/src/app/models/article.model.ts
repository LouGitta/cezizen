export interface Category {
  id: number;
  name: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  published: string;
  category: number;
  is_favorite: boolean;
}
