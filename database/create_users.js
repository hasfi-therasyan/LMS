/**
 * Script to create users in Supabase Auth and profiles
 * 
 * Run: node database/create_users.js
 * 
 * Make sure to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env');
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
      email_confirm: true, // Auto confirm email
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user in Auth');
    }

    console.log(`✅ User created in Auth: ${authData.user.id}`);

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: role
      })
      .select()
      .single();

    if (profileError) {
      // If profile already exists, update it
      if (profileError.code === '23505') {
        console.log('⚠️  Profile already exists, updating...');
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({
            email: email,
            full_name: fullName,
            role: role
          })
          .eq('id', authData.user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }
        console.log(`✅ Profile updated: ${updateData.email}`);
        return { user: authData.user, profile: updateData };
      }
      throw profileError;
    }

    console.log(`✅ Profile created: ${profileData.email} (${profileData.role})`);
    return { user: authData.user, profile: profileData };
  } catch (error) {
    console.error(`❌ Error creating ${role} (${email}):`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting user creation...\n');

  try {
    // Create Admin
    await createUser(
      'wiwik@unp.id',
      'wr77hs20',
      'Wiwik',
      'admin'
    );

    // Create Mahasiswa
    await createUser(
      'hasfi@unp.id',
      'hasfi123',
      'Muhammad Hasfi Rasya',
      'mahasiswa'
    );

    console.log('\n✨ All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN/DOSEN:');
    console.log('  Email: wiwik@unp.id');
    console.log('  Password: wr77hs20');
    console.log('\nMAHASISWA:');
    console.log('  Email: hasfi@unp.id');
    console.log('  Password: hasfi123');
    console.log('  Full Name: Muhammad Hasfi Rasya');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ You can now login at: http://localhost:3000/login');
  } catch (error) {
    console.error('\n❌ Failed to create users:', error.message);
    process.exit(1);
  }
}

main();
