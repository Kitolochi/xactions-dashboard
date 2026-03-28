import dynamic from "next/dynamic";

const Watchlist = dynamic(() => import("@/components/pages/watchlist"), {
  ssr: false,
});

export default function Page() {
  return <Watchlist />;
}
