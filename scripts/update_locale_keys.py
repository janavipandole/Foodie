import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent / 'locales'
new_keys = {
    'auth': {
        'signupTagline': 'Join Foodie today!',
        'loginTagline': 'Your favorite meals are just a click away.',
        'guestLogin': 'Enter as Guest',
        'signInButton': 'Sign In',
        'userExists': 'User with this email or phone already exists!',
        'registrationSuccess': 'Registration successful! Please login.',
        'invalidCredentials': 'Invalid email or password!',
        'welcomeBack': 'Welcome back, {name}!',
        'googleLoginFailed': 'Google Login failed. Please use regular login.'
    },
    'checkout': {
        'zoneWarning': 'Note: Your address is approximately {distance} km from Nashik. Delivery availability may vary.',
        'citySearch': {
            'error': 'Unable to search cities. Please check your connection and try again.',
            'failed': 'City search failed. Please try again.'
        },
        'pin': {
            'invalidLength': 'Pincode must be 6 digits',
            'validating': 'Validating pincode...',
            'notFound': 'Pincode not found',
            'cityMismatch': 'Pincode does not match selected city',
            'validationSuccess': 'Pincode validated successfully',
            'validationNetworkFail': 'Unable to validate pincode. Please check your connection and try again.',
            'retryValidation': 'Retry Validation',
            'validationFailed': 'PIN validation failed. Please try again.'
        },
        'payment': {
            'onlyCard': 'Currently only Card payment is integrated.',
            'unavailable': 'Payment system is not available. Please refresh the page.'
        },
        'phone': {
            'invalid': 'Enter valid Indian number',
            'invalidFormat': 'Please enter a valid phone number'
        }
    },
    'ride': {
        'form': {
            'requiredFields': 'Please fill in all required fields.',
            'invalidMobile': 'Please enter a valid 10-digit mobile number.'
        },
        'otp': {
            'required': 'Please enter all 6 digits.',
            'incorrect': 'Incorrect OTP. Please try again.'
        },
        'theme': {
            'lightMode': 'Light Mode ☀',
            'darkMode': 'Dark Mode 🌙'
        }
    },
    'feedback': {
        'submitting': 'Submitting feedback...',
        'success': 'Thank you for your feedback! We appreciate your input.',
        'submitFailed': 'Failed to submit feedback. Please try again or contact support.',
        'retryButton': 'Retry Submission'
    },
    'partner': {
        'submitFailedField': 'Submission failed. Please check your connection and try again.',
        'submitFailedToast': 'Failed to submit partnership request. Please try again.'
    },
    'errors': {
        'storage': 'Storage error. Your data may not be saved.',
        'network': 'Network error. Please check your connection.',
        'cart': 'Cart error. Please try again.',
        'unhandled': 'An error occurred. Please refresh the page.',
        'promiseRejected': 'An error occurred. Please try again.'
    },
    'forgotPassword': {
        'invalidEmail': 'Please enter a valid email address',
        'resetLinkSent': 'Reset link resent to {email}'
    },
    'newsletter': {
        'success': 'Thank you for subscribing!\nYou will receive updates at: {email}'
    },
    'contributors': {
        'failedTitle': 'Failed to Load Contributors',
        'failedMessage': 'Unable to load contributor data. This might be due to API rate limits or network issues.',
        'retry': 'Retry',
        'failedToast': 'Failed to load contributors. Please try again.'
    },
    'i18n': {
        'loadFailed': 'Failed to load language translations. Some text may appear in English.'
    },
    'nearby': {
        'locationUnavailable': 'Location services are unavailable.',
        'locationUnavailableHint': 'Please enable location or try again.',
        'noLocation': 'No nearby restaurants found. Try enabling location.',
        'loadFailed': 'Unable to load nearby restaurants right now. Please verify API key and internet connection.',
        'apiFailed': 'Google Maps request failed. Verify API key permissions for Maps JavaScript API and Places API.',
        'requestingLocation': 'Requesting your location permission...',
        'locationFound': 'Location found. Fetching top rated nearby restaurants...',
        'defaultLocationWarning': 'Location access unavailable. Showing top restaurants near default location.',
        'showingTop': 'Showing {count} top rated restaurants near you.',
        'noRated': 'No rated restaurants found in this area. Try retrying from a different location.',
        'loading': 'Loading...',
        'noRatings': 'No nearby restaurants with ratings were found in this area.',
        'hoursUnavailable': 'Hours unavailable',
        'openNow': 'Open now',
        'closed': 'Closed',
        'addressUnavailable': 'Address unavailable',
        'restaurant': 'Restaurant',
        'ratingLabel': 'Rating',
        'youAreHere': 'You are here'
    }
}

def merge(a, b):
    for k, v in b.items():
        if k in a and isinstance(a[k], dict) and isinstance(v, dict):
            merge(a[k], v)
        else:
            if k not in a:
                a[k] = v

for locale_file in sorted(root.glob('*.json')):
    data = json.loads(locale_file.read_text(encoding='utf-8'))
    merge(data, new_keys)
    locale_file.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Updated {locale_file.name}')
