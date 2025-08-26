#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create Admin User for PDFTablePro
Creates an admin user with Professional tier access for testing paid features
"""

import os
import sys
from supabase import create_client, Client
from datetime import datetime
import uuid

# Supabase configuration
SUPABASE_URL = "https://unccnmynqxjwxhrdnpzz.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuY2NubXlucXhqd3hocmRucHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM5NzQ3OSwiZXhwIjoyMDcwOTczNDc5fQ.OGP-inkjLM13PV7NWSigclBVGx4C2I1EHWOgkjSQcbE"

def main():
    print("Creating Admin User for PDFTablePro...")
    
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    try:
        # First, check the user_profiles table structure
        print("\nChecking user_profiles table structure...")
        result = supabase.table('user_profiles').select('*').limit(1).execute()
        print(f"Table exists with {len(result.data)} records")
        
        # Create admin user credentials
        admin_email = "admin@pdf2excel.app"
        admin_password = "AdminTest2025!"
        
        print(f"\nCreating admin user: {admin_email}")
        
        # Create the user in Supabase Auth
        auth_response = supabase.auth.admin.create_user({
            "email": admin_email,
            "password": admin_password,
            "email_confirm": True,
            "user_metadata": {
                "name": "PDF2Excel Admin",
                "role": "admin"
            }
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"Auth user created with ID: {user_id}")
            
            # Create user profile with Professional tier
            profile_data = {
                "id": user_id,
                "tier": "professional",
                "pages_used_today": 0,
                "pages_used_month": 0,
                "last_reset_date": datetime.now().date().isoformat(),
                "created_at": datetime.now().isoformat()
            }
            
            # Insert into user_profiles table
            profile_response = supabase.table('user_profiles').insert(profile_data).execute()
            
            if profile_response.data:
                print(f"User profile created with Professional tier")
                print(f"Email: {admin_email}")
                print(f"Password: {admin_password}")
                print(f"Tier: Professional (1,500 pages/month)")
                print(f"Features: OCR, Batch processing, API access, Priority processing")
                
                print(f"\nAdmin user ready for testing at: https://www.pdf2excel.app")
                print(f"Test paid features:")
                print(f"   - OCR for scanned PDFs")
                print(f"   - Higher rate limits (150/day vs 5/day)")
                print(f"   - Batch processing")
                print(f"   - Priority processing (<15s)")
                print(f"   - All export formats")
                
            else:
                print("Failed to create user profile")
                print(f"Error: {profile_response}")
                
        else:
            print("Failed to create auth user")
            print(f"Error: {auth_response}")
            
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")
        
        # If user already exists, just update the profile
        print(f"\nAttempting to update existing user profile...")
        try:
            # Try to find existing user by email
            users = supabase.auth.admin.list_users()
            admin_user = None
            
            for user in users:
                if user.email == admin_email:
                    admin_user = user
                    break
                    
            if admin_user:
                print(f"Found existing user: {admin_user.id}")
                
                # Update profile to Professional tier
                update_response = supabase.table('user_profiles').upsert({
                    "id": admin_user.id,
                    "tier": "professional",
                    "pages_used_today": 0,
                    "pages_used_month": 0,
                    "last_reset_date": datetime.now().date().isoformat()
                }).execute()
                
                if update_response.data:
                    print(f"Updated user to Professional tier")
                    print(f"Email: {admin_email}")
                    print(f"Password: {admin_password}")
                    print(f"Tier: Professional")
                else:
                    print(f"Failed to update profile: {update_response}")
            else:
                print(f"Could not find or create user")
                
        except Exception as update_error:
            print(f"Update failed: {str(update_error)}")
            return False
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print(f"\nAdmin user setup completed successfully!")
    else:
        print(f"\nAdmin user setup failed!")
        sys.exit(1)