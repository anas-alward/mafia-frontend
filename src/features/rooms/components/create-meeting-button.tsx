import { useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Button } from '#/components/ui/button'
import { Video } from 'lucide-react'
import { createRoom } from '../api/client'

export function CreateMeetingButton() {
  const navigate = useNavigate()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () =>
      createRoom({ name: 'Instant Meeting', max_members: 25 }),
    onSuccess: (data) => {
      navigate({ to: '/rooms/$roomId', params: { roomId: data.room.code } })
    },
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        size="lg"
        className="px-8 py-6 text-base"
        onClick={() => mutate()}
        disabled={isPending}
      >
        <Video className="h-5 w-5 mr-2" />
        {isPending ? 'Creating...' : 'Create Instant Meeting'}
      </Button>
      {isError && (
        <p className="text-sm text-red-500">
          {(error as { message?: string }).message ?? 'Failed to create meeting. Please try again.'}
        </p>
      )}
    </div>
  )
}
