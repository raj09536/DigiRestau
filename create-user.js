const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://rcqilnwpichtaijqqnho.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcWlsbndwaWNodGFpanFxbmhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MDE3MywiZXhwIjoyMDg4MDU2MTczfQ.8A22M9cHqwfXdWIgVl3zM_w1SzxEvBiSjulvfqDTW8Q"
);

async function run() {
  const email = 'hello.digirestau@gmail.com';
  // Let's create the user with a temporary password, say 'admin123' or similar. We can let the user change it.
  const password = 'Password@123';
  
  console.log(`Creating/Resetting user: ${email}`);
  
  // Try to create the user directly
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (error) {
    console.error("Create user failed:", error);
    
    // If it failed because user already exists, let's try to update the password
    if (error.message.includes('already exists') || error.status === 422) {
      console.log("User might already exist. Let's try to update password or list users to find their ID...");
    }
  } else {
    console.log("Success! User created successfully:", data.user.id);
  }
}

run();
