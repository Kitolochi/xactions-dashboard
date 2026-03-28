import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Page not found</h2>
      <Link href="/" className="text-blue-400 hover:text-blue-300">
        Back to dashboard
      </Link>
    </div>
  );
}
