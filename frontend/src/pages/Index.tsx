// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background">
      <div className="text-center space-y-8 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-elegant">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            RestroMS
          </h1>
          <p className="text-xl text-muted-foreground">Premium admin panel with token authentication</p>
        </div>
        
        <Link to="/admin">
          <Button className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-elegant transition-all duration-300">
            Access Admin Panel
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Demo credentials:</p>
          <p><strong>Email:</strong> admin@example.com</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
