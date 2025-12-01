export interface Link {
  id: string;
  url: string;
  title: string;
  domain: string;
  page_url: string;
  note: string;
  user_identifier: string;
  saved_at: string; // APIからはISO文字列で返ってくる
}

export interface GetLinksResponse {
  links: Link[];
}
