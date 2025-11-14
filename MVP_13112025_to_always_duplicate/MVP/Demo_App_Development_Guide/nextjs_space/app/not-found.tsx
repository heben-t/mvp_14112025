import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Home, Search, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 p-4">
      <Card className="max-w-2xl w-full border-none shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <FileQuestion className="h-10 w-10 text-white" />
          </div>
          <div className="mb-4">
            <p className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-2">404</p>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Page Not Found</CardTitle>
          <CardDescription className="text-lg mt-3">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group" size="lg">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 border-2" size="lg">
              <Link href="/discover">
                <Search className="h-4 w-4 mr-2" />
                Browse Startups
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-600 text-center mb-4">Quick Links:</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/pricing" className="text-sm text-blue-600 hover:text-blue-700 text-center py-2 hover:bg-blue-50 rounded-lg transition-colors">
                Pricing
              </Link>
              <Link href="/#team" className="text-sm text-blue-600 hover:text-blue-700 text-center py-2 hover:bg-blue-50 rounded-lg transition-colors">
                Team
              </Link>
              <Link href="/#features" className="text-sm text-blue-600 hover:text-blue-700 text-center py-2 hover:bg-blue-50 rounded-lg transition-colors">
                Features
              </Link>
              <Link href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-700 text-center py-2 hover:bg-blue-50 rounded-lg transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
