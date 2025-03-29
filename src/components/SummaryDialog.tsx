
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string;
}

export function SummaryDialog({ open, onOpenChange, summary }: SummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Transcription Summary</DialogTitle>
          <DialogDescription>
            AI-generated summary of the transcribed content
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh]">
          <div className="prose dark:prose-invert max-w-none p-4">
            <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
