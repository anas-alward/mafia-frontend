import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { createResetPasswordFormSchema } from '../schemas/auth'
import type {
  ResetPasswordFormInput,
  ResetPasswordInput,
} from '../schemas/auth'

interface ResetPasswordFormProps {
  token: string
  email: string
  onSubmit: (
    data: ResetPasswordInput,
  ) => Promise<{ errors?: { message: string; field?: string }[] } | void>
}

export function ResetPasswordForm({
  token,
  email,
  onSubmit,
}: ResetPasswordFormProps) {
  const { t } = useTranslation()
  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(createResetPasswordFormSchema(t)),
    defaultValues: { token, email, password: '', confirmPassword: '' },
  })

  const handleSubmit = async (data: ResetPasswordFormInput) => {
    // confirmPassword is validation-only — never sent to the API.
    const result = await onSubmit({
      token: data.token,
      email: data.email,
      newPassword: data.password,
    })
    if (result?.errors) {
      for (const e of result.errors) {
        form.setError(
          (e.field ?? 'root') as keyof ResetPasswordInput | 'root',
          {
            message: t('auth.errors.server', { defaultValue: e.message }),
          },
        )
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.fields.newPassword', {
                  defaultValue: 'New Password',
                })}
              </FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.fields.confirmPassword', {
                  defaultValue: 'Confirm Password',
                })}
              </FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full text-white"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? t('auth.reset.submitting', { defaultValue: 'Resetting...' })
            : t('auth.reset.submit', { defaultValue: 'Reset Password' })}
        </Button>
      </form>
    </Form>
  )
}
