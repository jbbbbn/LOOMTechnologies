"""
Gmail API Integration Tool
"""

import os
from typing import Dict, List, Any
import base64
import json
from datetime import datetime, timedelta

class EmailReaderTool:
    def __init__(self):
        self.credentials_path = os.getenv("GOOGLE_CREDENTIALS_PATH")
        self.is_available = self.credentials_path is not None
        self.service = None
        
        if self.is_available:
            self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Gmail service"""
        try:
            # Import Google API libraries
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
            
            # Define scopes
            SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
            
            creds = None
            # Load existing credentials
            if os.path.exists('gmail_token.json'):
                creds = Credentials.from_authorized_user_file('gmail_token.json', SCOPES)
            
            # If no valid credentials, let user log in
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_path, SCOPES)
                    creds = flow.run_local_server(port=0)
                
                # Save credentials for next run
                with open('gmail_token.json', 'w') as token:
                    token.write(creds.to_json())
            
            self.service = build('gmail', 'v1', credentials=creds)
            print("✅ Gmail service initialized")
            
        except Exception as e:
            print(f"❌ Gmail initialization failed: {e}")
            self.is_available = False
    
    def read_emails(self, request: str) -> str:
        """Main email reading function"""
        try:
            request_lower = request.lower()
            
            if "unread" in request_lower:
                return self.get_unread_emails()
            elif "recent" in request_lower or "latest" in request_lower:
                return self.get_recent_emails()
            elif "search" in request_lower:
                return self.search_emails(request)
            elif "important" in request_lower:
                return self.get_important_emails()
            elif "summary" in request_lower:
                return self.get_email_summary()
            else:
                return self.get_recent_emails()
                
        except Exception as e:
            return f"Email reading error: {str(e)}"
    
    def get_unread_emails(self, max_results: int = 10) -> str:
        """Get unread emails"""
        try:
            if not self.service:
                return "Gmail not available. Please configure credentials."
            
            results = self.service.users().messages().list(
                userId='me',
                q='is:unread',
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            
            if not messages:
                return "No unread emails found."
            
            email_list = []
            for msg in messages:
                message = self.service.users().messages().get(
                    userId='me',
                    id=msg['id']
                ).execute()
                
                email_data = self._parse_email(message)
                email_list.append(
                    f"• **{email_data['subject']}**\n"
                    f"  From: {email_data['sender']}\n"
                    f"  Date: {email_data['date']}\n"
                    f"  Preview: {email_data['preview']}"
                )
            
            return f"Unread emails ({len(email_list)}):\n\n" + "\n\n".join(email_list)
            
        except Exception as e:
            return f"Failed to get unread emails: {str(e)}"
    
    def get_recent_emails(self, max_results: int = 5) -> str:
        """Get recent emails"""
        try:
            if not self.service:
                return "Gmail not available. Please configure credentials."
            
            results = self.service.users().messages().list(
                userId='me',
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            
            if not messages:
                return "No recent emails found."
            
            email_list = []
            for msg in messages:
                message = self.service.users().messages().get(
                    userId='me',
                    id=msg['id']
                ).execute()
                
                email_data = self._parse_email(message)
                email_list.append(
                    f"• **{email_data['subject']}**\n"
                    f"  From: {email_data['sender']}\n"
                    f"  Date: {email_data['date']}\n"
                    f"  Preview: {email_data['preview']}"
                )
            
            return f"Recent emails ({len(email_list)}):\n\n" + "\n\n".join(email_list)
            
        except Exception as e:
            return f"Failed to get recent emails: {str(e)}"
    
    def search_emails(self, query: str) -> str:
        """Search emails"""
        try:
            if not self.service:
                return "Gmail not available. Please configure credentials."
            
            # Extract search terms from query
            search_terms = query.replace("search", "").strip()
            
            results = self.service.users().messages().list(
                userId='me',
                q=search_terms,
                maxResults=5
            ).execute()
            
            messages = results.get('messages', [])
            
            if not messages:
                return f"No emails found matching: {search_terms}"
            
            email_list = []
            for msg in messages:
                message = self.service.users().messages().get(
                    userId='me',
                    id=msg['id']
                ).execute()
                
                email_data = self._parse_email(message)
                email_list.append(
                    f"• **{email_data['subject']}**\n"
                    f"  From: {email_data['sender']}\n"
                    f"  Date: {email_data['date']}\n"
                    f"  Preview: {email_data['preview']}"
                )
            
            return f"Search results for '{search_terms}':\n\n" + "\n\n".join(email_list)
            
        except Exception as e:
            return f"Failed to search emails: {str(e)}"
    
    def get_important_emails(self, max_results: int = 5) -> str:
        """Get important emails"""
        try:
            if not self.service:
                return "Gmail not available. Please configure credentials."
            
            results = self.service.users().messages().list(
                userId='me',
                q='is:important',
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            
            if not messages:
                return "No important emails found."
            
            email_list = []
            for msg in messages:
                message = self.service.users().messages().get(
                    userId='me',
                    id=msg['id']
                ).execute()
                
                email_data = self._parse_email(message)
                email_list.append(
                    f"• **{email_data['subject']}**\n"
                    f"  From: {email_data['sender']}\n"
                    f"  Date: {email_data['date']}\n"
                    f"  Preview: {email_data['preview']}"
                )
            
            return f"Important emails ({len(email_list)}):\n\n" + "\n\n".join(email_list)
            
        except Exception as e:
            return f"Failed to get important emails: {str(e)}"
    
    def get_email_summary(self) -> str:
        """Get email summary"""
        try:
            if not self.service:
                return "Gmail not available. Please configure credentials."
            
            # Get unread count
            unread_result = self.service.users().messages().list(
                userId='me',
                q='is:unread'
            ).execute()
            unread_count = unread_result.get('resultSizeEstimate', 0)
            
            # Get today's emails
            today = datetime.now().strftime('%Y/%m/%d')
            today_result = self.service.users().messages().list(
                userId='me',
                q=f'after:{today}'
            ).execute()
            today_count = today_result.get('resultSizeEstimate', 0)
            
            # Get important emails
            important_result = self.service.users().messages().list(
                userId='me',
                q='is:important'
            ).execute()
            important_count = important_result.get('resultSizeEstimate', 0)
            
            summary = f"""📧 Email Summary:
            
