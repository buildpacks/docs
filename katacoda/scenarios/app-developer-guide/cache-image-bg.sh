#!/bin/bash
docker run -e REGISTRY_STORAGE_DELETE_ENABLED=true -d -p 5000:5000 --restart=always --name registry registry:2
