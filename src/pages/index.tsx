import Head from "next/head";
import MagnifierView from "@/components/MagnifierView";

export default function Home() {
  return (
    <>
      <Head>
        <title>Magnifyer</title>
        <meta
          name="description"
          content="A simple PWA magnifier with flashlight and zoom control."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Fullscreen App Container */}
      <main className="w-full h-screen overflow-hidden bg-black text-white">
        <MagnifierView />
      </main>
    </>
  );
}
