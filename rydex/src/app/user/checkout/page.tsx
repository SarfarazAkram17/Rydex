import CheckOutContent from "@/components/CheckOutContent";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="bg-black w-fulll h-screen flex justify-center items-center text-white animate-pulse">
          Loading...
        </div>
      }
    >
      <CheckOutContent />
    </Suspense>
  );
};

export default Page;
