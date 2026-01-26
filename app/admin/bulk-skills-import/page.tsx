"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Upload, CheckCircle } from "lucide-react";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

export default function BulkSkillsImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(
        `${APIURL}/api/volunteer-skills/bulk_import/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.error || "Failed to import skills",
        );
      }

      const data = await response.json();
      setResult(data);
      setSuccess(true);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        "skills-file",
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err: any) {
      console.error("Error importing skills:", err);
      setError(err.message || "An error occurred while importing skills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Bulk Skills Import
        </h1>
        <p className="text-muted-foreground">
          Import multiple volunteer skills from a file.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Skills from File
          </CardTitle>
          <CardDescription>
            Upload a file containing multiple skills to import into the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skills-file">Skills File</Label>
              <Input
                id="skills-file"
                type="file"
                accept=".csv,.xlsx,.json"
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground">
                Upload a CSV, Excel, or JSON file containing skills data
              </p>
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/15 text-green-700 p-4 rounded-md flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <span className="font-medium">
                    Skills imported successfully!
                  </span>
                  {result && (
                    <div className="text-sm mt-1">
                      {result.imported_count !== undefined && (
                        <p>Imported: {result.imported_count} skills</p>
                      )}
                      {result.failed_count !== undefined &&
                        result.failed_count > 0 && (
                          <p>Failed: {result.failed_count} skills</p>
                        )}
                    </div>
                  )}
                </div>
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
                  Import Skills
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
