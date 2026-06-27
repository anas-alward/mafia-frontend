import { z } from 'zod'

export const joinMeetingSchema = z.object({
  link: z.string().min(1, 'Enter a room link or code'),
})

export type JoinMeetingInput = z.infer<typeof joinMeetingSchema>
