import { PaymentElement } from '@stripe/react-stripe-js';

export const CheckoutForm = () => {
  return (
    <form>
      <PaymentElement />
      <button>Submit</button>
    </form>
  );
};

