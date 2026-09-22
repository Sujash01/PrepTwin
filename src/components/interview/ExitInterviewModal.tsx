import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface ExitInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  onExit: () => void
}

export function ExitInterviewModal({ isOpen, onClose, onExit }: ExitInterviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave interview?"
      description="Your current interview progress will be lost."
      size="sm"
    >
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Continue Interview
        </Button>
        <Button variant="danger" onClick={onExit}>
          Exit
        </Button>
      </div>
    </Modal>
  )
}