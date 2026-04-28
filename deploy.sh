#!/bin/bash

# ================= CONFIGURATION =================
# We use quotes here because of the space in the path
PROJECT_NAME="ai-kids-quiz"
PROJECT_PATH="/www/wwwroot/ai-kids-quiz"
LOG_FILE="$PROJECT_PATH/deploy.log"
BRANCH="master"
# =================================================

# 1. SETUP LOGGING
# Create log file if it doesn't exist and set permissions
if [ ! -f "$LOG_FILE" ]; then 
    # Create the folder if it doesn't exist (safety)
    mkdir -p "$PROJECT_PATH"
    touch "$LOG_FILE"
    chown www:www "$LOG_FILE"
    chmod 666 "$LOG_FILE"
fi

# Redirect all output to the log file for aaPanel log viewing
exec > >(tee -a "$LOG_FILE") 2>&1

echo " "
echo "============================================================"
echo "🚀 DEPLOYMENT STARTED: $PROJECT_NAME"
echo "🕒 Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================================"

# 2. FIX PERMISSIONS & GIT SAFETY
echo "🔧 Fixing permissions and git safety..."
export HOME="$PROJECT_PATH"

if [ -d "$PROJECT_PATH" ]; then
    cd "$PROJECT_PATH"
else
    echo "❌ ERROR: Directory $PROJECT_PATH not found!"
    exit 1
fi

git config --add safe.directory "$PROJECT_PATH"

# Ensure www user owns the project files
chown -R www:www "$PROJECT_PATH"

# 3. PULL CODE (Using sudo -u www to keep .git folder permissions correct)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code from GitHub ($BRANCH)..."
    sudo -u www git fetch origin $BRANCH
    sudo -u www git reset --hard origin/$BRANCH
    echo "✔ Code synced successfully."
else
    echo "⚠ No .git folder found. Skipping pull."
fi

# 4. DOCKER BUILD
echo "🐳 Docker Build Started (Port 3005)..."

# Stop old containers and orphans
/usr/bin/docker compose -f docker-compose.prod.yml down --remove-orphans

# Build and start new version using the PRODUCTION file
/usr/bin/docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

# Check status
if [ $? -eq 0 ]; then
    echo "✔ Containers Built Successfully."
else
    echo "❌ ERROR: Docker Build Failed. Check logs above."
    exit 1
fi

# 5. CLEANUP & PERMISSIONS FIX
echo "🧹 Cleaning up and fixing data permissions..."
/usr/bin/docker image prune -f

# IMPORTANT: AI Quiz Maker uses 'uploads' for source docs and 'outputs' for cached quizzes
# We set these to 777 to ensure the Docker container can read/write them
mkdir -p "$PROJECT_PATH/uploads"
mkdir -p "$PROJECT_PATH/outputs"
chown -R www:www "$PROJECT_PATH/uploads"
chown -R www:www "$PROJECT_PATH/outputs"
chmod -R 777 "$PROJECT_PATH/uploads"
chmod -R 777 "$PROJECT_PATH/outputs"

echo "============================================================"
echo "✅ DEPLOYMENT FINISHED - Live at port 3005"
echo "============================================================"
echo " "
echo "🔧 Final permissions check..."
echo " "

# Double check write access for the data folders
sudo chmod -R 777 "$PROJECT_PATH/uploads"
sudo chmod -R 777 "$PROJECT_PATH/outputs"

echo "Deployment complete and permissions updated!"

echo "============================================================"
echo "✅ SUCCESS"
echo "============================================================"
echo " "
