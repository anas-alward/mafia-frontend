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
import { createChangePasswordSchema } from '../schemas/auth'
import type { ChangePasswordInput } from '../schemas/auth'

interface ChangePasswordFormProps {
  onSubmit: (
    data: ChangePasswordInput,
  ) => Promise<{ errors?: { message: string; field?: string }[] } | void>
}

export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const { t } = useTranslation()
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(createChangePasswordSchema(t)),
    defaultValues: { currentPassword: '', newPassword: '' },
  })

  const handleSubmit = async (data: ChangePasswordInput) => {
    const result = await onSubmit(data)
    if (result?.errors) {
      for (const e of result.errors) {
        form.setError(
          (e.field ?? 'root') as keyof ChangePasswordInput | 'root',
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
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('auth.fields.currentPassword', {
                  defaultValue: 'Current Password',
                })}
              </FormLabel>
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

        <FormField
          control={form.control}
          name="newPassword"
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
            ? t('auth.change.submitting', { defaultValue: 'Changing...' })
            : t('auth.change.submit', { defaultValue: 'Change Password' })}
        </Button>
      </form>
    </Form>
  )
}
