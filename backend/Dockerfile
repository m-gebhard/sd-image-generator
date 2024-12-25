FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

WORKDIR /app

# Install system dependencies for Python libraries
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy files
COPY . /app
COPY .env /app/.env

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Symlink python3 to python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set env variables
ENV PYTHONUNBUFFERED=1

# Start application
EXPOSE 8765
CMD ["python", "main.py"]