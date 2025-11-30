# Storage Setup Guide (UI-Based)

Since the SQL approach fails due to permissions on the `storage.objects` table, follow these UI-based steps:

## Step 1: Create the Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Enter bucket name: `user-files`
5. **IMPORTANT**: Make sure it's set to **Private** (not Public)
6. Click **Create Bucket**

## Step 2: Set Up Storage Policies

1. Still in the **Storage** section, click on **Policies** tab
2. You should see your `user-files` bucket listed
3. Click **New Policy** for the `user-files` bucket

### Policy 1: Upload Policy
- **Policy Name**: `Users can upload own files`
- **Allowed Operations**: `INSERT`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
(bucket_id = 'user-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

### Policy 2: Select/Download Policy  
- **Policy Name**: `Users can view own files`
- **Allowed Operations**: `SELECT`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
(bucket_id = 'user-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

### Policy 3: Delete Policy
- **Policy Name**: `Users can delete own files`
- **Allowed Operations**: `DELETE`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
(bucket_id = 'user-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

### Policy 4: Update Policy (Optional)
- **Policy Name**: `Users can update own files`
- **Allowed Operations**: `UPDATE`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
(bucket_id = 'user-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

## Step 3: Create the Database Table

Run this in the SQL Editor (this will work since it's your database):

```sql
-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS files_user_id_idx ON files(user_id);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON files(created_at DESC);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Database policies
CREATE POLICY "Users can view own files" ON files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON files
  FOR DELETE USING (auth.uid() = user_id);

-- Updated trigger
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

## Step 4: Test the Setup

1. Visit `/api/debug/storage` in your browser
2. Check that all tests pass:
   - User authentication ✓
   - Bucket access ✓
   - Upload test ✓

## Important Notes

- The storage policies use `storage.foldername(name)[1]` to extract the first folder from the file path
- All files (including avatars) are stored as `{user_id}/{filename}` so each user has their own folder
- All policies check that the user can only access files in their own folder
- The `authenticated` role means only logged-in users can access the storage

## Troubleshooting

If you still get RLS errors:

1. **Double-check bucket name**: Must be exactly `user-files`
2. **Verify policies are active**: They should show as "Enabled" in the dashboard
3. **Check user authentication**: Visit `/api/debug/storage` to see auth status
4. **Policy syntax**: Make sure there are no typos in the policy definitions
5. **File structure**: All files including avatars go in `{user_id}/` folders for security

## Alternative: Temporarily Disable RLS (NOT RECOMMENDED FOR PRODUCTION)

If you need to test quickly, you can temporarily disable RLS on storage:

1. Go to Storage → Settings
2. Turn off "Enable RLS" for the `user-files` bucket
3. **REMEMBER TO TURN IT BACK ON** after testing

This is NOT secure and should only be used for debugging!