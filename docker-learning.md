# 🚀 Project Name - Docker & MongoDB Quick Reference

This document provides a quick reference guide for common Docker commands used to manage the project's containers and the essential MongoDB commands for accessing and inspecting the data within the MongoDB container.

---

## 🐳 Docker Management Commands

These commands are used to control the lifecycle and monitor the containers defined in your `docker-compose.yml` file.

| Command | Description | Notes |
| :--- | :--- | :--- |
| `docker compose up` | **Start** all services defined in `docker-compose.yml` and display their **logs** in the foreground. | Use this for development when you need to see real-time output. |
| `docker compose up -d` | **Start** all services in **detached mode** (in the **background**). | Recommended for production or when you want the terminals free. |
| `docker compose logs -f <service_name>` | **Stream logs** (follow `-f`) for a specific service (e.g., `backend` or `frontend`). | Example: `docker compose logs -f backend` |
| `docker compose down` | **Stop** and **remove** the containers, networks, and volumes created by `up`. | This completely cleans up the running environment. |

---

## 💾 MongoDB Access & Inspection

The following steps and commands show you how to connect to your running MongoDB container and interact with the database using the `mongosh` shell.

### 1. Access the MongoDB Container Shell

To connect to the MongoDB container and open the interactive shell:

| Command | Description | Notes |
| :--- | :--- | :--- |
| `docker exec -it <container_name> mongosh` | Executes the `mongosh` command inside the running container interactively (`-it`). | **Important:** Replace `<container_name>` with your actual container name (e.g., `mongo1`). |

*After running this command, you should see the MongoDB shell prompt (e.g., `test>`).*

### 2. Basic Database Commands (inside the `mongosh` shell)

Use these commands inside the shell to navigate and inspect your data.

#### A. Check Existing Databases



        show dbs

#### B. Use Database
        use Notifications

#### C. See Collections
        show collections

