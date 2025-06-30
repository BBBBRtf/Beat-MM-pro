import os
from flask import Flask, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

app = Flask(__name__)

# Supabase setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client | None = None # Explicitly type supabase client variable

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase URL or Key not found in .env. Backend will run without Supabase connection.")
else:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        # Test connection by fetching something small (optional, can remove if it causes startup delay)
        # Example: supabase.table('users').select('id', head=True).limit(1).execute()
        print("Successfully initialized Supabase client.")
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        supabase = None # Ensure supabase is None if connection fails

@app.route('/')
def home():
    return jsonify(message="Welcome to the BeatMM Pro Backend!")

@app.route('/api/health')
def health_check():
    sb_status = "connected" if supabase else "disconnected"
    if supabase:
        try:
            # A light ping to check actual connectivity, e.g., fetching a non-existent table's schema (lightweight)
            # or a specific known small public table if available.
            # For now, just check if client was initialized.
            # supabase.table('_non_existent_table_').select('id').limit(0).execute() # Example of a lightweight check
            pass # If create_client didn't throw, we assume it's configured. Actual query will test connection.
        except Exception as e:
            sb_status = f"connection_error: {str(e)}"
    return jsonify(status="healthy", supabase_status=sb_status)

@app.route('/api/users', methods=['GET'])
def get_users():
    if not supabase:
        return jsonify(error="Supabase client not initialized or connection failed"), 503
    try:
        response = supabase.table('users').select("*").execute()
        # Check for actual errors in response if Supabase client has error handling specifics
        if hasattr(response, 'error') and response.error:
            return jsonify(error=response.error.message, details=str(response.error)), 500
        return jsonify(response.data)
    except Exception as e:
        return jsonify(error=f"Failed to fetch users: {str(e)}"), 500

@app.route('/api/music', methods=['GET'])
def get_music():
    if not supabase:
        return jsonify(error="Supabase client not initialized or connection failed"), 503
    try:
        response = supabase.table('music').select("*").execute()
        if hasattr(response, 'error') and response.error:
            return jsonify(error=response.error.message, details=str(response.error)), 500
        return jsonify(response.data)
    except Exception as e:
        return jsonify(error=f"Failed to fetch music: {str(e)}"), 500

if __name__ == '__main__':
    # Port 5001 is often used for backend dev servers
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get("PORT", 5001)))
