import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentLoginPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !studentId) {
      setError("Please enter both name and student ID");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("POST", "/api/students/login", { name, studentId });
      // on success, redirect to student portal
      setLocation("/student-portal");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="Faith Immaculate Academy" className="w-24 h-24" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Faith Immaculate Academy</h1>
            <p className="text-muted-foreground text-center mb-8">Student Portal Login</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="name">Student Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div className="mb-6">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your student ID"
                  className="mt-1"
                />
              </div>
              {error && <p className="text-destructive text-center mb-4">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
