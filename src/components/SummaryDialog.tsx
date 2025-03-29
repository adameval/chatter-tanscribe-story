
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
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Transcription Summary</DialogTitle>
          <DialogDescription>
            AI-generated summary of the transcribed content
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] overflow-y-auto">
          <div className="prose dark:prose-invert max-w-none p-4">
            <div dangerouslySetInnerHTML={{ __html: summary.split('\n').map(line => {
              // Add basic styling for headings and bullets
              if (line.match(/^#+\s/)) {
                return `<h3>${line.replace(/^#+\s/, '')}</h3>`;
              } else if (line.match(/^\*\s/)) {
                return `<li>${line.replace(/^\*\s/, '')}</li>`;
              } else if (line.match(/^-\s/)) {
                return `<li>${line.replace(/^-\s/, '')}</li>`;
              } else if (line === '') {
                return '<br/>';
              } else {
                return `<p>${line}</p>`;
              }
            }).join('') }} />
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)} className="h-12 px-6">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
