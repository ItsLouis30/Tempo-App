export interface Tag {
  id: string
  name: string
  color: string | null
  user_id: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  due_date: string | null
  start_date: string | null
  status: string
  priority: number
  position: number
  user_id: string
  created_at: string
  tags?: Tag[]
  progress?: number
}
