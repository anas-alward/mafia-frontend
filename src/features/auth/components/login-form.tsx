import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from '@tanstack/react-router'
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
import { loginSchema } from '../schemas/auth'
import type { LoginInput } from '../schemas/auth'

interface LoginFormProps {
  onSubmit: (
    data: LoginInput,
  ) => Promise<{ errors?: { message: string; field?: string }[] } | void>
  defaultEmail?: string
}

export function LoginForm({ onSubmit, defaultEmail }: LoginFormProps) {
  const navigate = useNavigate()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail ?? '', password: '' },
  })

  const handleSubmit = async (data: LoginInput) => {
    const result = await onSubmit(data)
    if (result?.errors) {
      for (const e of result.errors) {
        form.setError((e.field ?? 'root') as keyof LoginInput | 'root', {
          message: e.message,
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
              <FormLabel>Email</FormLabel>
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
                <FormLabel>Password</FormLabel>
                <Link
                  to="/forgot-password"
                  className="text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
                >
                  Forgot password?
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
          {form.formState.isSubmitting ? 'Logging in...' : 'Log In'}
        </Button>

        <p className="text-sm text-center text-neutral-600">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate({ to: '/signup' })}
            className="text-neutral-900 underline underline-offset-2 font-medium"
          >
            Sign up
          </button>
        </p>
      </form>
    </Form>
  )
}
