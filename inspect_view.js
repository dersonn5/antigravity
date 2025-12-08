const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
    const { data, error } = await supabase
        .from('view_sales_os')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Columns:', data && data.length > 0 ? Object.keys(data[0]) : 'No data found')
        if (data && data.length > 0) {
            console.log('Sample row:', data[0])
        }
    }
}

inspect()
