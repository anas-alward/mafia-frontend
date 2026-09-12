import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '#/components/ui/form'
import { createForgotPasswordSchema } from '../schemas/auth'
import type { ForgotPasswordInput } from '../schemas/auth'

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordInput) => Promise<{ success: boolean }>
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(createForgotPasswordSchema(t)),
    defaultValues: { email: '' },
  })

  const handleSubmit = async (data: ForgotPasswordInput) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5"
        noValidate
      >
        <p className="text-sm text-neutral-600">
          {t('auth.forgot.description', {
            defaultValue:
              "Enter your email address and we'll send you a link to reset your password.",
          })}
        </p>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.fields.email', { defaultValue: 'Email' })}
              </FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full text-white"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? t('auth.forgot.submitting', { defaultValue: 'Sending...' })
            : t('auth.forgot.submit', { defaultValue: 'Send Reset Link' })}
        </Button>

        <p className="text-sm text-center text-neutral-600">
          <button
            type="button"
            onClick={() => navigate({ to: '/login' })}
            className="text-neutral-900 underline underline-offset-2 font-medium"
          >
            {t('auth.forgot.backToLogin', { defaultValue: 'Back to login' })}
          </button>
        </p>
      </form>
    </Form>
  )
}
