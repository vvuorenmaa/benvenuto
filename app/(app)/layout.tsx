import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex flex-1 flex-col min-h-0 pb-16 md:pb-0">{children}</div>
    </div>
  );
}
