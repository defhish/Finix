import { BarLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-10">
      <BarLoader width="100%" color="#06b6d4" />
      <p className="mt-4 text-muted-foreground">Loading transaction form...</p>
    </div>
  );
}
