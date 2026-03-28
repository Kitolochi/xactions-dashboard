import dynamic from "next/dynamic";

const AccountDetail = dynamic(() => import("@/components/pages/account-detail"), {
  ssr: false,
});

export default function Page() {
  return <AccountDetail />;
}
