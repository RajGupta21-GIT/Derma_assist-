"""
Derma Assist - PyTorch Deep Convolutional Vision Architecture
Authentic deep neural network for clinical dermatology and HAM10000 lesion classification.
Operates using pure PyTorch (torch.nn) and PIL transforms without requiring torchvision.
"""

import time
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F

from backend.config import CLASSES, CLASS_METADATA, MODEL_DIR, MODEL_PATH

class ResidualBlock(nn.Module):
    """Deep residual block with skip connections, batch norm, and ReLU activation."""
    def __init__(self, in_channels: int, out_channels: int, stride: int = 1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = self.shortcut(x)
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual
        return self.relu(out)

class DermaDeepVisionNet(nn.Module):
    """
    Authentic Deep Convolutional Neural Network for Clinical Dermatology.
    Features 4 residual stages, adaptive spatial pooling, and calibrated classification head.
    """
    def __init__(self, num_classes: int = len(CLASSES)):
        super().__init__()
        # Stem: 3x3 Conv with stride 2 for initial downsampling
        self.stem = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True)
        )
        
        # 4 Residual feature extraction stages
        self.stage1 = ResidualBlock(64, 64, stride=1)
        self.stage2 = ResidualBlock(64, 128, stride=2)
        self.stage3 = ResidualBlock(128, 256, stride=2)
        self.stage4 = ResidualBlock(256, 512, stride=2)
        
        # Global Average Pooling & Multiclass Head
        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.dropout = nn.Dropout(p=0.3)
        self.classifier = nn.Linear(512, num_classes)
        
        # Initialize weights with Kaiming He normal
        self._init_weights()

    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1.0)
                nn.init.constant_(m.bias, 0.0)
            elif isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0.0)

    def forward_features(self, x: torch.Tensor) -> torch.Tensor:
        x = self.stem(x)
        x = self.stage1(x)
        x = self.stage2(x)
        x = self.stage3(x)
        x = self.stage4(x)
        return x

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.forward_features(x)
        pooled = self.global_pool(features).flatten(1)
        dropped = self.dropout(pooled)
        logits = self.classifier(dropped)
        return logits

def preprocess_pil_to_tensor(image: Image.Image, target_size: Tuple[int, int] = (224, 224)) -> torch.Tensor:
    """
    Transforms PIL image into normalized PyTorch CHW tensor (ImageNet standard):
    - Resize with bilinear interpolation
    - Scaling [0, 1]
    - Zero-mean, unit-variance normalization (ImageNet mean & std)
    """
    img_rgb = image.convert("RGB").resize(target_size, Image.Resampling.BILINEAR)
    arr = np.array(img_rgb, dtype=np.float32) / 255.0
    
    # ImageNet normalization
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    normalized = (arr - mean) / std
    
    # HWC -> CHW -> BCHW
    tensor = torch.from_numpy(normalized.transpose(2, 0, 1)).unsqueeze(0).float()
    return tensor
