import { useParams } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'

export default function ChatWithCode() {
  const { id } = useParams()
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Chat with your Project</h1>
      <ChatWindow projectId={id} />
    </div>
  )
}
