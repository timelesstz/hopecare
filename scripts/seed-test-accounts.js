/**
 * Seed Test Accounts Script
 * 
 * This script creates test accounts for donors and volunteers in the Supabase database.
 * It's intended for development and testing purposes only.
 * 
 * Usage:
 * 1. Make sure your .env file contains valid Supabase credentials
 * 2. Run: node scripts/seed-test-accounts.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY; // Note: This should be the service key, not the anon key

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test accounts data
const donorAccounts = [
  {
    email: 'john.doe@example.com',
    password: 'Donor2024!',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    role: 'donor',
    status: 'active',
    preferences: {
      interests: ['Education Programs', 'Health Initiatives'],
      preferredCommunication: 'email'
    }
  },
  {
    email: 'sarah.smith@example.com',
    password: 'Giving2024@',
    firstName: 'Sarah',
    lastName: 'Smith',
    phone: '2345678901',
    role: 'donor',
    status: 'active',
    preferences: {
      interests: ['Youth Development', 'Community Building'],
      preferredCommunication: 'both'
    }
  },
  {
    email: 'david.wilson@example.com',
    password: 'Support2024#',
    firstName: 'David',
    lastName: 'Wilson',
    phone: '3456789012',
    role: 'donor',
    status: 'active',
    preferences: {
      interests: ['Economic Empowerment', 'Environmental Projects'],
      preferredCommunication: 'phone'
    }
  }
];

const volunteerAccounts = [
  {
    email: 'emma.parker@example.com',
    password: 'Volunteer2024!',
    firstName: 'Emma',
    lastName: 'Parker',
    phone: '4567890123',
    role: 'volunteer',
    volunteerRole: 'Program Lead',
    status: 'active',
    skills: ['Leadership', 'Project Management', 'Public Speaking'],
    languages: ['English', 'Spanish'],
    availability: {
      weekdays: true,
      weekends: true,
      evenings: false
    }
  },
  {
    email: 'michael.chen@example.com',
    password: 'Community2024@',
    firstName: 'Michael',
    lastName: 'Chen',
    phone: '5678901234',
    role: 'volunteer',
    volunteerRole: 'Event Volunteer',
    status: 'active',
    skills: ['Photography', 'Social Media', 'Customer Service'],
    languages: ['English', 'Mandarin'],
    availability: {
      weekdays: false,
      weekends: true,
      evenings: true
    }
  },
  {
    email: 'sofia.rodriguez@example.com',
    password: 'Helping2024#',
    firstName: 'Sofia',
    lastName: 'Rodriguez',
    phone: '6789012345',
    role: 'volunteer',
    volunteerRole: 'Coordinator',
    status: 'active',
    skills: ['Organization', 'Communication', 'Team Management'],
    languages: ['English', 'Spanish', 'Portuguese'],
    availability: {
      weekdays: true,
      weekends: false,
      evenings: true
    }
  }
];

// Function to create a user in Supabase Auth and add profile data
async function createUser(userData) {
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role
      }
    });

    if (authError) {
      console.error(`Error creating auth user ${userData.email}:`, authError.message);
      return null;
    }

    const userId = authData.user.id;
    console.log(`Created auth user: ${userData.email} (${userId})`);

    // Add user profile data to the appropriate table
    if (userData.role === 'donor') {
      const { error: profileError } = await supabase
        .from('donor_profiles')
        .insert({
          id: userId,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          status: userData.status,
          preferences: userData.preferences
        });

      if (profileError) {
        console.error(`Error creating donor profile for ${userData.email}:`, profileError.message);
      } else {
        console.log(`Created donor profile for: ${userData.email}`);
      }
    } else if (userData.role === 'volunteer') {
      const { error: profileError } = await supabase
        .from('volunteer_profiles')
        .insert({
          id: userId,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          status: userData.status,
          volunteer_role: userData.volunteerRole,
          skills: userData.skills,
          languages: userData.languages,
          availability: userData.availability
        });

      if (profileError) {
        console.error(`Error creating volunteer profile for ${userData.email}:`, profileError.message);
      } else {
        console.log(`Created volunteer profile for: ${userData.email}`);
      }
    }

    return userId;
  } catch (error) {
    console.error(`Unexpected error creating user ${userData.email}:`, error.message);
    return null;
  }
}

// Main function to seed all accounts
async function seedAccounts() {
  console.log('Starting to seed test accounts...');

  // Create donor accounts
  console.log('\nCreating donor accounts:');
  for (const donor of donorAccounts) {
    await createUser(donor);
  }

  // Create volunteer accounts
  console.log('\nCreating volunteer accounts:');
  for (const volunteer of volunteerAccounts) {
    await createUser(volunteer);
  }

  console.log('\nSeeding completed!');
}

// Run the seeding function
seedAccounts()
  .catch(error => {
    console.error('Error in seeding process:', error);
  })
  .finally(() => {
    process.exit(0);
  }); 