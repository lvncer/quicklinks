export interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  domain: string;
  og_image: string;
  page_url: string;
  note: string;
  tags: string[];
  user_id: string;
  saved_at: string;
  published_at?: string;
}

export interface LinksResponse {
  links: Link[];
}
