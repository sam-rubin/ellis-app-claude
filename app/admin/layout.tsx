import Link from "next/link";
import { logout } from "@/app/login/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/15">
        <Link href="/admin" className="font-semibold">
          Church Admin
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            Sign out
          </button>
        </form>
      </header>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
