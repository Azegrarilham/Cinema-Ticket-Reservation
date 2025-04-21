import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkItem[];
}

const Pagination = ({ links }: PaginationProps) => {
    // Don't render pagination if there are no links or only one page
    if (!links || links.length <= 3) {
        return null;
    }

    // Filter out the "Next" and "Previous" specific links
    const pageLinks = links.filter((link) => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;');

    const prevLink = links.find((link) => link.label === '&laquo; Previous');
    const nextLink = links.find((link) => link.label === 'Next &raquo;');

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between border-t border-border bg-background px-4 py-3 sm:px-6 rounded-md">
                <div className="flex flex-1 justify-between sm:hidden">
                    {prevLink && prevLink.url ? (
                        <Link
                            href={prevLink.url}
                            className="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            Previous
                        </Link>
                    ) : (
                        <span className="relative inline-flex items-center rounded-md border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed">
                            Previous
                        </span>
                    )}

                    {nextLink && nextLink.url ? (
                        <Link
                            href={nextLink.url}
                            className="relative ml-3 inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            Next
                        </Link>
                    ) : (
                        <span className="relative ml-3 inline-flex items-center rounded-md border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed">
                            Next
                        </span>
                    )}
                </div>

                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-foreground">
                            Showing page <span className="font-medium">{pageLinks.find((link) => link.active)?.label || '1'}</span> of{' '}
                            <span className="font-medium">{pageLinks.length}</span> pages
                        </p>
                    </div>

                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            {prevLink && (
                                <Link
                                    href={prevLink.url || '#'}
                                    className={`relative inline-flex items-center rounded-l-md border border-border px-2 py-2 text-sm font-medium ${prevLink.url ? 'bg-card text-foreground hover:bg-muted transition-colors' : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                    aria-disabled={!prevLink.url}
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                </Link>
                            )}

                            {pageLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.url || '#'}
                                    className={`relative inline-flex items-center border border-border px-4 py-2 text-sm font-medium transition-colors ${link.active
                                            ? 'z-10 bg-primary border-primary text-primary-foreground'
                                            : link.url
                                                ? 'bg-card text-foreground hover:bg-muted'
                                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                    aria-current={link.active ? 'page' : undefined}
                                    aria-disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}

                            {nextLink && (
                                <Link
                                    href={nextLink.url || '#'}
                                    className={`relative inline-flex items-center rounded-r-md border border-border px-2 py-2 text-sm font-medium ${nextLink.url ? 'bg-card text-foreground hover:bg-muted transition-colors' : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                    aria-disabled={!nextLink.url}
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
