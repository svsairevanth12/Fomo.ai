# FOMO Backend Setup Script (PowerShell)
# Run this to set up the Python backend

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FOMO Backend Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists" -ForegroundColor Green
} else {
    python -m venv venv
    Write-Host "Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "Dependencies installed" -ForegroundColor Green

# Create .env file if it does not exist
Write-Host ""
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host ".env file already exists" -ForegroundColor Green
} else {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env file from template" -ForegroundColor Green
    } else {
        "ASSEMBLYAI_API_KEY=your_assemblyai_key_here`nANTHROPIC_API_KEY=your_anthropic_key_here" | Out-File -FilePath ".env" -Encoding utf8
        Write-Host "Created .env file" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "IMPORTANT: Edit .env and add your API keys!" -ForegroundColor Yellow
    Write-Host "   - ASSEMBLYAI_API_KEY" -ForegroundColor Yellow
    Write-Host "   - ANTHROPIC_API_KEY" -ForegroundColor Yellow
}

# Create data directory
Write-Host ""
Write-Host "Creating data directory..." -ForegroundColor Yellow
if (Test-Path "data") {
    Write-Host "Data directory already exists" -ForegroundColor Green
} else {
    New-Item -ItemType Directory -Path "data" | Out-Null
    Write-Host "Data directory created" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env and add your API keys" -ForegroundColor White
Write-Host "2. Run: python app.py" -ForegroundColor White
Write-Host ""
Write-Host "API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

