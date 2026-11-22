import Link from "next/link";
import type { PaginationMeta } from "@/types/store";

type PaginationProps = {
  pagination: PaginationMeta;
  hrefForPage: (page: number) => string;
};

export function Pagination({ pagination, hrefForPage }: PaginationProps) {
  if (pagination.totalPages <= 1) return null;

  const prev = pagination.page > 1 ? pagination.page - 1 : null;
  const next = pagination.page < pagination.totalPages ? pagination.page + 1 : null;

  return (
    <nav className="pagination" aria-label="Catalog pages">
      {prev ? (
        <Link href={hrefForPage(prev)} className="pagination-link">
          Previous
        </Link>
      ) : (
        <span className="pagination-link is-disabled">Previous</span>
      )}
      <span className="pagination-status">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      {next ? (
        <Link href={hrefForPage(next)} className="pagination-link">
          Next
        </Link>
      ) : (
        <span className="pagination-link is-disabled">Next</span>
      )}
    </nav>
  );
}
