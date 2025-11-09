"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function ClientRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return null;
}

export default ClientRedirect;
