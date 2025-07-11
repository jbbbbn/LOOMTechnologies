"""
Google Calendar Integration Tool
"""

import os
from typing import Dict, List, Any
from datetime import datetime, timedelta
import json

class GoogleCalendarTool:
    def __init__(self):
        self.credentials_path = os.getenv("GOOGLE_CREDENTIALS_PATH")
        self.is_available = self.credentials_path is not None
        self.service = None
        
        if self.is_available:
            self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Calendar service"""
        try:
            # Import Google API libraries
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
            
            # Define scopes
            SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
            
            creds = None
            # Load existing credentials
            if os.path.exists('token.json'):
                creds = Credentials.from_authorized_user_file('token.json', SCOPES)
            
            # If no valid credentials, let user log in
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_path, SCOPES)
                    creds = flow.run_local_server(port=0)
                
                # Save credentials for next run
                with open('token.json', 'w') as token:
                    token.write(creds.to_json())
            
            self.service = build('calendar', 'v3', credentials=creds)
            print("✅ Google Calendar service initialized")
            
        except Exception as e:
            print(f"❌ Google Calendar initialization failed: {e}")
            self.is_available = False
    
    def manage_calendar(self, request: str) -> str:
        """Main calendar management function"""
        try:
            request_lower = request.lower()
            
            if "list" in request_lower or "show" in request_lower:
                return self.list_events()
            elif "create" in request_lower or "add" in request_lower:
                return self.create_event(request)
            elif "update" in request_lower or "modify" in request_lower:
                return self.update_event(request)
            elif "delete" in request_lower or "remove" in request_lower:
                return self.delete_event(request)
            elif "free" in request_lower or "available" in request_lower:
                return self.check_availability(request)
            else:
                return self.list_events()
                
        except Exception as e:
            return f"Calendar management error: {str(e)}"
    
    def list_events(self, days: int = 7) -> str:
        """List upcoming events"""
        try:
            if not self.service:
                return "Google Calendar not available. Please configure credentials."
            
            # Get events from now to 7 days ahead
            now = datetime.utcnow().isoformat() + 'Z'
            end_time = (datetime.utcnow() + timedelta(days=days)).isoformat() + 'Z'
            
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=now,
                timeMax=end_time,
                maxResults=10,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            if not events:
                return f"No upcoming events found in the next {days} days."
            
            event_list = []
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                summary = event.get('summary', 'No title')
                event_list.append(f"• {summary} - {start}")
            
            return f"Upcoming events ({days} days):\n" + "\n".join(event_list)
            
        except Exception as e:
            return f"Failed to list events: {str(e)}"
    
    def create_event(self, request: str) -> str:
        """Create a new event"""
        try:
            if not self.service:
                return "Google Calendar not available. Please configure credentials."
            
            # Parse event details from request
            # This is a simplified parser - in production, use more sophisticated NLP
            event_data = self._parse_event_request(request)
            
            event = {
                'summary': event_data.get('title', 'New Event'),
                'description': event_data.get('description', ''),
                'start': {
                    'dateTime': event_data.get('start_time', datetime.now().isoformat()),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': event_data.get('end_time', (datetime.now() + timedelta(hours=1)).isoformat()),
                    'timeZone': 'UTC',
                },
            }
            
            created_event = self.service.events().insert(
                calendarId='primary',
                body=event
            ).execute()
            
            return f"Event created: {created_event.get('summary')} at {created_event['start']['dateTime']}"
            
        except Exception as e:
            return f"Failed to create event: {str(e)}"
    
    def update_event(self, request: str) -> str:
        """Update an existing event"""
        return "Event update functionality not fully implemented yet."
    
    def delete_event(self, request: str) -> str:
        """Delete an event"""
        return "Event deletion functionality not fully implemented yet."
    
    def check_availability(self, request: str) -> str:
        """Check calendar availability"""
        try:
            if not self.service:
                return "Google Calendar not available. Please configure credentials."
            
            # Check today's availability
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow = today + timedelta(days=1)
            
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=today.isoformat() + 'Z',
                timeMax=tomorrow.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            if not events:
                return "You're completely free today!"
            
            busy_times = []
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))
                summary = event.get('summary', 'Busy')
                busy_times.append(f"• {summary}: {start} - {end}")
            
            return f"Today's schedule:\n" + "\n".join(busy_times)
            
        except Exception as e:
            return f"Failed to check availability: {str(e)}"
    
    def _parse_event_request(self, request: str) -> Dict[str, Any]:
        """Parse event creation request"""
        # Simplified parser - in production, use better NLP
        return {
            'title': 'Parsed Event',
            'description': f'Event created from: {request}',
            'start_time': datetime.now().isoformat(),
            'end_time': (datetime.now() + timedelta(hours=1)).isoformat()
        }
    
    def check_status(self) -> bool:
        """Check if Google Calendar is available"""
        return self.is_available
    
    def get_calendar_summary(self) -> str:
        """Get calendar summary"""
        try:
            today_events = self.list_events(days=1)
            week_events = self.list_events(days=7)
            return f"Calendar Summary:\n\nToday:\n{today_events}\n\nThis Week:\n{week_events}"
        except Exception as e:
            return f"Failed to get calendar summary: {str(e)}"