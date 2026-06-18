import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Search, Loader2 } from "lucide-react";
import FamousPeopleGrid from "@/components/FamousPeopleGrid";
import { PageHero } from "@/components/brand/PageHero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FamousPerson } from "@/types/famous";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
    <path d="M25.5 4h4.1L19.7 15.2 30 28h-8.2l-6.4-8.1L8.2 28H4l10.8-12.6L2 4h8.3l5.7 7.5L25.5 4zm-1.4 21.2h2.3L12.6 6.6h-2.4l13.9 18.6z" />
  </svg>
);

const ThemedLoader: React.FC<{ message?: string; subtitle?: string }> = ({
  message = "Loading Famous People",
  subtitle = "Discovering legendary personalities...",
}) => (
  <div className="flex min-h-[300px] items-center justify-center py-8">
    <div className="flex max-w-sm flex-col items-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 p-10 text-center">
      <Loader2 className="mb-4 size-12 animate-spin text-primary" />
      <p className="font-display text-lg font-semibold text-primary">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

// Compact filter pill. forwardRef is required: this project runs React 18,
// where refs don't flow through function components automatically.
const Chip = React.forwardRef<
  HTMLButtonElement,
  { active: boolean; onClick: () => void; children: React.ReactNode }
>(({ active, onClick, children }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "snap-start shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground"
    )}
  >
    {children}
  </button>
));
Chip.displayName = "Chip";

const Famous: React.FC = () => {
  const { t } = useTranslation();
  const [people, setPeople] = useState<FamousPerson[]>([]);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FamousPerson[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const activeChipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/famous/categories")
      .then((res) => res.json())
      .then((data) => setAllCategories(data.categories || []));
  }, []);

  const fetchPeople = async (
    reset = false,
    opts: { search?: string; category?: string } = {}
  ) => {
    const activeSearch = opts.search !== undefined ? opts.search : search;
    const activeCategory = opts.category !== undefined ? opts.category : category;
    const pageOffset = reset ? 0 : offset;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", PAGE_SIZE.toString());
      params.set("offset", pageOffset.toString());
      if (activeSearch) params.set("search", activeSearch);
      if (activeCategory) params.set("category", activeCategory);
      const res = await fetch(`/api/famous?${params.toString()}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      const rows: FamousPerson[] = data.data || [];
      if (reset) setPeople(rows);
      else setPeople((prev) => [...prev, ...rows]);
      setOffset(pageOffset + PAGE_SIZE);
      setTotal(data.total || 0);
      setHasMore(
        (reset ? rows.length : people.length + rows.length) < (data.total || 0)
      );
      setError(null);
    } catch {
      setError("Could not load famous people. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Single source of truth for fetching: handles initial load, category change,
  // and debounced search. Avoids the previous double-fetch on mount/category.
  useEffect(() => {
    if (!search) {
      setSearchLoading(false);
      fetchPeople(true, { search: "", category });
      return;
    }
    setSearchLoading(true);
    const id = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set("search", search);
        if (category) params.set("category", category);
        params.set("limit", PAGE_SIZE.toString());
        params.set("offset", "0");
        const res = await fetch(`/api/famous?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        setSearchResults(data.data || []);
        setTotal(data.total || 0);
        setError(null);
      } catch {
        setSearchResults([]);
        setError("Search failed. Please try again.");
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [search, category]);

  const categories = allCategories;
  const filtered = search ? searchResults : people;

  // Keep the active category chip visible — on mobile it can sit offscreen
  // in the horizontal scroll once selected.
  useEffect(() => {
    activeChipRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [category]);

  return (
    <>
      <Helmet>
        <title>{t("seo.famous.title")} | BaziGPT</title>
        <meta name="description" content={t("seo.famous.description")} />
        <meta property="og:title" content={`${t("seo.famous.title")} | BaziGPT`} />
        <meta property="og:description" content={t("seo.famous.description")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bazigpt.io/famous" />
        <meta property="og:image" content="https://www.bazigpt.io/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t("seo.famous.title")} | BaziGPT`} />
        <meta name="twitter:description" content={t("seo.famous.description")} />
        <meta name="twitter:image" content="https://www.bazigpt.io/og-image.png" />
        <link rel="canonical" href="https://www.bazigpt.io/famous" />
      </Helmet>

      <div className="mx-auto max-w-6xl">
        <PageHero
          size="compact"
          showMark={false}
          eyebrow={t("hero.famousEyebrow")}
          title={t("famous.title")}
          subtitle={t("famous.subtitle")}
        />
        <p className="mx-auto -mt-4 mb-8 max-w-3xl text-center text-xs italic leading-relaxed text-muted-foreground/70">
          {t("famous.disclaimer")} {t("famous.disclaimerContact")}
        </p>

        {/* Search */}
        <div className="mb-4 flex justify-center">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("famous.searchCelebrity")}
              aria-label="search famous people"
              className="pl-9"
            />
          </div>
        </div>

        {/* Category chip row — horizontally scrollable on mobile with an
            edge-fade mask hinting at off-screen filters. */}
        <div
          className={cn(
            "mb-3 flex gap-2 overflow-x-auto pb-2 snap-x",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            "[mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]"
          )}
        >
          <Chip
            ref={!category ? activeChipRef : undefined}
            active={!category}
            onClick={() => setCategory("")}
          >
            {t("famous.all")}
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat}
              ref={category === cat ? activeChipRef : undefined}
              active={category === cat}
              onClick={() => setCategory(cat!)}
            >
              {t(`famous.categories.${cat}`) || cat}
            </Chip>
          ))}
        </div>

        {/* Result count — quiet feedback, especially when a filter is active */}
        {!loading && !searchLoading && !error && filtered.length > 0 && (
          <p className="mb-6 px-1 text-xs text-muted-foreground">
            {total} {total === 1 ? t("famous.result") : t("famous.results")}
          </p>
        )}

        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="font-semibold"
              onClick={() => fetchPeople(true, { search: "", category })}
            >
              Retry
            </Button>
          </div>
        ) : search ? (
          searchLoading ? (
            <ThemedLoader
              message="Searching Famous People"
              subtitle="Finding matching personalities..."
            />
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center gap-4">
              <p className="text-center text-lg text-muted-foreground">
                {t("famous.noResultsFound")} "{search}".
                <br />
                {t("famous.requestReadingMessage")}
              </p>
              <Button asChild className="gap-2 font-semibold">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `@bazigpt Please add a Bazi reading for "${search}"! #BaziGPT`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <XIcon className="size-4" />
                  {t("famous.requestReadingButton")} "{search}"{" "}
                  {t("famous.requestReadingOnX")}
                </a>
              </Button>
            </div>
          ) : (
            <FamousPeopleGrid people={filtered} />
          )
        ) : loading ? (
          <ThemedLoader />
        ) : (
          <>
            <FamousPeopleGrid people={filtered} />
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => fetchPeople(false)}
                  disabled={loadingMore}
                  className="gap-2 font-semibold"
                >
                  {loadingMore && <Loader2 className="size-4 animate-spin" />}
                  {loadingMore ? t("famous.loading") : t("famous.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Famous;
