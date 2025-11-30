x# CCAT File Management Setup Guide

This guide will help you set up the file management system for your CCAT project using Next.js and Supabase.

## Prerequisites

- Supabase project created
- Next.js app with Supabase template initialized
- Environment variables configured

## 1. Database Setup

### Create the Files Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create files table
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX files_user_id_idx ON files(user_id);
CREATE INDEX files_created_at_idx ON files(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own files" ON files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON files
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Create Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `user-files`
3. Make it **private** (not public)
4. Go to Storage > Policies and add these policies:

```sql
-- Policy for uploading files (users can upload to their own folder)
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for viewing files (users can view their own files)
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for deleting files (users can delete their own files)
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 2. Fix API Routes

### Update Environment Variables

Make sure you have these in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Fix the DELETE Route

The file `/app/api/files/[id]/route.ts` has incorrect storage deletion syntax. 

**Current (incorrect):**
```javascript
const { error: storageError } = await supabase
  .from("user-files")
  .remove([file.path] as any);
```

**Should be:**
```javascript
const { error: storageError } = await supabase.storage
  .from("user-files")
  .remove([file.path]);
```

## 3. File Structure

Your file management system includes:

- `app/api/files/route.ts` - GET (list files) and POST (upload file)
- `app/api/files/[id]/route.ts` - DELETE file
- `app/files/page.tsx` - Protected page for file management
- `components/FileManager.tsx` - React component for file operations

## 4. Features Implemented

### File Upload
- Drag & drop or click to select files
- Automatic file organization by user ID
- Metadata storage in database
- File storage in Supabase Storage

### File Management
- List all user files with metadata
- Download files
- Delete files (removes from both storage and database)
- File size formatting
- MIME type display

### Security
- Row Level Security (RLS) policies
- User-based file isolation
- Server-side authentication
- Protected API routes

## 5. Usage

1. Navigate to `/files` after signing in
2. Upload files using the file input
3. View your uploaded files in the list
4. Download or delete files as needed

## 6. File Organization

Files are organized in storage as: `{user_id}/{uuid}.{extension}`

This ensures:
- No file name conflicts
- User isolation
- Secure access patterns

## 7. Testing

To test the system:

1. Sign up/Sign in to your app
2. Go to `/files`
3. Try uploading different file types
4. Test download functionality
5. Test delete functionality

## 8. Next Steps

Consider adding:
- File sharing between users
- File versioning
- Folder organization
- File preview capabilities
- Bulk operations
- Search functionality
- File access logs

## Troubleshooting

### Common Issues

1. **Authentication errors**: Ensure you're using the server-side Supabase client for API routes
2. **Storage permission errors**: Check your RLS policies and bucket policies
3. **File upload failures**: Verify bucket exists and is properly configured
4. **Download failures**: Ensure user has permission to access the file

### Debug Tips

- Check browser network tab for API responses
- Check Supabase logs for detailed error messages
- Verify environment variables are correct
- Test policies in Supabase SQL editor
