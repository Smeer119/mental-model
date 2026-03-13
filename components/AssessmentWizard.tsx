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
const buildSchema = (numQuestions: number, maxScore: number = 4) => {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (let i = 1; i <= numQuestions; i++) {
    shape[`q${i}`] = z.coerce.number().int().min(0).max(maxScore)
  }
  return z.object(shape)
}

const QUESTIONS_PER_PAGE = 1

export type AssessmentType = 'PHQ9' | 'GAD7' | 'PSS4' | 'ISI' | 'SWEMWBS'

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

const GAD7_QUESTIONS: Question[] = [
  { id: 'q1', text: 'Feeling nervous, anxious, or on edge?' },
  { id: 'q2', text: 'Not being able to stop or control worrying?' },
  { id: 'q3', text: 'Worrying too much about different things?' },
  { id: 'q4', text: 'Trouble relaxing?' },
  { id: 'q5', text: 'Being so restless that it is hard to sit still?' },
  { id: 'q6', text: 'Becoming easily annoyed or irritable?' },
  { id: 'q7', text: 'Feeling afraid, as if something awful might happen?' },
]

const PHQ9_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
]

const PSS4_QUESTIONS: Question[] = [
  { id: 'q1', text: 'In the last month, how often have you felt that you were unable to control the important things in your life?' },
  { id: 'q2', text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?' },
  { id: 'q3', text: 'In the last month, how often have you felt that things were going your way?' },
  { id: 'q4', text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?' },
]

const PSS4_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Almost Never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Fairly Often' },
  { value: 4, label: 'Very Often' },
]

const ISI_QUESTIONS: Question[] = [
  { id: 'q1', text: 'Difficulty falling asleep?' },
  { id: 'q2', text: 'Difficulty staying asleep?' },
  { id: 'q3', text: 'Problem waking up too early?' },
  { id: 'q4', text: 'How satisfied/dissatisfied are you with your current sleep pattern?' },
  { id: 'q5', text: 'How noticeable to others do you think your sleep problem is in terms of impairing the quality of your life?' },
  { id: 'q6', text: 'How worried/distressed are you about your current sleep problem?' },
  { id: 'q7', text: 'To what extent do you consider your sleep problem to INTERFERE with your daily functioning?' },
]

const ISI_OPTIONS = [
  { value: 0, label: 'None / Very Satisfied / Not at all' },
  { value: 1, label: 'Mild / Satisfied / A little' },
  { value: 2, label: 'Moderate / Neutral / Somewhat' },
  { value: 3, label: 'Severe / Dissatisfied / Much' },
  { value: 4, label: 'Very Severe / Very Dissatisfied / Very much' },
]

const SWEMWBS_QUESTIONS: Question[] = [
  { id: 'q1', text: 'I\'ve been feeling optimistic about the future' },
  { id: 'q2', text: 'I\'ve been feeling useful' },
  { id: 'q3', text: 'I\'ve been feeling relaxed' },
  { id: 'q4', text: 'I\'ve been dealing with problems well' },
  { id: 'q5', text: 'I\'ve been thinking clearly' },
  { id: 'q6', text: 'I\'ve been feeling close to other people' },
  { id: 'q7', text: 'I\'ve been able to make up my own mind about things' },
]

const SWEMWBS_OPTIONS = [
  { value: 1, label: 'None of the time' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Some of the time' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'All of the time' },
]

const ASSESSMENT_CONFIG = {
  PHQ9: { title: 'Depression Screen', prompt: 'Over the last 2 weeks, how often have you been bothered by this?', questions: PHQ9_QUESTIONS, options: PHQ9_OPTIONS, maxScore: 3 },
  GAD7: { title: 'Anxiety Screen', prompt: 'Over the last 2 weeks, how often have you been bothered by this?', questions: GAD7_QUESTIONS, options: PHQ9_OPTIONS, maxScore: 3 },
  PSS4: { title: 'Stress Screen (PSS-4)', prompt: 'For each question choose from the following alternatives:', questions: PSS4_QUESTIONS, options: PSS4_OPTIONS, maxScore: 4 },
  ISI: { title: 'Insomnia Severity Index', prompt: 'Please rate your sleep over the LAST 2 WEEKS:', questions: ISI_QUESTIONS, options: ISI_OPTIONS, maxScore: 4 },
  SWEMWBS: { title: 'Wellbeing Scale', prompt: 'Below are some statements about feelings and thoughts. Please tick the box that best describes your experience of each over the last 2 weeks:', questions: SWEMWBS_QUESTIONS, options: SWEMWBS_OPTIONS, maxScore: 5 },
}

interface AssessmentWizardProps {
  type: AssessmentType
}

export default function AssessmentWizard({ type }: AssessmentWizardProps) {
  const router = useRouter()
  const config = ASSESSMENT_CONFIG[type]
  const questions = config.questions
  const schema = buildSchema(questions.length, config.maxScore)
  
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
    
    const allAnswered = pageQuestions.every(q => watch(q.id) !== undefined && String(watch(q.id)) !== "")
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
    return val !== undefined && String(val) !== "" && !errors[q.id]
  })

  return (
    <div className="min-h-screen bg-[#efebf0] flex flex-col font-sans">
      {/* Header & Progress */}
      <div className="pt-6 px-4 md:pt-8 md:px-8 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => step === 0 ? router.back() : prevStep()} 
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-gray-400 tracking-widest uppercase">
            {config.title}
          </span>
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>
        
        <div className="w-full max-w-3xl mx-auto flex items-center gap-4">
          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#714efe]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          <span className="text-xs font-bold text-gray-400">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      <main className="flex-1 px-4 md:px-6 flex flex-col items-center justify-center -mt-6 md:-mt-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {currentQuestions.map((q, idx) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                className="w-full"
              >
                <div className="mb-8 md:mb-12">
                  <span className="text-[#714efe] font-bold text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#714efe]/10 flex items-center justify-center">{startIdx + idx + 1}</span> <ArrowLeft className="w-4 h-4 transform rotate-180" />
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {q.text}
                  </h1>
                  {startIdx === 0 && (
                     <p className="text-gray-500 mt-3 md:mt-4 text-base sm:text-lg md:text-xl font-medium">{config.prompt}</p>
                  )}
                </div>
                
                <div className="space-y-4" role="radiogroup" aria-labelledby={`question-${q.id}`}>
                  {config.options.map((opt, optIdx) => {
                    const isSelected = String(watch(q.id)) === String(opt.value)
                    const letter = String.fromCharCode(65 + optIdx) // A, B, C, D
                    
                    return (
                      <label 
                        key={opt.value}
                        className={`
                          group relative flex items-center p-3 sm:p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all cursor-pointer overflow-hidden
                          ${isSelected ? 'border-[#714efe] bg-[#714efe]/5' : 'border-transparent bg-white shadow-sm hover:border-[#714efe]/30 hover:shadow-md'}
                        `}
                      >
                        <div className={`
                          w-8 h-8 md:w-10 md:h-10 rounded-xl mr-4 md:mr-6 flex items-center justify-center font-bold text-sm md:text-base transition-colors shrink-0
                          ${isSelected ? 'bg-[#714efe] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-[#714efe]/10 group-hover:text-[#714efe]'}
                        `}>
                          {letter}
                        </div>
                        <input 
                          type="radio" 
                          value={opt.value} 
                          {...register(q.id)} 
                          onChange={(e) => {
                            register(q.id).onChange(e);
                            // Auto-advance after a short delay
                            setTimeout(() => {
                              if (step < totalPages - 1) {
                                nextStep();
                              } else {
                                handleSubmit(onSubmit)();
                              }
                            }, 400);
                          }}
                          className="sr-only" 
                          aria-label={opt.label}
                        />
                        <span className={`text-base sm:text-lg md:text-xl font-bold ${isSelected ? 'text-[#714efe]' : 'text-gray-700'}`}>
                          {opt.label}
                        </span>
                        
                        {isSelected && (
                          <motion.div
                            layoutId="outline"
                            className="absolute inset-0 border-2 border-[#714efe] rounded-[2rem]"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </label>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </form>
      </main>

      {/* Footer Navigation (Hidden in typical Typeform, only shown on last step or if user wants to go next manually, but we auto-advance) */}
      <AnimatePresence>
        {canProceed && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-10"
          >
            {step < totalPages - 1 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="bg-[#714efe] text-white font-bold py-4 px-8 rounded-[2rem] shadow-lg shadow-purple-500/30 flex items-center gap-2 hover:bg-[#5d3fd3] transition-colors"
              >
                Press Enter <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={submitting}
                className="bg-[#714efe] text-white font-bold py-4 px-8 rounded-[2rem] shadow-lg shadow-purple-500/30 flex items-center gap-2 hover:bg-[#5d3fd3] transition-colors"
               >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
