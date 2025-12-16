"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function DemoScrollButton() {
  const handleScrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleScrollToDemo}
      className="group"
    >
      Explore Demo
      <ArrowRight className="ml-2 size-4" />
    </Button>
  );
}
