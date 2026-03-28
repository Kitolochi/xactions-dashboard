import dynamic from "next/dynamic";

const Topics = dynamic(() => import("@/components/pages/topics"), {
  ssr: false,
});

export default function Page() {
  return <Topics />;
}
