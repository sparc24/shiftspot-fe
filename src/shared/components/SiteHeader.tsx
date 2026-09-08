import { Link } from "react-router-dom";

interface SiteHeaderProps {
  backTo?: string;
  backLabel?: string;
  current?: "home" | "worker" | "seeker";
}

export function SiteHeader({
  backTo,
  backLabel,
  current = "home",
}: SiteHeaderProps) {
  return (
    <header className="site-header sticky top-0 z-20">
      <div className="page-container flex min-h-[4.5rem] items-center justify-between gap-6">
        <Link to="/" className="brand-mark" aria-label="SkillMatch home">
          SkillMatch
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 md:flex"
        >
          <Link
            to="/"
            className={`text-sm font-semibold transition-colors ${current === "home" ? "text-blue-700" : "text-gray-600 hover:text-blue-700"}`}
          >
            Home
          </Link>
          <Link
            to="/seeker/search"
            className={`text-sm font-semibold transition-colors ${current === "seeker" ? "text-blue-700" : "text-gray-600 hover:text-blue-700"}`}
          >
            Find a worker
          </Link>
          <Link
            to="/worker/register"
            className={`text-sm font-semibold transition-colors ${current === "worker" ? "text-blue-700" : "text-gray-600 hover:text-blue-700"}`}
          >
            List your skills
          </Link>
        </nav>

        {backTo && backLabel ? (
          <Link
            to={backTo}
            className="text-sm font-semibold text-gray-600 transition-colors hover:text-blue-700"
          >
            {backLabel}
          </Link>
        ) : (
          <span className="hidden rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 sm:inline-flex">
            Direct contact marketplace
          </span>
        )}
      </div>
    </header>
  );
}
