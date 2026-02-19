# Use a slim Node.js LTS image as the base
FROM node:20-slim

RUN apt-get update && apt-get install -y git

# Set the working directory inside the container
RUN git clone https://github.com/opengovsg/pdf2md.git /app && \
    cd /app && \
    npm ci

# Create folders for input and output to act as mount points
RUN mkdir /input /output

# The entrypoint is the npx command for the library
# We use 'sh -c' to allow passing arguments easily through the docker run command
ENTRYPOINT ["node", "/app/lib/pdf2md-cli.js", "--max-old-space-size=4096"]

# Default arguments (can be overridden by the user)
CMD ["--help"]