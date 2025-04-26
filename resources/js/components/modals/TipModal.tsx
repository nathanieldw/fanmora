import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User } from '@/types';
import axios from 'axios';

interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipient: User;
}

export default function TipModal({ isOpen, onClose, recipient }: TipModalProps) {
    const [amount, setAmount] = useState<string>('10');
    const [message, setMessage] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const predefinedAmounts = ['5', '10', '25', '50', '100'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsSubmitting(true);

        try {
            // Send tip to backend
            const response = await axios.post('/api/tips', {
                recipient_id: recipient.id,
                amount: parseFloat(amount),
                message: message
            });

            toast.success('Tip sent successfully!');
            onClose();
        } catch (error) {
            console.error('Error sending tip:', error);
            toast.error('Failed to send tip. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send a tip to {recipient.name}</DialogTitle>
                    <DialogDescription>
                        Show your appreciation with a tip. 100% goes to the creator.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="tip-amount">Tip amount ($)</Label>
                        <Input
                            id="tip-amount"
                            type="number"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {predefinedAmounts.map((presetAmount) => (
                                <Button
                                    key={presetAmount}
                                    type="button"
                                    variant={amount === presetAmount ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setAmount(presetAmount)}
                                >
                                    ${presetAmount}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tip-message">Message (optional)</Label>
                        <Input
                            id="tip-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a message with your tip"
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Tip'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
