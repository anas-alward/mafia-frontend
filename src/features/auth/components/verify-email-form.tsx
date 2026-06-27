import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { verifyEmailSchema } from '../schemas/auth'
import type { VerifyEmailInput } from '../schemas/auth'

interface VerifyEmailFormProps {
  email: string
  onSubmit: (
    data: VerifyEmailInput,
  ) => Promise<{ errors?: { message: string; field?: string }[] } | void>
}

export function VerifyEmailForm({ email, onSubmit }: VerifyEmailFormProps) {
  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email, code: '' },
  })

  const handleSubmit = async (data: VerifyEmailInput) => {
    const result = await onSubmit(data)
    if (result?.errors) {
      for (const e of result.errors) {
        form.setError((e.field ?? 'root') as keyof VerifyEmailInput | 'root', {
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
        <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            A verification code has been sent to{' '}
            <span className="font-medium">{email}</span>. Please enter it below.
          </p>
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  autoComplete="one-time-code"
                  placeholder="Enter the code from your email"
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
          {form.formState.isSubmitting ? 'Verifying...' : 'Verify Email'}
        </Button>
      </form>
    </Form>
  )
}
