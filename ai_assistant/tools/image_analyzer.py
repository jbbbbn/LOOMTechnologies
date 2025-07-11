"""
CLIP Image Analysis Tool
"""

import os
from typing import Dict, List, Any, Optional
import base64
from PIL import Image
import io
import requests

class ImageAnalyzerTool:
    def __init__(self):
        self.is_available = self._check_dependencies()
        self.clip_model = None
        
        if self.is_available:
            self._initialize_clip()
    
    def _check_dependencies(self) -> bool:
        """Check if required dependencies are available"""
        try:
            import torch
            import clip
            return True
        except ImportError:
            print("❌ CLIP dependencies not available (torch, clip)")
            return False
    
    def _initialize_clip(self):
        """Initialize CLIP model"""
        try:
            import torch
            import clip
            
            # Load CLIP model
            device = "cuda" if torch.cuda.is_available() else "cpu"
            self.clip_model, self.preprocess = clip.load("ViT-B/32", device=device)
            self.device = device
            
            print("✅ CLIP model initialized successfully")
            
        except Exception as e:
            print(f"❌ CLIP initialization failed: {e}")
            self.is_available = False
    
    def analyze_image(self, image_input: str) -> str:
        """Analyze image using CLIP"""
        try:
            if not self.is_available:
                return "Image analysis not available. CLIP dependencies not installed."
            
            # Handle different input formats
            if image_input.startswith("http"):
                return self._analyze_image_url(image_input)
            elif image_input.startswith("data:image"):
                return self._analyze_base64_image(image_input)
            elif os.path.exists(image_input):
                return self._analyze_image_file(image_input)
            else:
                return f"Invalid image input: {image_input}"
                
        except Exception as e:
            return f"Image analysis error: {str(e)}"
    
    def _analyze_image_url(self, url: str) -> str:
        """Analyze image from URL"""
        try:
            response = requests.get(url)
            image = Image.open(io.BytesIO(response.content))
            return self._process_image(image, f"Image from URL: {url}")
            
        except Exception as e:
            return f"Failed to analyze image from URL: {str(e)}"
    
    def _analyze_base64_image(self, base64_data: str) -> str:
        """Analyze base64 encoded image"""
        try:
            # Remove data URL prefix if present
            if "base64," in base64_data:
                base64_data = base64_data.split("base64,")[1]
            
            image_data = base64.b64decode(base64_data)
            image = Image.open(io.BytesIO(image_data))
            return self._process_image(image, "Base64 encoded image")
            
        except Exception as e:
            return f"Failed to analyze base64 image: {str(e)}"
    
    def _analyze_image_file(self, file_path: str) -> str:
        """Analyze image file"""
        try:
            image = Image.open(file_path)
            return self._process_image(image, f"Image file: {file_path}")
            
        except Exception as e:
            return f"Failed to analyze image file: {str(e)}"
    
    def _process_image(self, image: Image.Image, source: str) -> str:
        """Process image with CLIP"""
        try:
            import torch
            import clip
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Preprocess image
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            
            # Define possible descriptions
            descriptions = [
                "a photo of a person",
                "a photo of an animal",
                "a photo of a building",
                "a photo of food",
                "a photo of a vehicle",
                "a photo of nature",
                "a photo of technology",
                "a photo of art",
                "a photo of a document",
                "a photo of clothing",
                "a photo of furniture",
                "a photo of a tool",
                "a photo of a landscape",
                "a photo of a cityscape",
                "a photo of the sky",
                "a photo of water",
                "a photo of plants",
                "a photo of flowers",
                "a photo of books",
                "a photo of music instruments",
                "a photo of sports equipment",
                "a photo of toys",
                "a photo of electronics",
                "a photo of jewelry",
                "a photo of machinery",
                "a photo of transportation",
                "a photo of architecture",
                "a photo of interior design",
                "a photo of abstract art",
                "a photo of a logo or brand"
            ]
            
            # Tokenize descriptions
            text_tokens = clip.tokenize(descriptions).to(self.device)
            
            # Get predictions
            with torch.no_grad():
                image_features = self.clip_model.encode_image(image_tensor)
                text_features = self.clip_model.encode_text(text_tokens)
                
                # Calculate similarities
                similarities = (100.0 * image_features @ text_features.T).softmax(dim=-1)
                values, indices = similarities[0].topk(5)
            
            # Format results
            results = []
            for i, (value, index) in enumerate(zip(values, indices)):
                description = descriptions[index.item()]
                confidence = value.item()
                results.append(f"{i+1}. {description} ({confidence:.1f}%)")
            
            # Get image dimensions
            width, height = image.size
            
            analysis = f"""🖼️ Image Analysis Results:

**Source**: {source}
**Dimensions**: {width}x{height} pixels

**Most likely content**:
{chr(10).join(results)}

**Additional details**:
• Image format: {image.format or 'Unknown'}
• Color mode: {image.mode}
• File size: {len(image.tobytes())} bytes"""
            
            return analysis
            
        except Exception as e:
            return f"Image processing failed: {str(e)}"
    
    def describe_image(self, image_input: str, custom_prompts: List[str] = None) -> str:
        """Describe image with custom prompts"""
        try:
            if not self.is_available:
                return "Image description not available. CLIP dependencies not installed."
            
            if custom_prompts is None:
                custom_prompts = [
                    "What is the main subject of this image?",
                    "What colors are prominent in this image?",
                    "What is the setting or location?",
                    "What mood or atmosphere does this image convey?",
                    "What objects are visible in this image?"
                ]
            
            # This would require a more sophisticated implementation
            # For now, return standard analysis
            return self.analyze_image(image_input)
            
        except Exception as e:
            return f"Image description error: {str(e)}"
    
    def compare_images(self, image1: str, image2: str) -> str:
        """Compare two images"""
        try:
            if not self.is_available:
                return "Image comparison not available. CLIP dependencies not installed."
            
            # This would require loading both images and comparing features
            return "Image comparison functionality not fully implemented yet."
            
        except Exception as e:
            return f"Image comparison error: {str(e)}"
    
    def check_status(self) -> bool:
        """Check if image analysis is available"""
        return self.is_available
    
    def get_supported_formats(self) -> str:
        """Get supported image formats"""
        return "Supported formats: JPG, PNG, GIF, BMP, TIFF, WebP (via PIL)"
    
    def analyze_image_emotions(self, image_input: str) -> str:
        """Analyze emotions in image"""
        try:
            if not self.is_available:
                return "Emotion analysis not available."
            
            # This would require a specialized model for emotion detection
            return "Emotion analysis functionality not fully implemented yet."
            
        except Exception as e:
            return f"Emotion analysis error: {str(e)}"
    
    def extract_text_from_image(self, image_input: str) -> str:
        """Extract text from image (OCR)"""
        try:
            # This would require OCR capabilities (like Tesseract)
            return "OCR functionality not implemented yet. Consider using Tesseract."
            
        except Exception as e:
            return f"OCR error: {str(e)}"
    
    def detect_objects(self, image_input: str) -> str:
        """Detect objects in image"""
        try:
            if not self.is_available:
                return "Object detection not available."
            
            # This would require object detection models
            return "Object detection functionality not fully implemented yet."
            
        except Exception as e:
            return f"Object detection error: {str(e)}"
    
    def analyze_image_quality(self, image_input: str) -> str:
        """Analyze image quality"""
        try:
            # Basic quality analysis using PIL
            if image_input.startswith("http"):
                response = requests.get(image_input)
                image = Image.open(io.BytesIO(response.content))
            elif os.path.exists(image_input):
                image = Image.open(image_input)
            else:
                return "Invalid image input for quality analysis."
            
            width, height = image.size
            total_pixels = width * height
            
            # Basic quality assessment
            quality_score = "High" if total_pixels > 1000000 else "Medium" if total_pixels > 250000 else "Low"
            
            return f"""📊 Image Quality Analysis:
            
• **Resolution**: {width}x{height} ({total_pixels:,} pixels)
• **Quality**: {quality_score}
• **Aspect Ratio**: {width/height:.2f}
• **Color Mode**: {image.mode}
• **Format**: {image.format or 'Unknown'}"""
            
        except Exception as e:
            return f"Quality analysis error: {str(e)}"