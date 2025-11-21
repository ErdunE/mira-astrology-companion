# Project Title: Mira
Short project summary (2–3 sentences).
> This repository contains the full implementation of our CS6620 Cloud Computing Final Project. The application provides an AI-powered astrology chat assistant that generates personalized birth charts and interpretations.

--

### Team Members
- Fullname: Erdun E
- Fullname: Raj Kavathekar
- Fullname: Davie Wu

**Team Roles**
Describe what role each team member will take in this project and the tasks assigned to each member. 
> Erdun E: Project Manager, Backend Expert, Software developer
> Raj Kavathekar: Senior Prompt Enginer, Frontend Expert, Web developer
> Davie Wu: Site Reliability Engineer, Infrastructure Expert, Junior Developer

--

### Repository Structure

Your repo must follow this layout:

```
/.github/    # CICD, Pull request template
/app/        # Application source code
/data/       # Data plan, data requirements or scripts
/infra/      # IaC (Terraform/SAM/etc)
/docs/       # Architecture, ERD, progress report, budget
/scripts/    # Optional bash scripts
/roles/      # json policies to follow for IAM roles
/.gitignore/ # Ignore the log, cache and other docs
README.md    # Project overview and documentation
```


--

### Project Overview

#### Brief Description / Context
A brief description/context of the problem you are approaching and problem understanding. 

* Why is this topic relevant?
  * AI emotional-support systems are increasingly important as users seek accessible, personalized guidance tools that are in compliance to mental health and user safety guardrails. The astrology aspect allows users to off-load some personal issues they face that are beyond their control, this allows them to reflect emotionally while having hard times be easy to swallow. The project explores how AI can deliver empathetic, context-aware responses while maintaining data security and reliability on the cloud.
* Who does this topic affect? Where does it happen? When did it happen?
  * This application primarily benefits individuals seeking lightweight emotional support or personal reflection in their daily lives. It is designed for users who follow horoscopes and want an interactive, AI-driven experience. 
  * Mira is relevant in everyday contexts where users want brief, private, and accessible emotional support and especially during stressful or uncertain moments. It is globally applicable and always available, leveraging cloud scalability to ensure 24/7 access across time zones and devices.
* What are your motivations for addressing this topic?
  * Our team is interested in building AI chatbots and exploring how to host both the frontend and backend fully on the cloud. We’re curious about how an AI chatbot can interpret horoscope and astrology data to offer emotional support and real-time guidance to users. This project lets us combine technical exploration with a topic that feels engaging and personally meaningful.


**Proposed Solution:**  
High-level description of the application, key features, and user flow.
> your answer

**Cloud Provider:**  
AWS / GCP / Azure (with justification).
> your answer

**Programming Languages in this Project:**  
Python/Java, and other programming languages approved by Prof GS for other parts of your project
> your answer


--

### Architecture

Your diagram must:

* Use official cloud icons
* Use solid arrows for synchronous calls, dashed for asynchronous
* Include high-level labels describing each component’s purpose
* Include clear boundaries (public vs private)

**Miro Diagram:**  
[Click here to view the architecture diagram](ADD_LINK_HERE)
Additionally include a PDF copy of your architecture under `\docs`.


Answer the following questions.

**List every service/tool you are using, with an explanation of why you chose that particular service for your application.**
This includes specific services in your cloud provided, as well as external tools we've used during the semester (e.g. Docker, Terraform)
> your answer

**How will users access your app? (VPC, Subnets, Security Groups)**
> your answer

**Where will your application run? (Serverless, containers, VMs)**
> your answer

**How will resources and developers authenticate and authorize? (IAM roles, users or policies)**
> your answer

**How will your app handle failures? (AZs, backups, etc)**
Your app must be in at least 2 AZs to ensure reliability
> your answer


**How will you manage latency and costs through auto-scaling/load balancing?**
> your answer


--
### Infrastructure as Code
As a requirement for this project, you must develop IaC. Define how this will look for your particular project, and how you will do IaC and with which tools (e.g. Terraform).

> your answer

--
### IAM Roles and Policies
Outline the IAM Roles you need to create for this project and explain why each role is necessary.
> your answer

For this phase you must complete all IAM policies and store them in this repo under `\roles`.


--

### Project Budget

Use the [website](https://instances.vantage.sh/) already provided to you during the course to create a project budget. Under `\docs`, you should add a spreadsheet with all the different resources you plan to use during the project and the projected cost.

Use the structure below for your spreadsheet. Feel free to add additional columns.

| Service | Resource | Estimated usage time | Total Estimated cost |
|---|---|---|---|

Add up time and cost at the end of the columns.

--

### References

Any resources or citations should be listed here
[]