import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold">Church Member Records</h1>
      <p className="max-w-md text-sm text-black/60 dark:text-white/60">
        Member directory, monthly subscriptions, and payment receipts.
        This area is restricted to church administrators.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Admin sign in
      </Link>
    </main>
  );
}
