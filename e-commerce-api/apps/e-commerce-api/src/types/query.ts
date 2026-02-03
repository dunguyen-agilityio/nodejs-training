export type Params = {
  query: string;
  page: number;
  pageSize: number;
  categories: string[];
};

export type Pagination = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};
