# Flutterwave Payment Integration Guide

## Overview
This app integrates with Flutterwave for payment processing with deep linking support to handle payment callbacks directly within the app.

## App Scheme Configuration

### Scheme Definition
- **App Scheme**: `milove` (defined in `app.json`)
- **Deep Link Format**: `milove://payment-callback`
- **Callback Route**: `/app/payment-callback.tsx`

### URL Parameters Supported
The payment callback URL supports the following query parameters:
- `status` - Payment status (`successful`, `completed`, `failed`, `cancelled`)
- `transaction_id` - The transaction ID from the backend
- `reference` - Flutterwave transaction reference

### Example Callback URLs
```
// Successful payment
milove://payment-callback?status=successful&transaction_id=123&reference=FLW123456

// Failed payment
milove://payment-callback?status=failed&reference=FLW123456
```

## Backend Configuration

When setting up the payment link on the backend, include the redirect URL:

```typescript
// In wallet-service.service.ts
export const generatePaymentLink = async ({
  data,
}: {
  data: GeneratePaymentLinkPayLoad;
}) => {
  const response = await apiSecured.post(`/wallet/buy-coins`, {
    amount: data?.amount,
    redirect_url: data?.redirect_url, // Pass the app deep link
  });
  return response.data;
};
```

## Platform-Specific Setup

### iOS
- Bundle ID: `com.dating.milove`
- Scheme: `milove`
- No additional configuration needed; universal links are handled by Expo

### Android
- Package: `com.david_codes.milove`
- Scheme: `milove`
- Deep links are automatically handled by Expo Router

## Frontend Implementation

### Step 1: Generate Payment Link with Callback URL
```typescript
const getRedirectUrl = () => {
  const scheme = Linking.createURL("/payment-callback");
  return scheme;
};

const response = await useGeneratePaymentLink({
  data: { 
    amount: 100,
    redirect_url: getRedirectUrl(), // e.g., milove://payment-callback
  },
});
```

### Step 2: Open Browser for Payment
```typescript
const result = await WebBrowser.openBrowserAsync(response.link);

if (result.type === "dismiss") {
  toast.info("Payment cancelled");
}
```

### Step 3: Handle Payment Callback
The app automatically routes to `/payment-callback` which:
1. Extracts URL parameters (`status`, `transaction_id`, `reference`)
2. Fetches transaction details from backend
3. Displays success/failure UI with transaction details
4. Provides options to view transactions or retry

## Transaction Details Page (`/app/payment-callback.tsx`)

### Features
- **Loading State**: Shows activity indicator while fetching data
- **Success State**: 
  - Green checkmark icon
  - Transaction details (amount, reference, date)
  - Button to view all transactions
  - Button to return to wallet
- **Failure State**:
  - Red error icon
  - Error message
  - Button to try again
  - Button to return to wallet

### Transaction Data Fetched
```typescript
interface TransactionData {
  id: string;
  type: string;
  status: "completed" | "failed" | "pending";
  amount: number;
  currency: string;
  created_at: string;
  payment_reference?: string;
  error_message?: string;
}
```

## Testing Deep Links

### iOS
```bash
xcrun simctl openurl booted "milove://payment-callback?status=successful&transaction_id=123&reference=TEST123"
```

### Android
```bash
adb shell am start -W -a android.intent.action.VIEW -d "milove://payment-callback?status=successful&transaction_id=123&reference=TEST123" com.david_codes.milove
```

## Flutterwave Configuration

When setting up your Flutterwave webhook/redirect:
1. Set the redirect URL to include your app scheme: `milove://payment-callback`
2. Flutterwave will append query parameters: `?status=successful&tx_ref=...&transaction_id=...`
3. The app will automatically handle the deep link and route to the callback page

## Production Deployment

### Before EAS Build
1. Ensure `app.json` has correct scheme: `"scheme": "milove"`
2. Test deep links in development build
3. Verify Flutterwave API keys are correct

### EAS Build Configuration
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Post-Build Testing
1. Install the production build
2. Test payment flow end-to-end
3. Verify deep link redirect works from browser

## Troubleshooting

### Deep link not triggering
- Ensure app scheme is correctly defined in `app.json`
- Check that the URL format matches: `milove://payment-callback?...`
- For Android, clear app data and rebuild

### Transaction details not loading
- Check that transaction ID is being passed correctly
- Verify backend `/wallet/transactions/{id}` endpoint returns data
- Check network console for API errors

### WebBrowser closing unexpectedly
- Ensure Flutterwave link is valid
- Check for network connectivity
- Verify authentication token is valid

## Related Files
- `app/payment-callback.tsx` - Callback handler page
- `app/(settings)/wallet/fund-wallet.tsx` - Payment initiation
- `services/wallet-service.service.ts` - Payment API calls
- `app.json` - App scheme configuration
