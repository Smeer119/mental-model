'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitAssessment } from '@/app/actions/assessment'
import { ChevronRight, ArrowLeft, PhoneCall, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

// We require all questions to be answered (0-3) before continuing
const buildSchema = (numQuestions: number) => {
  const shape: Record<string, z.ZodNumber> = {}
  for (let i = 1; i <= numQuestions; i++) {
    shape[`q${i}`] = z.coerce.number().int().min(0).max(3)
  }
  return z.object(shape)
}

const QUESTIONS_PER_PAGE = 2

type AssessmentType = 'PHQ9' | 'GAD7'

interface Question {
  id: string
  text: string
}

const PHQ9_QUESTIONS: Question[] = [
  { id: 'q1', text: 'Little interest or pleasure in doing things?' },
  { id: 'q2', text: 'Feeling down, depressed, or hopeless?' },
  { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much?' },
  { id: 'q4', text: 'Feeling tired or having little energy?' },
  { id: 'q5', text: 'Poor appetite or overeating?' },
  { id: 'q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?' },
  { id: 'q7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television?' },
  { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?' },
  { id: 'q9', text: 'Thoughts that you would be better off dead, or of hurting yourself in some way?' },
]

const OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
]

interface AssessmentWizardProps {
  type: AssessmentType
}

export default function AssessmentWizard({ type }: AssessmentWizardProps) {
  const router = useRouter()
  const questions = type === 'PHQ9' ? PHQ9_QUESTIONS : [] // Add GAD7
  const schema = buildSchema(questions.length)
  
  const [step, setStep] = useState(0)
  const [crisisMode, setCrisisMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  // Watch specifically for Question 9 of PHQ9 for crisis trigger
  const q9Value = watch('q9')

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE)
  
  // Calculate Progress
  const answeredQuestions = Object.keys(watch()).filter(k => watch(k) !== undefined).length
  const progressPercent = Math.round((answeredQuestions / questions.length) * 100)

  // Crisis Override Trigger
  if (type === 'PHQ9' && q9Value !== undefined && Number(q9Value) > 0 && !crisisMode) {
    setCrisisMode(true)
  }

  const nextStep = () => {
    // Validate current page fields before proceeding
    const startIdx = step * QUESTIONS_PER_PAGE
    const endIdx = startIdx + QUESTIONS_PER_PAGE
    const pageQuestions = questions.slice(startIdx, endIdx)
    
    const allAnswered = pageQuestions.every(q => watch(q.id) !== undefined && watch(q.id) !== "")
    if (allAnswered && step < totalPages - 1) {
      setStep(s => s + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    const formData = new FormData()
    formData.append('type', type)
    Object.entries(data).forEach(([key, val]) => {
      formData.append(key, String(val))
    })

    const result = await submitAssessment(formData)
    setSubmitting(false)

    if (result.success) {
      router.push('/analytics')
    } else {
      alert(result.error || 'Validation failed')
    }
  }

  if (crisisMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col px-6 pt-16 pb-24 items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-sm border border-red-100 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">You are not alone</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your responses indicate you might be going through a very difficult time. Please reach out for professional support immediately. Help is available 24/7.
          </p>
          
          <a href="tel:988" className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors mb-3">
            <PhoneCall className="w-5 h-5" />
            Call 988 Suicide & Crisis Lifeline
          </a>
          <a href="sms:988" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors">
            Text 988
          </a>
        </motion.div>
      </div>
    )
  }

  // Slice questions for current page
  const startIdx = step * QUESTIONS_PER_PAGE
  const endIdx = startIdx + QUESTIONS_PER_PAGE
  const currentQuestions = questions.slice(startIdx, endIdx)

  // Determine if current page can proceed
  const canProceed = currentQuestions.every(q => {
    const val = watch(q.id)
    return val !== undefined && val !== "" && !errors[q.id]
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header & Progress */}
      <div className="pt-12 px-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => step === 0 ? router.back() : prevStep()} 
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-500">
            {type === 'PHQ9' ? 'Depression Screen' : 'Anxiety Screen'}
          </span>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
        
        <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-slate-800"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-slate-500 font-medium mt-3 text-right">{progressPercent}% Completed</p>
      </div>

      <main className="flex-1 px-6 pb-32">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Over the last 2 weeks,</h1>
        <p className="text-slate-600 mb-8">how often have you been bothered by the following problems?</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <AnimatePresence mode="popLayout">
            {currentQuestions.map((q, idx) => (
              <motion.section 
                key={q.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-5 leading-snug">
                  {startIdx + idx + 1}. {q.text}
                </h3>
                
                <div className="space-y-3" role="radiogroup" aria-labelledby={`question-${q.id}`}>
                  {OPTIONS.map((opt) => {
                    const isSelected = String(watch(q.id)) === String(opt.value)
                    
                    return (
                      <label 
                        key={opt.value}
                        className={`
                          flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer
                          ${isSelected ? 'border-slate-800 bg-slate-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}
                        `}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                          ${isSelected ? 'border-slate-800' : 'border-slate-300'}
                        `}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />}
                        </div>
                        <input 
                          type="radio" 
                          value={opt.value} 
                          {...register(q.id)} 
                          className="sr-only" 
                          aria-label={opt.label}
                        />
                        <span className={`font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                          {opt.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        </form>
      </main>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 z-10 flex justify-between">
        {step < totalPages - 1 ? (
          <button 
            type="button"
            onClick={nextStep}
            disabled={!canProceed}
            className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!canProceed || submitting}
            className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        )}
      </div>
    </div>
  )
}
