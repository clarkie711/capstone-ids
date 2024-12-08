import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { userSchema, UserFormValues } from "./userManagementSchema";
import { UserFormFields } from "./UserFormFields";

interface UserCreationFormProps {
  onUserCreated: () => void;
}

export const UserCreationForm = ({ onUserCreated }: UserCreationFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: "",
      username: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsLoading(true);
      
      const { data: result, error } = await supabase.rpc('create_new_user', {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        username: data.username,
        role: data.role
      });

      if (error) {
        // Check if the error is a duplicate email error
        if (error.message.includes('duplicate key value') && error.message.includes('email')) {
          toast({
            title: "Error",
            description: "This email address is already registered. Please use a different email.",
            variant: "destructive",
          });
          return;
        }
        
        // Check if the error is a duplicate username error
        if (error.message.includes('duplicate key value') && error.message.includes('username')) {
          toast({
            title: "Error",
            description: "This username is already taken. Please choose a different username.",
            variant: "destructive",
          });
          return;
        }
        
        // Handle other errors
        throw error;
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });

      form.reset();
      onUserCreated(); // This will trigger the user list refresh
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <UserFormFields form={form} isLoading={isLoading} />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  );
};