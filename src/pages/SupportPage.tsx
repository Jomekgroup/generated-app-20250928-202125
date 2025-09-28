import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
export function SupportPage() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/api/support', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success("Your message has been sent!", {
        description: "Our support team will get back to you shortly.",
      });
      setFormData({
        ...formData,
        subject: '',
        message: '',
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-gray-50/50 dark:bg-black/50 min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-auto text-primary" />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Contact Support
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Have a question or need help? Fill out the form below.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>We typically respond within 24 hours.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} required disabled={loading} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={formData.subject} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={6} value={formData.message} onChange={handleChange} required disabled={loading} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Message
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}