• **Unread emails**: {unread_count}
• **Today's emails**: {today_count}
• **Important emails**: {important_count}
• **Last checked**: {datetime.now().strftime('%Y-%m-%d %H:%M')}"""
            
            return summary
            
        except Exception as e:
            return f"Failed to get email summary: {str(e)}"
    
    def _parse_email(self, message: Dict) -> Dict[str, str]:
        """Parse email message"""
        try:
            headers = message['payload'].get('headers', [])
            
            # Extract headers
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown Sender')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), 'No Date')
            
            # Extract body preview
            snippet = message.get('snippet', '')
            preview = snippet[:100] + '...' if len(snippet) > 100 else snippet
            
            return {
                'subject': subject,
                'sender': sender,
                'date': date,
                'preview': preview
            }
            
        except Exception as e:
            return {
                'subject': 'Parse Error',
                'sender': 'Unknown',
                'date': 'Unknown',
                'preview': f'Error parsing email: {str(e)}'
            }
    
    def check_status(self) -> bool:
        """Check if Gmail is available"""
        return self.is_available
    
    def get_labels(self) -> str:
        """Get Gmail labels"""
        try:
            if not self.service:
                return "Gmail not available."
            
            results = self.service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])
            
            if not labels:
                return "No labels found."
            
            label_list = [label['name'] for label in labels]
            return f"Gmail labels: {', '.join(label_list)}"
            
        except Exception as e:
            return f"Failed to get labels: {str(e)}"