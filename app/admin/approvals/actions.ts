'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveBroker(userId: string, notes?: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('approve_broker', {
    p_user_id: userId,
    p_notes: notes ?? null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/approvals')
}

export async function rejectBroker(userId: string, notes?: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('reject_broker', {
    p_user_id: userId,
    p_notes: notes ?? null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/approvals')
}

export async function approveCompany(userId: string, companyId?: string, notes?: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('approve_company', {
    p_user_id: userId,
    p_company_id: companyId ?? null,
    p_notes: notes ?? null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/approvals')
}

export async function rejectCompany(userId: string, companyId?: string, notes?: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('reject_company', {
    p_user_id: userId,
    p_company_id: companyId ?? null,
    p_notes: notes ?? null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/approvals')
}
