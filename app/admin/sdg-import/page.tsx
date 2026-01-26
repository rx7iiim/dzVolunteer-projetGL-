"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Upload, CheckCircle } from "lucide-react";

export default function SDGImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select an XML file to upload");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("xml_file", file);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/missions/import-sdgs/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || "Failed to import SDGs");
      }

      setSuccess(true);
      setFile(null);
    } catch (err: any) {
      console.error("Error importing SDGs:", err);
      setError(err.message || "An error occurred while importing SDGs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">SDG Import</h1>
        <p className="text-muted-foreground">
          Import Sustainable Development Goals data from an XML file.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import SDGs from XML
          </CardTitle>
          <CardDescription>
            Upload an XML file containing SDG data to import into the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xml-file">XML File</Label>
              <Input
                id="xml-file"
                type="file"
                accept=".xml"
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground">
                Select an XML file containing SDG data
              </p>
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/15 text-green-700 p-4 rounded-md flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>SDGs imported successfully!</span>
              </div>
            )}

            <Button type="submit" disabled={loading || !file}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import SDGs
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}