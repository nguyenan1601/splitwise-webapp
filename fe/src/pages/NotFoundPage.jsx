import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "../components/ui";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="text-2xl font-semibold text-slate-900 mt-4">
          Page not found
        </h2>
        <p className="text-slate-600 mt-2 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved or deleted.
        </p>
        <Link to="/" className="inline-block mt-8">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export { NotFoundPage };
