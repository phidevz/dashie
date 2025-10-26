# Dashie (v2)

This is a dashboard intended to be used behind a SSO web proxy. It can display links to your services depending on the
roles/groups of a user.

## Configuration

Configuration File (`services.yaml`):

* Configure which headers are sent from the SSO proxy (username, displayname, email, roles)
* Configure which services (link) are displayed under which conditions

Environment:

* `NEXT_PUBLIC_HEADING`: Name of your dashboard, displayed on the page and as HTML title
* `CONFIG_FILE`: File inside the container to read the config file (`services.yaml`) from

## How do I deploy this?

Follow the deployment guides for the T3 Stack:

* [Vercel](https://create.t3.gg/en/deployment/vercel)
* [Netlify](https://create.t3.gg/en/deployment/netlify) and
* [Docker](https://create.t3.gg/en/deployment/docker)
