'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Strict integer validation between 0 and 3
const responseSchema = z.record(z.string(), z.coerce.number().int().min(0).max(3))

// The payload sent from the client
const assessmentPayloadSchema = z.object({
  type: z.enum(['PHQ9', 'GAD7']),
  responses: responseSchema,
})

export type AssessmentResult = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function submitAssessment(formData: FormData): Promise<AssessmentResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Parse formData into an object
  const rawData = Object.fromEntries(formData.entries())
  const type = rawData.type as string

  // Extract all keys that look like response numbers (e.g., 'q1', 'q2')
  const rawResponses: Record<string, any> = {}
  Object.keys(rawData).forEach(key => {
    if (key.startsWith('q')) {
      rawResponses[key] = rawData[key]
    }
  })

  // Validate the payload
  const validationParams = { type, responses: rawResponses }
  const validated = assessmentPayloadSchema.safeParse(validationParams)

  if (!validated.success) {
    return {
      error: 'Invalid assessment data.',
      fieldErrors: validated.error.flatten().fieldErrors,
    }
  }

  const { type: assessmentType, responses } = validated.data

  // Calculate total score
  const totalScore = Object.values(responses).reduce((sum, val) => sum + val, 0)

  // Insert into Supabase
  const { error } = await supabase.from('clinical_assessments').insert({
    user_id: user.id,
    assessment_type: assessmentType,
    responses: responses,
    total_score: totalScore,
  })

  if (error) {
    console.error('Database Error:', error)
    return { error: 'Failed to save assessment. Please try again later.' }
  }

  revalidatePath('/analytics')
  return { success: true }
}
