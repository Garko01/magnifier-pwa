import Head from "next/head";
import MagnifierView from "../components/MagnifierView";

/**
 * Home Page – clean, fullscreen entry for the Magnifyer PWA
 */
export default function Home() {
  return (
    <>
      <Head>
        <title>Magnifyer</title>
        <meta name="description" content="Simple magnifier with torchlight and zoom control." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <MagnifierView />

        <footer className="absolute bottom-2 text-gray-500 text-sm select-none">
          © {new Date().getFullYear()} Garko01
        </footer>
      </main>
    </>
  );
}
