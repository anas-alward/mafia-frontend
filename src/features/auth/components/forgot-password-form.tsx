import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '#/components/ui/form'
import { forgotPasswordSchema  } from '../schemas/auth'
import type {ForgotPasswordInput} from '../schemas/auth';

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordInput) => Promise<{ success: boolean }>
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const navigate = useNavigate()
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const handleSubmit = async (data: ForgotPasswordInput) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5" noValidate>
        <p className="text-sm text-neutral-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full text-white" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <p className="text-sm text-center text-neutral-600">
          <button
            type="button"
            onClick={() => navigate({ to: '/login' })}
            className="text-neutral-900 underline underline-offset-2 font-medium"
          >
            Back to login
          </button>
        </p>
      </form>
    </Form>
  )
}
