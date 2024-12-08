import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Account = () => {
  const [userInfo, setUserInfo] = useState<{
    email: string | null;
    fullName: string | null;
  }>({
    email: null,
    fullName: null,
  });

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        setUserInfo({
          email: user.email,
          fullName: profile?.full_name || null,
        });
      }
    };
    getUserInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-secondary/50 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <Input
                id="fullName"
                value={userInfo.fullName || ''}
                readOnly
                className="bg-gray-700/50 text-white border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                value={userInfo.email || ''}
                readOnly
                className="bg-gray-700/50 text-white border-gray-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;