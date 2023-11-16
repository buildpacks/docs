# Stage 1: Build Golang backend
FROM golang:latest AS backend

WORKDIR /app

# Copy and build the Golang application
COPY . .
RUN go build -o main ./*.go

# Stage 2: Build frontend assets (SCSS to CSS)
FROM node:latest AS frontend

WORKDIR /app

# Copy only the necessary frontend files (SCSS, etc.)
COPY . .

# Install dependencies and compile SCSS to CSS
RUN npm install -g sass   # Install SASS globally
RUN sass input.scss output.css   # Replace with your SCSS compilation command

# Stage 3: Final stage
FROM golang:latest

WORKDIR /app

# Copy the built Golang binary from the first stage
COPY --from=backend /app/main .

# Copy the compiled CSS files from the second stage
COPY --from=frontend /app/output.css ./public/output.css

# Expose the port your web application runs on (if applicable)
EXPOSE 8080

# Set the default command to start the web server 
CMD ["./main"]


#if you are more familiar with CCS for frontend development than SCSS use these instruction 
# Install dependencies and compile SCSS to CSS
RUN npm install -g sass   # Install SASS globally (if using Node.js)
RUN sass input.scss output.css   # Replace with your SCSS compilation command
