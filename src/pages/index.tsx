import MagnifierView from "../components/MagnifierView";
import TorchButton from "../components/TorchButton";

/**
 * Home Page – combines the Magnifier and TorchButton components
 * in a clean, senior-friendly layout.
 */
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mt-6 mb-4">
        🔍 Magnifier + Torchlight
      </h1>

      <div className="w-full flex flex-col items-center">
        <MagnifierView />
        <TorchButton />
      </div>

      <footer className="mt-8 mb-4 text-gray-400 text-base">
        <p>© {new Date().getFullYear()} Garko01</p>
      </footer>
    </main>
  );
}
