/**
 * Simple script to create users
 * Run from backend directory: node ../database/create_users_simple.js
 */

const { createClient } = require('@supabase/supabase-js');

// Get from environment or set directly
const supabaseUrl = process.env.SUPABASE_URL || 'https://ngxlniymmmmkijefhjbm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env');
  console.error('   Or set it as: SUPABASE_SERVICE_ROLE_KEY=your_key node ../database/create_users_simple.js');
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
      if (authError.message.includes('already registered')) {
        console.log(`⚠️  User ${email} already exists in Auth, getting user...`);
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === email);
        if (user) {
          authData.user = user;
        } else {
          throw authError;
        }
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error('Failed to create/get user in Auth');
    }

    console.log(`✅ User in Auth: ${authData.user.id}`);

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

    console.log(`✅ Profile: ${profileData.email} (${profileData.role})`);
    return { user: authData.user, profile: profileData };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🚀 Creating users...\n');

  try {
    // Create Admin
    await createUser('wiwik@unp.id', 'wr77hs20', 'Wiwik', 'admin');

    // Create Mahasiswa
    await createUser('hasfi@unp.id', 'hasfi123', 'Muhammad Hasfi Rasya', 'mahasiswa');

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
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

main();
