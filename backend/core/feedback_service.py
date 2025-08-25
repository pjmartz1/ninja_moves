"""
Accuracy Feedback Service for PDFTablePro
Collects and manages user feedback on extraction accuracy for social proof
"""
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class AccuracyFeedbackService:
    """Service for managing extraction accuracy feedback"""
    
    def __init__(self):
        self.feedback_file = Path("data/accuracy_feedback.json")
        self.feedback_file.parent.mkdir(exist_ok=True)
        self.ensure_feedback_file_exists()
    
    def ensure_feedback_file_exists(self):
        """Initialize feedback file if it doesn't exist"""
        if not self.feedback_file.exists():
            initial_data = {
                "total_feedback": 0,
                "accurate_count": 0,
                "inaccurate_count": 0,
                "accuracy_rate": 0.0,
                "last_updated": datetime.now().isoformat(),
                "feedback_entries": []
            }
            self.save_feedback_data(initial_data)
    
    def load_feedback_data(self) -> Dict[str, Any]:
        """Load feedback data from file"""
        try:
            with open(self.feedback_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading feedback data: {e}")
            return {
                "total_feedback": 0,
                "accurate_count": 0,
                "inaccurate_count": 0,
                "accuracy_rate": 0.0,
                "last_updated": datetime.now().isoformat(),
                "feedback_entries": []
            }
    
    def save_feedback_data(self, data: Dict[str, Any]):
        """Save feedback data to file"""
        try:
            with open(self.feedback_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving feedback data: {e}")
    
    async def submit_feedback(
        self, 
        file_id: str, 
        is_accurate: bool, 
        extraction_method: str = "unknown",
        user_tier: str = "free",
        additional_notes: str = ""
    ) -> Dict[str, Any]:
        """
        Submit accuracy feedback for an extraction
        
        Args:
            file_id: Unique file identifier
            is_accurate: True if extraction was accurate, False otherwise
            extraction_method: Method used for extraction (pdfplumber, camelot, OCR, etc.)
            user_tier: User's tier (free, starter, professional, etc.)
            additional_notes: Optional feedback notes
            
        Returns:
            Dict with submission status and updated statistics
        """
        try:
            # Load current data
            data = self.load_feedback_data()
            
            # Create feedback entry
            feedback_entry = {
                "file_id": file_id,
                "is_accurate": is_accurate,
                "extraction_method": extraction_method,
                "user_tier": user_tier,
                "timestamp": datetime.now().isoformat(),
                "additional_notes": additional_notes
            }
            
            # Update counters
            data["total_feedback"] += 1
            if is_accurate:
                data["accurate_count"] += 1
            else:
                data["inaccurate_count"] += 1
            
            # Calculate new accuracy rate
            if data["total_feedback"] > 0:
                data["accuracy_rate"] = (data["accurate_count"] / data["total_feedback"]) * 100
            
            data["last_updated"] = datetime.now().isoformat()
            
            # Add to entries (keep last 1000 entries)
            data["feedback_entries"].append(feedback_entry)
            if len(data["feedback_entries"]) > 1000:
                data["feedback_entries"] = data["feedback_entries"][-1000:]
            
            # Save updated data
            self.save_feedback_data(data)
            
            logger.info(f"Feedback submitted: {file_id}, accurate: {is_accurate}")
            
            return {
                "success": True,
                "message": "Feedback submitted successfully",
                "accuracy_rate": round(data["accuracy_rate"], 1),
                "total_feedback": data["total_feedback"],
                "accurate_count": data["accurate_count"]
            }
            
        except Exception as e:
            logger.error(f"Error submitting feedback: {e}")
            return {
                "success": False,
                "message": "Failed to submit feedback",
                "error": str(e)
            }
    
    async def get_accuracy_stats(self) -> Dict[str, Any]:
        """Get current accuracy statistics"""
        try:
            data = self.load_feedback_data()
            
            # Calculate additional metrics
            recent_entries = self._get_recent_feedback(data["feedback_entries"], days=30)
            recent_accuracy = self._calculate_accuracy_rate(recent_entries)
            
            method_stats = self._get_method_statistics(data["feedback_entries"])
            
            return {
                "total_feedback": data["total_feedback"],
                "accuracy_rate": round(data["accuracy_rate"], 1),
                "accurate_count": data["accurate_count"],
                "recent_30_days": {
                    "feedback_count": len(recent_entries),
                    "accuracy_rate": round(recent_accuracy, 1) if recent_accuracy else 0
                },
                "method_breakdown": method_stats,
                "last_updated": data["last_updated"],
                "display_stats": self._format_for_display(data)
            }
            
        except Exception as e:
            logger.error(f"Error getting accuracy stats: {e}")
            return {
                "total_feedback": 0,
                "accuracy_rate": 0.0,
                "accurate_count": 0,
                "recent_30_days": {"feedback_count": 0, "accuracy_rate": 0},
                "method_breakdown": {},
                "last_updated": datetime.now().isoformat(),
                "display_stats": {"rate": "N/A", "count": "0"}
            }
    
    def _get_recent_feedback(self, entries: list, days: int = 30) -> list:
        """Filter feedback entries from the last N days"""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_entries = []
        
        for entry in entries:
            try:
                entry_date = datetime.fromisoformat(entry["timestamp"])
                if entry_date >= cutoff_date:
                    recent_entries.append(entry)
            except:
                continue
        
        return recent_entries
    
    def _calculate_accuracy_rate(self, entries: list) -> Optional[float]:
        """Calculate accuracy rate for given entries"""
        if not entries:
            return None
        
        accurate_count = sum(1 for entry in entries if entry.get("is_accurate", False))
        return (accurate_count / len(entries)) * 100
    
    def _get_method_statistics(self, entries: list) -> Dict[str, Dict[str, Any]]:
        """Get accuracy statistics broken down by extraction method"""
        method_stats = {}
        
        for entry in entries:
            method = entry.get("extraction_method", "unknown")
            if method not in method_stats:
                method_stats[method] = {
                    "total": 0,
                    "accurate": 0,
                    "accuracy_rate": 0.0
                }
            
            method_stats[method]["total"] += 1
            if entry.get("is_accurate", False):
                method_stats[method]["accurate"] += 1
        
        # Calculate rates
        for method in method_stats:
            total = method_stats[method]["total"]
            accurate = method_stats[method]["accurate"]
            method_stats[method]["accuracy_rate"] = round((accurate / total) * 100, 1) if total > 0 else 0
        
        return method_stats
    
    def _format_for_display(self, data: Dict[str, Any]) -> Dict[str, str]:
        """Format statistics for frontend display"""
        accuracy_rate = data.get("accuracy_rate", 0)
        total_feedback = data.get("total_feedback", 0)
        
        # Format for social proof display
        if accuracy_rate >= 90:
            rate_display = f"{accuracy_rate:.0f}%+"
        else:
            rate_display = f"{accuracy_rate:.1f}%"
        
        # Format count for display
        if total_feedback >= 1000:
            count_display = f"{total_feedback//1000}K+"
        elif total_feedback >= 100:
            count_display = f"{total_feedback}+"
        else:
            count_display = str(total_feedback)
        
        return {
            "rate": rate_display,
            "count": count_display,
            "message": f"{rate_display} accuracy confirmed by {count_display} users"
        }

# Global instance
feedback_service = AccuracyFeedbackService()