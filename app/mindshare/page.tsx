import dynamic from "next/dynamic";

const Mindshare = dynamic(() => import("@/components/pages/mindshare"), {
  ssr: false,
});

export default function Page() {
  return <Mindshare />;
}
