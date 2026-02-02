# Quick Supabase Configuration Guide

## Your Supabase Details
- **Project URL**: https://ngxlniymmmmkijefhjbm.supabase.co
- **Anon Key**: sb_publishable_j5ChkdsoOLSF9otCH5lZog_6F5V78C7

## Step 1: Get Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Find **service_role** key (it's secret, starts with `eyJ...`)
5. Copy it - you'll need it for the backend

## Step 2: Configure Environment Files

I'll create the environment files for you. You just need to add the service_role key.

## Step 3: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the entire contents of `database/schema.sql`
3. Paste and click **Run**
4. Verify tables are created in **Table Editor**

## Step 4: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `modules`
4. Set it to **Public** (for now, can secure later)
5. Click **Create bucket**

## Step 5: Get Gemini API Key (Optional for now)

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy it for later
