use client";
 
import dynamic from "next/dynamic";
 
// Render the app only in the browser. It's a fully interactive, client-side
// app (live prices, charts, state), so there's nothing to prerender on the
// server — this avoids the "Unsupported Server Component" build error.
const RejvenApp = dynamic(() => import("./components/RejvenApp"), { ssr: false });
 
export default function Page() {
  return <RejvenApp />;
}
 