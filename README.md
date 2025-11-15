# Project Title  
Short project summary (2–3 sentences).
> your answer

--

### Team Members
- Fullname:
- Fullname:
- Fullname:

**Team Roles**
Describe what role each team member will take in this project and the tasks assigned to each member. 
> your answer

--

### Repository Structure

Your repo must follow this layout:

```
/app/        # Application source code
/data/       # Data plan, data requirements or scripts
/infra/      # IaC (Terraform/SAM/etc)
/docs/       # Architecture, ERD, progress report, budget
/scripts/    # Optional bash scripts
/roles/      # json policies to follow for IAM roles
README.md    # Project overview and documentation
```


--

### Project Overview

#### Brief Description / Context
A brief description/context of the problem you are approaching and problem understanding. 

* Why is this topic relevant?
* Who does this topic affect? Where does it happen? When did it happen?
* What are your motivations for addressing this topic?


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