import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTherapyStore } from '@/stores/therapyStore';
import { Activity } from '@/types/therapy';
import { toast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

interface AssignActivityModalProps {
  activity: Activity;
  open: boolean;
  onClose: () => void;
}

const AssignActivityModal = ({ activity, open, onClose }: AssignActivityModalProps) => {
  const { learners, assignments, assignActivity } = useTherapyStore();
  const [selectedLearner, setSelectedLearner] = useState('');
  const [note, setNote] = useState('');

  // Filter out learners who already have this activity assigned
  const availableLearners = learners.filter(
    (learner) => !assignments.some(
      (a) => a.activityId === activity.id && a.learnerId === learner.id
    )
  );

  const handleAssign = () => {
    if (selectedLearner) {
      assignActivity(activity.id, selectedLearner);
      const learnerName = learners.find((l) => l.id === selectedLearner)?.name;
      toast({
        title: "Activity assigned",
        description: `"${activity.name}" has been assigned to ${learnerName}.`,
      });
      onClose();
      setSelectedLearner('');
      setNote('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Activity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm font-medium text-foreground">{activity.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activity.type.replace('-', ' ').toUpperCase()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="learner">Select Learner</Label>
            <Select value={selectedLearner} onValueChange={setSelectedLearner}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a learner" />
              </SelectTrigger>
              <SelectContent>
                {availableLearners.map((learner) => (
                  <SelectItem key={learner.id} value={learner.id}>
                    {learner.name} (Age {learner.age})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableLearners.length === 0 && (
              <p className="text-xs text-muted-foreground">
                All learners already have this activity assigned.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes for this assignment..."
              rows={3}
            />
          </div>

          <Button
            variant="therapy"
            className="w-full"
            onClick={handleAssign}
            disabled={!selectedLearner}
          >
            <Send className="w-4 h-4" />
            Assign Activity
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignActivityModal;
