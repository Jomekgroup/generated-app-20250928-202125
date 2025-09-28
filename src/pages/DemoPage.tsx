import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export function DemoPage() {
  // This page is part of the original boilerplate and is not used in the Cleenly application.
  // Its content has been removed to resolve build errors caused by outdated type dependencies.
  return (
    <div className="container max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl font-bold">Demo Page</h1>
      <p className="mt-4 text-muted-foreground">This page is a placeholder.</p>
      <Button asChild className="mt-6">
        <Link to="/">Return to Home</Link>
      </Button>
    </div>
  );
}