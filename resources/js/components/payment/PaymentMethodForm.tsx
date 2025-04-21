import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import axios from 'axios';

interface PaymentMethodFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function PaymentMethodForm({ onSuccess, onCancel, isLoading }: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardName, setCardName] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    // Clear any previous errors
    setCardError(null);
    setProcessingPayment(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardName,
        },
      });

      if (error) {
        setCardError(error.message || 'An error occurred with your card');
        setProcessingPayment(false);
        return;
      }

      // Save payment method to backend
      await axios.post('/api/payment-methods', {
        payment_method_id: paymentMethod.id,
      });

      // Inform parent component of success
      onSuccess(paymentMethod.id);
      
    } catch (error) {
      console.error('Payment error:', error);
      setCardError('An error occurred while processing your payment');
      setProcessingPayment(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardName">Name on card</Label>
        <Input
          id="cardName"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="John Doe"
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Card information</Label>
        <div className="border rounded-md p-3">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        {cardError && <p className="text-sm text-red-500">{cardError}</p>}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={processingPayment || isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || processingPayment || isLoading}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {processingPayment ? 'Processing...' : 'Add payment method'}
        </Button>
      </div>
    </form>
  );
}
