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
import { createSignUpFormSchema } from '../schemas/auth'
import type { SignUpInput, SignUpFormInput } from '../schemas/auth'

interface SignUpFormProps {
  onSubmit: (
    data: SignUpInput,
  ) => Promise<{ errors?: { message: string; field?: string }[] } | void>
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const form = useForm<SignUpFormInput>({
    resolver: zodResolver(createSignUpFormSchema(t)),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = async (data: SignUpFormInput) => {
    // confirmPassword is validation-only — never sent to the API.
    const result = await onSubmit({
      username: data.username,
      email: data.email,
      password: data.password,
    })
    if (result?.errors) {
      for (const e of result.errors) {
        form.setError((e.field ?? 'root') as keyof SignUpInput | 'root', {
          message: t('auth.errors.server', { defaultValue: e.message }),
        })
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.fields.username', { defaultValue: 'Username' })}
              </FormLabel>
              <FormControl>
                <Input type="text" autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.fields.password', { defaultValue: 'Password' })}
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
            ? t('auth.signup.submitting', {
                defaultValue: 'Creating account...',
              })
            : t('auth.signup.submit', { defaultValue: 'Create Account' })}
        </Button>

        <p className="text-sm text-center text-neutral-600">
          {t('auth.signup.haveAccount', {
            defaultValue: 'Already have an account?',
          })}{' '}
          <button
            type="button"
            onClick={() => navigate({ to: '/login' })}
            className="text-neutral-900 underline underline-offset-2 font-medium"
          >
            {t('auth.signup.loginLink', { defaultValue: 'Log in' })}
          </button>
        </p>
      </form>
    </Form>
  )
}
