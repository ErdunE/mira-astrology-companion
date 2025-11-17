# Backend Development Guide

Python backend for Mira project Lambda functions.

## Prerequisites

- Python 3.10+
- pip

## Setup
```bash
# Create virtual environment
python3 -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify setup
python -c "import boto3; print('Setup successful!')"
```

## Project Structure
```
backend/
├── api/         # API Gateway Lambda handlers
├── worker/      # SQS-triggered Lambda handlers
├── common/      # Shared utilities
└── requirements.txt
```

## Local Testing
```bash
# Test API handler
python api/handler.py

# Test Worker handler
python worker/handler.py
```

## Adding Dependencies
```bash
pip install <package-name>
pip freeze > requirements.txt
```

## Development Workflow

1. Create feature branch: `feature/backend-<description>`
2. Write code in appropriate directory
3. Test locally
4. Open PR to `dev`
5. CI will validate Python syntax