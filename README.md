# Jira Backlog Triage App

**Log Juggler** is an Atlassian Forge application for reviewing, editing, and triaging Jira backlog issues through an interactive workflow.

Built with **TypeScript, React, Atlassian Forge, Atlaskit, Zod, Jest, and the Jira REST and Agile APIs**.

## Features

* **Interactive backlog triage** — review Jira issues using swipe gestures or keyboard controls and choose to retain, delete, or move issues into an active sprint.
* **Inline issue editing** — update issue summaries, priorities, story-point estimates, and other supported Jira fields directly from the triage interface.
* **Persistent review state** — stores per-user, per-board review state so previously triaged issues can be tracked across sessions.
* **Action history and undo** — maintains in-session action history and supports undo for applicable actions.
* **Optimistic updates with rollback** — updates the interface immediately while restoring the previous state if a backend operation fails.
* **Jira integration** — retrieves and updates issues through Jira REST and Agile APIs.
* **Typed API contracts** — shared Zod schemas define and validate data exchanged between the frontend and backend.

## Architecture

The application is split into a React Custom UI frontend and an Atlassian Forge backend.

```text
React Custom UI
      |
      v
Shared API contracts
      |
      v
Forge resolvers
      |
      v
Application services
     /         \
    v           v
Jira APIs   Forge storage
```

The frontend handles issue presentation, interaction state, inline editing, action history, and optimistic updates. Forge resolvers expose the backend operations used by the interface, while application services contain Jira integration and triage logic. Per-user review state is persisted using Forge-hosted storage.

## Swipe Mode

Swipe Mode is the primary triage workflow.

Issues can be reviewed individually using drag gestures or keyboard controls. Actions are mapped to retaining an issue, deleting it, or moving it into an active sprint. The interface performs optimistic updates so the next issue can be displayed immediately, while failed backend operations restore the previous state.

Issue fields can also be edited directly from the card without leaving the triage workflow.

## Testing

Backend Jest tests cover application logic, persistence behaviour, Jira field handling, query construction, and failure paths.

The repository also contains frontend tests for Matrix Mode.

## My Contribution

This project was developed as a team capstone. I served as **Scrum Master and Software Developer**.

I designed and implemented the final application architecture and all major functionality except **Matrix Mode and its frontend test suite**, which were implemented by other team members.

My engineering work included:

* overall frontend/backend application architecture;
* shared TypeScript and Zod API contracts;
* Jira backlog retrieval and field mapping;
* Jira REST and Agile API integration;
* Swipe Mode and its interaction workflow;
* inline issue editing;
* persistent per-user review state;
* action history and undo;
* optimistic updates and rollback;
* backend application logic and Jest tests.

I also contributed to sprint planning, Jira stories and epics, meetings, Git workflow, code review, and overall project coordination.

## Project Scope

This repository represents the completed capstone application. It is intended as a portfolio example of full-stack TypeScript development, external API integration, application architecture, state management, testing, and collaborative software development.


Screenshots:


<img width="664" height="235" alt="image" src="https://github.com/user-attachments/assets/e99f1c8c-2bc3-4430-9a11-afb18884cc62" />

<img width="610" height="163" alt="image" src="https://github.com/user-attachments/assets/3995918a-f77a-4a92-807e-03e4df0533bb" />

<img width="636" height="256" alt="image" src="https://github.com/user-attachments/assets/900d5b0f-9a1b-4990-939e-4a47d8d74061" />


