# Quick Start (For use on your local machine)

This guide is for people who want to quickly get started using the application and aren't interested in hosting
it online for others to use. You'll get a default, local user with admin access. We recommend you change
the user password after completing this tutorial.

## Prerequisites

Before starting, ensure you have:
- **Docker** (version 20.10 or higher recommended)
- **Docker Compose** (version 1.29 or higher recommended)
- **Git** (for cloning the repository)
- **At least 4GB of free RAM** (8GB+ recommended for better performance)
- **At least 10GB of free disk space** (for Docker images and data)
- **Operating System**: Linux or macOS (Windows users should use WSL2)

For detailed system requirements and installation guides, see the [System Requirements](requirements.md).

**Estimated Setup Time**: 15-30 minutes (depending on internet speed and system performance)

## **Step 1**: Clone this Repo

Clone the repository into a local directory of your choice. Here, we assume you are using a folder
called source in your user's home directory:

```
    $ cd ~
    $ mkdir source
    $ cd source
    $ git clone https://github.com/Open-Source-Legal/OpenContracts.git
```

## **Step 2**: Copy sample .env files to appropriate folders

Again, we're assuming a local deployment here with basic options. To just get up
and running, you'll want to copy our sample .env file from the `./docs/sample_env_files` directory to the
appropriate `.local` subfolder in the `.envs` directory in the repo root.

First, create the necessary directories:

```
    $ mkdir -p .envs/.local
```

### Backend .Env File

