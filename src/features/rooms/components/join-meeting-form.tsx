import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { LogIn } from 'lucide-react'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { addMember } from '../api/client'
import { joinMeetingSchema } from '../schemas/room'
import type { JoinMeetingInput } from '../schemas/room'

function extractRoomId(input: string): string {
  const match = input.match(/\/rooms\/([^/?\s]+)/)
  if (match) return match[1]
  return input.trim()
}

export function JoinMeetingForm() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<JoinMeetingInput>({
    resolver: zodResolver(joinMeetingSchema),
  })

  const linkValue = (watch('link') as string | undefined) ?? ''

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data: JoinMeetingInput) => {
      const roomId = extractRoomId(data.link)
      return addMember(roomId, { user_id: user!.id })
    },
    onSuccess: (_result, variables) => {
      const roomId = extractRoomId(variables.link)
      navigate({ to: '/rooms/$roomId', params: { roomId } })
    },
  })

  const onSubmit = (data: JoinMeetingInput) => mutate(data)

  const getErrorMessage = () => {
    if (!isError) return null
    const err = error as { message?: string; errors?: Array<{ code: string }> }
    if (err.errors?.some((e) => e.code === 'room_full')) {
      return 'This room is full. Maximum capacity reached.'
    }
    if (err.message) return err.message
    return 'Failed to join meeting. Please try again.'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
      <div className="flex gap-2">
        <Input
          {...register('link')}
          placeholder="Paste a link or room code"
          className="flex-1"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !linkValue.trim()}>
          <LogIn className="h-4 w-4 mr-2" />
          {isPending ? 'Joining...' : 'Join'}
        </Button>
      </div>
      {errors.link && (
        <p className="text-sm text-red-500 mt-1.5">{errors.link.message}</p>
      )}
      {isError && (
        <p className="text-sm text-red-500 mt-1.5">{getErrorMessage()}</p>
      )}
    </form>
  )
}
