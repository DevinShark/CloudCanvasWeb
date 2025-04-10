import requests
import json
import datetime  # Needed for expiration date formatting

LICENSEGATE_API_KEY = "b2a275d2-c4d5-4261-9d95-0df4b3926d30"  # Replace with your admin API key from the dashboard
USER_ID = "a1ee1"  # Adding the user ID
API_BASE_URL = "https://api.licensegate.io"
API_ENDPOINT = f"{API_BASE_URL}/admin/licenses"  # Base collection endpoint

# Calculate expiration date (1 year from now) in ISO 8601 format.
expiration_dt = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=365)
expiration_iso = expiration_dt.strftime('%Y-%m-%dT%H:%M:%SZ')

# --- Payload with corrected non-null defaults based on 422 error
license_payload = {
    "active": True,
    "name": "CloudCanvas Valid Defaults Test",
    "notes": "Testing with non-null defaults",
    "ipLimit": 1,                          # Integer, using dashboard value
    "licenseScope": "",                    # String, using dashboard value
    "expirationDate": expiration_iso,      # ISO 8601 string, using calculated value
    "validationPoints": 0.0,               # Float
    "validationLimit": 0,                  # Integer
    "replenishAmount": 0,                  # Integer
    "replenishInterval": "TEN_SECONDS",    # Enum
    "licenseKey": "cc-test-key-py-2"       # Explicitly providing a unique key (changed index)
}

# --- Headers matching the Python http.client example ---
headers = {
    'Content-Type': "application/json",
    'Authorization': LICENSEGATE_API_KEY # Just the key, no 'Bearer'
}

def create_licensegate_license(endpoint, headers, payload):
    print(f"Attempting to create license with name: {payload.get('name', 'N/A')}")
    print(f"Sending POST request to: {endpoint}")
    print(f"Payload:\n{json.dumps(payload, indent=2)}")
    print(f"Using Headers:\n{json.dumps(headers, indent=2)}")

    try:
        response = requests.post(endpoint, headers=headers, json=payload)

        # Debug: print the actual request headers being sent
        if response.request:
            print("DEBUG: Request Headers Sent:")
            for k, v in response.request.headers.items():
                print(f"  {k}: {v}")

        response.raise_for_status()  # Raises HTTPError for bad responses

        print(f"Success! Status Code: {response.status_code} (Expected 201)")
        response_data = response.json()
        print("--- API Response (License Schema) ---")
        print(json.dumps(response_data, indent=2))
        print("-------------------------------------")
        return response_data

    except requests.exceptions.RequestException as e:
        print(f"\n!!! Error during API request: {e} !!!")
        if hasattr(e, 'response') and e.response is not None:
            status_code = e.response.status_code
            print(f"Status Code: {status_code}")
            try:
                error_details = e.response.json()
                print("--- API Error Response (JSON) ---")
                print(json.dumps(error_details, indent=2))
                print("---------------------------------")
            except json.JSONDecodeError:
                print("--- API Error Response (non-JSON) ---")
                print(e.response.text)
                print("------------------------------------")
        else:
            print("Network error or other request issue occurred before receiving a response.")
        return None

if __name__ == "__main__":
    print("--- LicenseGate License Creation Script ---")
    print(f"API Key: ...{LICENSEGATE_API_KEY[-6:]}")
    print(f"Target Endpoint: {API_ENDPOINT}")
    print("\nWARNING: API key is hardcoded. Consider environment variables.")
    print("CRITICAL: Ensure the API Key used has ADMIN privileges for this endpoint.")
    print("INFO: Sending payload based on manual license creation...\n")

    created_license_info = create_licensegate_license(API_ENDPOINT, headers, license_payload)

    if created_license_info:
        new_license_key = created_license_info.get('licenseKey')
        license_id = created_license_info.get('id')
        if new_license_key:
            print(f"\nSuccessfully created license! (ID: {license_id})")
            print(f"New License Key: {new_license_key}")
            print("\nVerification URL:")
            print(f"https://api.licensegate.io/license/{USER_ID}/{new_license_key}/verify")
        else:
            print("\nLicense created (Status 201), but couldn't find 'licenseKey' field in the response.")
            print("Check the full API response above.")
    else:
        print("\nLicense creation failed. Please review the error messages above.")

    print("-------------------------------------------")