For the most basic deployment, copy [./docs/sample_env_files/backend/local/.django](https://github.com/Open-Source-Legal/OpenContracts/blob/main/docs/sample_env_files/backend/local/.django)
to `./.envs/.local/.django` and copy [./docs/sample_env_files/backend/local/.postgres](https://github.com/Open-Source-Legal/OpenContracts/blob/main/docs/sample_env_files/backend/local/.postgres)
to `./.envs/.local/.postgres`:

```
    $ cp ./docs/sample_env_files/backend/local/.django ./.envs/.local/.django
    $ cp ./docs/sample_env_files/backend/local/.postgres ./.envs/.local/.postgres
```

**IMPORTANT**: The sample files now include default values for all required fields. However, for security reasons, you should:
1. **Generate a unique Django secret key** (required for production):
   ```
   $ python3 -c "import secrets; print(secrets.token_urlsafe(50))"
   ```
   Then update `DJANGO_SECRET_KEY` in `./.envs/.local/.django` with the generated value.

2. **Review and update credentials** in the `.env` files:
   - Django admin password: `DJANGO_SUPERUSER_PASSWORD` in `.django`
   - PostgreSQL credentials: `POSTGRES_USER` and `POSTGRES_PASSWORD` in `.postgres`
   - Celery Flower credentials: `CELERY_FLOWER_USER` and `CELERY_FLOWER_PASSWORD` in `.django`

**Note**: The application will not start if `DJANGO_SECRET_KEY` is empty.

### Frontend .Env File

You also need to copy the appropriate .frontend env file as `./.envs/.local/.frontend`. We're assuming you're
not using something like auth0 and are going to rely on Django auth to provision and authenticate users. Copy
[./docs/sample_env_files/frontend/local/django.auth.env](https://github.com/Open-Source-Legal/OpenContracts/blob/main/docs/sample_env_files/frontend/local/django.auth.env) to
`./.envs/.local/.frontend`:

```
    $ cp ./docs/sample_env_files/frontend/local/django.auth.env ./.envs/.local/.frontend
```

## **Step 3**: Build the Stack

Change into the directory of the repository you just cloned, e.g.:

```
    $ cd OpenContracts
```

Now, you need to build the docker compose stack. If you are okay with the default username and password, and, most
importantly, you are NOT PLANNING TO HOST THE APPLICATION online, the default local settings are sufficient.

**Note:** The build process requires the .env files to be in place (from Step 2), as Docker will use these during the build.

```
    $ docker-compose -f local.yml build
```

This command will:
- Download base Docker images (Python, PostgreSQL, Redis, etc.)
- Install Python dependencies
- Build the custom Django application image
- Set up the development environment

**First-time build may take 10-20 minutes depending on your internet connection.**

## **Step 4** Choose Frontend Deployment Method

__Option 1__ Use "Fullstack" Profile in Docker Compose

If you're **not** planning to do any frontend development, the easiest way to get started with OpenContracts is to
just type:

```commandline
    $ docker-compose -f local.yml --profile fullstack up
```

This will start docker compose and add a container for the frontend to the stack.

__Option 2__ Use Node to Deploy Frontend

If you plan to actively develop the frontend, you'll need to run the backend and frontend separately.

First, start the backend services (without the frontend):

```commandline
    $ docker-compose -f local.yml up
```

Then, in a new terminal, navigate to the
[/frontend](https://github.com/Open-Source-Legal/OpenContracts/tree/main/frontend) folder and run:

```commandline
    $ cd frontend
    $ yarn install
    $ yarn start
```

This will bring up the frontend with hot reload enabled. You can then edit the frontend code as desired and see changes instantly.

Congrats! You have OpenContracts running.

## **Step 5**: Verify Installation

Before logging in, let's verify everything is running correctly:

1. **Check that all containers are running:**
   ```
   $ docker-compose -f local.yml ps
   ```
   You should see containers for: django, postgres, redis, celeryworker, celerybeat, and (if using Option 1) frontend.

2. **Check the logs for any errors:**
   ```
   $ docker-compose -f local.yml logs django
   ```

3. **Verify the backend is accessible:**
   - Open `http://localhost:8000/admin/` in your browser
   - You should see the Django admin login page

## **Step 6**: Login and Start Annotating

Access the frontend based on your deployment method:

- **Option 1 (Docker fullstack)**: `http://localhost:3000`
- **Option 2 (Local development)**: `http://localhost:5173`

You can login with the default username and password. These are set in the environment variable file you copied in Step 2:
- **Username**: admin
- **Password**: Openc0ntracts_def@ult (unless you changed it in `./.envs/.local/.django`)

### Accessing the Admin Interface

The Django admin interface is available at:
- `http://localhost:8000/admin/`

You can use the same admin credentials to access this interface, where you can:
- Create and manage users
- View and manage documents
- Configure system settings

See our [guide](./configuration/add-users.md) for how to create new users through the admin interface.

**NOTE: The frontend runs on different ports depending on deployment method (3000 for Docker, 5173 for local dev). The backend API is always on port 8000**.

## **Important Notes**

- The quick start local config is designed for use on a local machine, not for access over the Internet or a network.
- It uses the local disk for storage (not AWS), and Django's built-in authentication system (not Auth0 or other external providers).
- For production deployments with external access, additional security configuration is required.
- Remember to change the default passwords before any production use.

## **Troubleshooting**

### Common Issues

1. **Port already in use**: If you get an error about ports 3000, 5173, or 8000 being in use, either:
   - Stop the service using that port
   - Or modify the port mappings in `local.yml`

2. **Permission denied errors**: On Linux/Mac, you may need to run Docker commands with `sudo`

3. **Database connection errors**: Ensure the postgres container is fully started before the django container. The system should handle this automatically, but if issues persist, try:
   ```
   $ docker-compose -f local.yml down
   $ docker-compose -f local.yml up
   ```

   If you're reusing an existing PostgreSQL volume with different credentials, clean the volumes:
   ```
   $ docker-compose -f local.yml down -v
   $ docker-compose -f local.yml up
   ```

4. **Missing .envs directory**: Make sure you created the `.envs/.local/` directory and copied all three required env files (.django, .postgres, and .frontend)

5. **Login issues**: Verify the username and password match what's in your `.envs/.local/.django` file

6. **Django won't start - SECRET_KEY error**: If you see "The SECRET_KEY setting must not be empty", ensure you've set a value for `DJANGO_SECRET_KEY` in `./.envs/.local/.django`. Generate one with:
   ```
   $ python3 -c "import secrets; print(secrets.token_urlsafe(50))"
   ```

For more detailed configuration options, see our [configuration guides](./configuration/choose-and-configure-docker-stack.md).

## **Useful Docker Commands**

Here are some helpful commands for managing your OpenContracts installation:

### Container Management
```bash
# View running containers
$ docker-compose -f local.yml ps

# Stop all containers
$ docker-compose -f local.yml down

# Stop and remove all containers and volumes (WARNING: deletes data)
$ docker-compose -f local.yml down -v

# Restart a specific service
$ docker-compose -f local.yml restart django

# View logs for a specific service
$ docker-compose -f local.yml logs -f django
```

### Database Management
```bash
# Create a database backup
$ docker-compose -f local.yml exec postgres backup

# Run Django shell
$ docker-compose -f local.yml run django python manage.py shell

# Run database migrations manually
$ docker-compose -f local.yml run django python manage.py migrate
```

### Troubleshooting
```bash
# Rebuild containers after code changes
$ docker-compose -f local.yml build

# Remove unused Docker resources
$ docker system prune -a
```
