/**
 * Create users in Supabase Auth and profiles
 * 
 * Run: node scripts/create-users.js
 * Make sure backend/.env has SUPABASE_SERVICE_ROLE_KEY
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://ngxlniymmmmkijefhjbm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser(email, password, fullName, role) {
  try {
    console.log(`\n📝 Creating ${role}: ${email}...`);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      // If user already exists, get existing user
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        console.log(`⚠️  User ${email} already exists, getting user...`);
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingUser = usersData.users.find(u => u.email === email);
        if (existingUser) {
          authData.user = existingUser;
          console.log(`✅ Found existing user: ${existingUser.id}`);
        } else {
          throw authError;
        }
      } else {
        throw authError;
      }
    } else {
      console.log(`✅ User created in Auth: ${authData.user.id}`);
    }

    if (!authData.user) {
      throw new Error('Failed to get/create user in Auth');
    }

    // Create or update profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    console.log(`✅ Profile created/updated: ${profileData.email} (${profileData.role})`);
    return { user: authData.user, profile: profileData };
  } catch (error) {
    console.error(`❌ Error creating ${role} (${email}):`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Creating users in database...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Create Admin
    await createUser('wiwik@unp.id', 'wr77hs20', 'Wiwik', 'admin');

    // Create Mahasiswa
    await createUser('hasfi@unp.id', 'hasfi123', 'Muhammad Hasfi Rasya', 'mahasiswa');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN/DOSEN:');
    console.log('  📧 Email: wiwik@unp.id');
    console.log('  🔑 Password: wr77hs20');
    console.log('\nMAHASISWA:');
    console.log('  📧 Email: hasfi@unp.id');
    console.log('  🔑 Password: hasfi123');
    console.log('  👤 Full Name: Muhammad Hasfi Rasya');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Login at: http://localhost:3000/login');
  } catch (error) {
    console.error('\n❌ Failed to create users:', error.message);
    console.error('\n💡 Tip: Make sure SUPABASE_SERVICE_ROLE_KEY is set in backend/.env');
    process.exit(1);
  }
}

main();
