# Use lightweight python base
FROM python:3.11-slim

# Prevent python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
# Prevent python from buffering stdout/stderr
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install dependencies strictly
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose defined port
EXPOSE 8001

# Run Uvicorn strictly mapped to external interface
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]