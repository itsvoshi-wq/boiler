import { TopTape } from "@/components/shell/TopTape";
import { FloorNav } from "@/components/shell/FloorNav";
import { FloorFooter } from "@/components/shell/FloorFooter";
import { Providers } from "@/components/providers/Providers";

export default function FloorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="tex-grain relative min-h-screen">
        <TopTape />
        <FloorNav />
        <main id="main" className="mx-auto max-w-[1800px]">
          {children}
        </main>
        <FloorFooter />
      </div>
    </Providers>
  );
}
