import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

declare global {
  interface Window {
    Mollie: any;
  }
}

interface MolliePaymentFormProps {
  onSuccess: (cardToken: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  profileId: string;
}

export default function MolliePaymentForm({ onSuccess, onCancel, isLoading, profileId }: MolliePaymentFormProps) {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const mollieRef = useRef<any>(null);
  const cardNumberRef = useRef<any>(null);
  const cardHolderRef = useRef<any>(null);
  const expiryDateRef = useRef<any>(null);
  const verificationCodeRef = useRef<any>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Initialize Mollie.js
  useEffect(() => {
    // Load Mollie.js script
    const script = document.createElement('script');
    script.src = 'https://js.mollie.com/v1/mollie.js';
    script.async = true;
    
    script.onload = () => {
      // Initialize Mollie
      try {
        mollieRef.current = window.Mollie(profileId, { 
          locale: 'en_US',
          testmode: true // Set to false in production
        });
        
        // Create components
        cardNumberRef.current = mollieRef.current.createComponent('cardNumber');
        cardHolderRef.current = mollieRef.current.createComponent('cardHolder');
        expiryDateRef.current = mollieRef.current.createComponent('expiryDate');
        verificationCodeRef.current = mollieRef.current.createComponent('verificationCode');
        
        // Mount components
        cardNumberRef.current.mount('#card-number');
        cardHolderRef.current.mount('#card-holder');
        expiryDateRef.current.mount('#expiry-date');
        verificationCodeRef.current.mount('#verification-code');
        
        // Add error listeners
        setupErrorListeners();
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing Mollie:', error);
        setFormError('Could not initialize payment form. Please try again later.');
      }
    };
    
    script.onerror = () => {
      setFormError('Failed to load payment system. Please try again later.');
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      
      if (cardNumberRef.current) cardNumberRef.current.unmount();
      if (cardHolderRef.current) cardHolderRef.current.unmount();
      if (expiryDateRef.current) expiryDateRef.current.unmount();
      if (verificationCodeRef.current) verificationCodeRef.current.unmount();
    };
  }, [profileId]);
  
  const setupErrorListeners = () => {
    const displayError = (component: any, errorId: string) => {
      component.addEventListener('change', (event: any) => {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
          if (event.error && event.touched) {
            errorElement.textContent = event.error;
          } else {
            errorElement.textContent = '';
          }
        }
      });
    };
    
    displayError(cardNumberRef.current, 'card-number-error');
    displayError(cardHolderRef.current, 'card-holder-error');
    displayError(expiryDateRef.current, 'expiry-date-error');
    displayError(verificationCodeRef.current, 'verification-code-error');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!isInitialized || !mollieRef.current) {
      setFormError('Payment system not initialized. Please refresh and try again.');
      return;
    }
    
    try {
      // Create token
      const { token, error } = await mollieRef.current.createToken();
      
      if (error) {
        setFormError(error);
        return;
      }
      
      // Pass token to parent component
      onSuccess(token);
    } catch (error) {
      console.error('Error creating payment token:', error);
      setFormError('Failed to process payment information. Please try again.');
    }
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-holder">Card holder</Label>
        <div id="card-holder" className="border rounded-md p-3 bg-white"></div>
        <div id="card-holder-error" className="text-sm text-red-500"></div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="card-number">Card number</Label>
        <div id="card-number" className="border rounded-md p-3 bg-white"></div>
        <div id="card-number-error" className="text-sm text-red-500"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry-date">Expiry date</Label>
          <div id="expiry-date" className="border rounded-md p-3 bg-white"></div>
          <div id="expiry-date-error" className="text-sm text-red-500"></div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="verification-code">CVC/CVV</Label>
          <div id="verification-code" className="border rounded-md p-3 bg-white"></div>
          <div id="verification-code-error" className="text-sm text-red-500"></div>
        </div>
      </div>
      
      {formError && (
        <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
          {formError}
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!isInitialized || isLoading}
          className="bg-blue-500 hover:bg-blue-600"
          aria-label="Connect payment method"
        >
          {isLoading ? 'Processing...' : 'Connect payment method'}
        </Button>
      </div>
    </form>
  );
}
