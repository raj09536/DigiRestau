const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log("Checking if we can insert null restaurant_id into order_feedback...");
  const { data, error } = await supabase
    .from('order_feedback')
    .insert({
      order_id: null,
      restaurant_id: null,
      rating: 5,
      comment: 'Test connection'
    })
    .select();

  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert success!", data);
    // Delete the test row
    const { error: delError } = await supabase
      .from('order_feedback')
      .delete()
      .eq('id', data[0].id);
    console.log("Cleanup:", delError ? "Failed" : "Success");
  }
}

run();
