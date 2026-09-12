import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from '@tanstack/react-router'
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
import { createLoginSchema } from '../schemas/auth'
import type { LoginInput } from '../schemas/auth'

interface LoginFormProps {
  onSubmit: (
    data: LoginInput,
  ) => Promise<{ errors?: { message: string; field?: string }[] } | void>
  defaultEmail?: string
}

export function LoginForm({ onSubmit, defaultEmail }: LoginFormProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const form = useForm<LoginInput>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: { email: defaultEmail ?? '', password: '' },
  })

  const handleSubmit = async (data: LoginInput) => {
    const result = await onSubmit(data)
    if (result?.errors) {
      for (const e of result.errors) {
        form.setError((e.field ?? 'root') as keyof LoginInput | 'root', {
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
              <div className="flex items-center justify-between">
                <FormLabel>
                  {t('auth.fields.password', { defaultValue: 'Password' })}
                </FormLabel>
                <Link
                  to="/password/forgot"
                  className="text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
                >
                  {t('auth.login.forgotLink', {
                    defaultValue: 'Forgot password?',
                  })}
                </Link>
              </div>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...field}
                />
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
            ? t('auth.login.submitting', { defaultValue: 'Logging in...' })
            : t('auth.login.submit', { defaultValue: 'Log In' })}
        </Button>

        <p className="text-sm text-center text-neutral-600">
          {t('auth.login.noAccount', {
            defaultValue: "Don't have an account?",
          })}{' '}
          <button
            type="button"
            onClick={() => navigate({ to: '/signup' })}
            className="text-neutral-900 underline underline-offset-2 font-medium"
          >
            {t('auth.login.signUpLink', { defaultValue: 'Sign up' })}
          </button>
        </p>
      </form>
    </Form>
  )
}
