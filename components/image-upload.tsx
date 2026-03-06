'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Link as LinkIcon, X, Loader2, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value: string | null
  imageType: 'upload' | 'external' | null
  onChange: (url: string | null, type: 'upload' | 'external' | null) => void
}

export function ImageUpload({ value, imageType, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [externalUrl, setExternalUrl] = useState(imageType === 'external' ? value || '' : '')
  const [activeTab, setActiveTab] = useState<string>(imageType === 'external' ? 'url' : 'upload')

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onChange(data.url, 'upload')
    } catch (err) {
      const error = err as Error
      setError(`Upload failed: ${error.message}\n\nStack: ${error.stack || 'No stack trace'}`)
    } finally {
      setIsUploading(false)
    }
  }, [onChange])

  const handleUrlSubmit = useCallback(() => {
    setError(null)
    
    if (!externalUrl.trim()) {
      onChange(null, null)
      return
    }

    // Basic URL validation
    try {
      new URL(externalUrl)
      onChange(externalUrl, 'external')
    } catch {
      setError(`Invalid URL: ${externalUrl}\n\nPlease enter a valid URL starting with http:// or https://`)
    }
  }, [externalUrl, onChange])

  const handleRemove = useCallback(() => {
    onChange(null, null)
    setExternalUrl('')
    setError(null)
  }, [onChange])

  return (
    <div className="space-y-4">
      <Label>Recipe Image</Label>
      
      {value ? (
        <div className="relative rounded-lg overflow-hidden border">
          <div className="relative aspect-video">
            <Image
              src={value}
              alt="Recipe preview"
              fill
              className="object-cover"
              unoptimized={imageType === 'external'}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs">
            {imageType === 'upload' ? 'Uploaded' : 'External URL'}
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              External URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </>
                )}
              </label>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="mt-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
              <Button type="button" onClick={handleUrlSubmit}>
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Paste a direct link to an image from the web
            </p>
          </TabsContent>
        </Tabs>
      )}
      
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive font-medium">Error</p>
          <pre className="mt-1 text-xs text-destructive whitespace-pre-wrap break-words">{error}</pre>
        </div>
      )}
    </div>
  )
}
