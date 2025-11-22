import { Suspense, lazy } from "react";
// import dynamic from "next/dynamic";

import Header from "@/components/Header";
import ServerDetail from "@/components/ServerDetail";

const ClientDetail = lazy(
  () =>
    new Promise<typeof import("@/components/ClientDetail")>((resolve) =>
      setTimeout(() => {
        resolve(import("@/components/ClientDetail"));
      }, 3000)
    )
);

export default function Home() {
  return (
    <>
      <Header />
      <Suspense fallback={<div>Loading ServerDetail...</div>}>
        <ServerDetail />
      </Suspense>
      <Suspense fallback={<div>Loading ClientDetail...</div>}>
        <ClientDetail />
      </Suspense>
    </>
  );
}
