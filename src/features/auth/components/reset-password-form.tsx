import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '#/components/ui/form'
import { resetPasswordSchema  } from '../schemas/auth'
import type {ResetPasswordInput} from '../schemas/auth';

interface ResetPasswordFormProps {
  token: string
  onSubmit: (data: ResetPasswordInput) => Promise<{ errors?: { message: string; field?: string }[] } | void>
}

export function ResetPasswordForm({ token, onSubmit }: ResetPasswordFormProps) {
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '' },
  })

  const handleSubmit = async (data: ResetPasswordInput) => {
    const result = await onSubmit(data)
    if (result?.errors) {
      for (const e of result.errors) {
        form.setError((e.field ?? 'root') as keyof ResetPasswordInput | 'root', {
          message: e.message,
        })      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-red-600" role="alert">{form.formState.errors.root.message}</p>
        )}

        <Button type="submit" className="w-full text-white" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  )
}
