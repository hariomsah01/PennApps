#!/bin/bash

# 🚀 Type-less Deployment Script
echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI not found. Please install it from https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found. Install with: npm install -g netlify-cli"
    fi
    
    print_success "Dependencies check complete"
}

# Build the frontend
build_frontend() {
    print_status "Building frontend for production..."
    npm run build
    if [ $? -eq 0 ]; then
        print_success "Frontend build complete"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Deploy to Heroku
deploy_backend() {
    print_status "Deploying backend to Heroku..."
    
    # Check if Heroku app exists
    if ! heroku apps:info &> /dev/null; then
        print_warning "No Heroku app found. Creating one..."
        read -p "Enter your Heroku app name (or press Enter to auto-generate): " app_name
        if [ -z "$app_name" ]; then
            heroku create
        else
            heroku create "$app_name"
        fi
    fi
    
    # Deploy
    git push heroku main
    if [ $? -eq 0 ]; then
        print_success "Backend deployed to Heroku"
        print_status "Your backend URL: https://$(heroku apps:info --json | grep -o '"name":"[^"]*' | cut -d'"' -f4).herokuapp.com"
    else
        print_error "Backend deployment failed"
        exit 1
    fi
}

# Deploy to Netlify
deploy_frontend() {
    print_status "Deploying frontend to Netlify..."
    
    if command -v netlify &> /dev/null; then
        netlify deploy --prod --dir=build
        if [ $? -eq 0 ]; then
            print_success "Frontend deployed to Netlify"
        else
            print_error "Frontend deployment failed"
            exit 1
        fi
    else
        print_warning "Netlify CLI not available. Please deploy manually:"
        print_status "1. Go to https://netlify.com"
        print_status "2. Drag and drop the 'build' folder"
        print_status "3. Or connect your GitHub repository"
    fi
}

# Main deployment flow
main() {
    echo "🌍 Type-less Prompt Optimizer Deployment"
    echo "========================================"
    
    # Check dependencies
    check_dependencies
    
    # Build frontend
    build_frontend
    
    # Ask user what they want to deploy
    echo ""
    print_status "What would you like to deploy?"
    echo "1) Backend only (Heroku)"
    echo "2) Frontend only (Netlify)"
    echo "3) Both backend and frontend"
    echo "4) Exit"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            echo ""
            deploy_frontend
            ;;
        4)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment process complete!"
    print_status "Don't forget to:"
    print_status "1. Set up MongoDB Atlas"
    print_status "2. Configure environment variables"
    print_status "3. Test your deployed application"
    print_status "4. Check the DEPLOYMENT_GUIDE.md for detailed instructions"
}

# Run main function
main
