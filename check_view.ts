import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkView() {
    const { data, error } = await supabase
        .from('view_sales_os')
        .select('*')
        .limit(1)

    if (error) {
        console.log('Error accessing view_sales_os:', error.message)
    } else {
        console.log('Success accessing view_sales_os. Rows:', data.length)
    }
}

checkView()
