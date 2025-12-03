## Table of Contents  

1. Executive Summary  
2. Architecture Documentation  
3. Integration of Course Concepts  
4. Cloud Evidence  
5. Data Models  
6. Integrating Feedback  
7. Challenges, Lessons Learned, and Future Work  
8. References  
9. Use of Generative AI (Full Disclosure)  

---

## 1. Executive Summary

Mira is an AI-powered astrology companion designed to give users a lightweight, always-available way to reflect on their emotions and decisions. Many people already engage with horoscopes and astrology as a low-stakes, familiar framework for thinking about their lives, but most existing horoscope apps are static, generic, and only loosely tied to each user’s personal context. At the same time, traditional mental-health or coaching tools can feel too formal, too high-friction, or inaccessible for people who just want occasional, private guidance. Mira aims to bridge this gap by offering an engaging, personalized, and cloud-hosted “cosmic companion” that users can talk to whenever they need it.

The core of our solution is a web-based chat experience where users authenticate securely, create a profile with their birth information, and then converse with an AI astrologer that combines their profile, birth chart insights, and horoscope data. Behind the scenes, Mira integrates an external astrology API for chart and horoscope information with a large language model (LLM) hosted on AWS Bedrock. The system uses these signals to generate tailored responses and chart visualizations that feel more relevant than a one-size-fits-all daily horoscope. The chat interface, birth chart visuals, and profile pages are delivered through a modern React single-page application (SPA), making the experience smooth and visually appealing on both desktop and mobile.

The primary beneficiaries of Mira are users who already have some interest in astrology or reflective journaling, and who want a gentle, low-pressure way to think about their feelings, choices, and patterns. Instead of scrolling through generic content, they can have a two-way conversation that takes into account their past chats and personal details, while still clearly framing the experience as reflective support rather than professional therapy. Because the app is fully cloud-hosted and serverless, it is designed to be available 24/7, scale up and down automatically with usage, and support users in different time zones without manual intervention from our team.

From a non-technical perspective, our implementation can be understood as a secure website talking to a managed “brain” in the cloud. The React frontend runs from a static hosting service and uses Amazon Cognito for sign-up and sign-in, so each user’s data stays associated with their own account. When a user types a message, it is sent through a managed API layer to a serverless backend function, which retrieves their stored profile and recent chat context, consults the astrology API and the Bedrock LLM, and returns a combined response. All of this runs on managed, pay-per-use services—there are no traditional servers to maintain—so we can focus on the quality of the user experience while AWS handles reliability, scaling, and most security primitives.

---

## 2. Architecture Documentation

### 2.1 Architectural Diagrams

Our architecture is documented visually using a Miro diagram that captures the full end-to-end flow from the user’s browser to AWS services and external APIs. The diagram shows the public-facing frontend, the authentication flow, the API gateway, the serverless backend, and the various data and AI components behind the scenes, with clear boundaries between public and private network layers and labels for each major service.

- **Miro diagram link:**  
  [Mira Architecture – Miro Board](https://miro.com/app/board/uXjVJsOlhH8=/?share_link_id=35191105301)

- **PDF architecture diagram:**  
  [Architecture Diagram (PDF)](../architecture/CS6620%20FCC%20Final%20Project%20Architecture%20Diagram.pdf)

At a high level, the diagram shows a user accessing the Mira web application via a CloudFront distribution backed by an S3 static website bucket. After authentication with Amazon Cognito, the React SPA sends authenticated requests through an API Gateway HTTP API, which invokes a single consolidated AWS Lambda function for API logic. That Lambda runs inside a custom VPC and interacts with DynamoDB tables for user state and conversations, an S3 artifacts bucket for chart images, AWS Bedrock via a VPC interface endpoint for LLM-generated guidance, and an external Astrologer API with credentials stored in AWS Secrets Manager. Supporting components like VPC endpoints, CloudWatch logs, and alarms are also shown so that the diagram matches the deployed system.

### 2.2 High-Level System Overview

The **frontend** is a React + Vite single-page application located under `/app/frontend`. It provides the main user-facing flows: a landing page that explains Mira, onboarding and profile creation screens for collecting birth and location information, a first-time chat experience to introduce the AI astrologer, the main chat view, and a profile page where users can review and update their data. The SPA is built with Tailwind CSS, shadcn/ui, and Framer Motion to produce a polished “cosmic” theme. In production, the built assets are uploaded to an S3 bucket and served via a CloudFront distribution for low-latency global access and HTTPS termination.

For **authentication**, we use an Amazon Cognito User Pool configured via the `cognito_auth` Terraform module. Cognito manages sign-up, sign-in, password handling, and token issuance, and exposes a Hosted UI that handles most of the complex security flows on our behalf. The Hosted UI is configured with callback and logout URLs for both local development (`http://localhost:5173/callback`) and the production CloudFront domain. After a successful login, the SPA stores the JWT from Cognito (e.g., in `localStorage`) and attaches it as an Authorization header to all API requests, enabling end-to-end, token-based security without the backend handling raw passwords.

The **API layer** is implemented using an AWS API Gateway HTTP API, defined by the `api_gateway` Terraform module. This API exposes versioned endpoints for health checks, profile management, horoscope/chart requests, and chat interactions. API Gateway is configured with a Cognito authorizer that validates incoming JWTs against our User Pool, so only authenticated users can access protected endpoints. Once a request is authorized, API Gateway forwards it as a Lambda proxy event to the backend Lambda function along with the necessary headers and context.

The **backend compute** is a Python 3.10 AWS Lambda function provisioned through the `lambda_api` module as `mira-api-dev`. Within the Lambda source, the code is structured into `api` handlers and shared `common` utilities. Handlers like `profile_handler.py`, `chat_handler.py`, `health_handler.py`, and others are expected to export a standard `lambda_handler(event, context)` function. We use a shared `@api_handler` decorator (defined in the backend’s common layer) to normalize event parsing, error handling, logging, and CORS responses. This design keeps each business handler focused on domain logic while the decorator deals with boilerplate such as mapping Python responses back into API Gateway’s response format.

On the **AI and external services** side, the backend relies on two main integrations. First, it calls an external Astrologer API (documented in our repo and referenced in the top-level README) to fetch horoscope and birth chart data for each user’s zodiac sign and birth details. The API key for this external service is stored in AWS Secrets Manager via the `secrets_astrologer` Terraform module and injected into Lambda through environment variables and IAM permissions. Second, the backend calls an AWS Bedrock foundation model (`openai.gpt-oss-20b-1`) to generate emotionally aware, context-sensitive chat responses. Bedrock is reached via a VPC interface endpoint set up in the `bedrock_vpce` module so that traffic never leaves our VPC to reach the public internet.

For **data storage**, we use DynamoDB tables created by the `dynamodb_mira` module to persist user profiles and conversation-related state, along with an S3 artifacts bucket for generated charts and visualization assets. One DynamoDB table is optimized for user profile data, while another is optimized for storing conversation summaries and related metadata; both are keyed around a stable user identifier derived from Cognito. The S3 artifacts bucket stores SVG chart images and related files, while a separate S3 bucket hosts the static frontend. All tables and buckets are tagged and named according to a consistent `mira-<env>-<purpose>` pattern to make it easy to reason about the infrastructure in AWS.

Finally, **networking and security** are provided by a dedicated VPC configured via the `network_vpc` module. This module creates public and private subnets across multiple Availability Zones, attaches an Internet Gateway for public traffic, and configures routing tables and gateway endpoints for DynamoDB and S3. Lambda and the Bedrock VPC endpoint are placed in private subnets, and security groups restrict inbound and outbound flows so only necessary traffic (e.g., from Lambda to Bedrock or to DynamoDB endpoints) is allowed. The `gateway_endpoints` module further ensures that DynamoDB and S3 traffic remains inside the AWS network, improving both security and latency.

### 2.3 VPC Layout

Our VPC is designed to meet the course requirement for a multi-AZ, production-style networking layout while still remaining simple enough to manage in Terraform. The `network_vpc` module provisions a VPC with the CIDR block `10.0.0.0/16`, which provides plenty of address space for subnets and future growth. Within this VPC, we define two public subnets (for example, `10.0.1.0/24` in `us-east-1a` and `10.0.2.0/24` in `us-east-1b`) and two private subnets (`10.0.11.0/24` and `10.0.12.0/24`), also spread across those two AZs. This layout gives us a clear separation between resources that need direct inbound internet access (e.g., NAT gateways or load balancers) and resources that should remain isolated (e.g., Lambda functions and VPC endpoints).

Routing is configured to ensure that public subnets can reach the internet while private subnets use controlled egress paths. The public route tables send `0.0.0.0/0` through an Internet Gateway attached to the VPC, which is appropriate for resources like CloudFront origins or NAT gateways that occasionally need external connectivity. Private subnets are associated with route tables that do not expose them directly to the internet; instead, they rely on VPC gateway endpoints to reach AWS services such as DynamoDB and S3. The Bedrock VPC interface endpoint is explicitly placed into the private subnets so that calls from the Lambda function to Bedrock occur entirely over the AWS private backbone network, reducing the attack surface and avoiding public internet exposure.

### 2.4 IAM Roles and Policies

IAM in our project is split into two complementary concerns: human access to the AWS account and application-level permissions for our services. From a team perspective, we defined IAM roles under `/roles` following the course’s recommended patterns. Davie acts as the primary **Administrator**, responsible for applying Terraform changes, managing sensitive settings, and unblocking the rest of the team. Raj and Erdun are **Power Users**, able to view and provision most resources via the AWS console but respecting separation of duties so that not everyone has unrestricted administrative privileges. This structure supports collaboration while reducing the chance of accidental destructive changes.

For the application itself, the `lambda_api` module provisions a dedicated **Lambda execution role** that follows a least-privilege philosophy. This role is allowed to read and write only the specific DynamoDB tables created by the `dynamodb_mira` module, limited to the ARNs exported as `user_profiles_table_arn` and `conversations_table_arn`. It can read and write to the artifacts S3 bucket but does not have wildcard access to all S3 buckets in the account. The role is also granted permission to call `InvokeModel` on a narrow list of Bedrock model ARNs (specifically `openai.gpt-oss-20b-1`), to retrieve the Astrologer API key from a specific Secrets Manager secret, and to write logs and metrics to CloudWatch. By encoding these permissions in Terraform instead of the console, we can review and version-control our security posture over time.

API Gateway and Cognito also rely on IAM primitive operations behind the scenes. API Gateway is configured to invoke the Lambda function via an integration role or resource-based policy that allows `apigateway.amazonaws.com` to call `lambda:InvokeFunction` on `mira-api-dev`. Cognito, in turn, manages identities and tokens within its own service boundary, and the application never needs direct access to Cognito’s internal IAM permissions. All of these IAM roles and policies are documented in the repository under `/roles` and wired into Terraform modules so that the entire IAM configuration can be recreated in a clean environment without manual steps.

### 2.5 Reliability, Multi-AZ, and Failure Handling

Reliability in Mira is achieved primarily by building on top of regional, managed AWS services and by designing our VPC to span multiple Availability Zones. The VPC itself defines subnets in at least two AZs for both public and private layers, which means that if one AZ experiences an outage, the other can still host Lambda instances and VPC endpoints. DynamoDB and Lambda are regional services that automatically distribute their capacity across AZs in the region, and API Gateway and Cognito are also regional, fully managed control planes. This architecture avoids single points of failure at the AZ level without requiring us to manage our own replication or failover logic.

We also considered specific **failure scenarios** and how the system should respond. If a single AZ becomes unavailable, AWS will simply run Lambdas in the remaining AZs, and our VPC-level routing and subnet definitions still provide access to DynamoDB, S3, and Bedrock. If the external Astrologer API becomes temporarily unavailable, the backend is designed to degrade gracefully—for example, by returning a clear error message or fallback response explaining that horoscope data is currently unavailable, while still allowing the user to interact with the LLM using previously cached or generalized information. If Bedrock has an outage or returns errors, the backend can still return deterministic horoscope data from the external API with a simpler, non-LLM explanation.

Operationally, we configured **CloudWatch monitoring** to detect issues quickly. A CloudWatch metric alarm named `mira-api-dev-errors` watches the `Errors` metric for our Lambda function and triggers when the sum of errors in a one-minute period is greater than or equal to one. For now, this is primarily used during development and testing to catch regressions early, but it also demonstrates how we would integrate SNS or email notifications in a production system. Additionally, we defined an EventBridge rule that periodically invokes the `mira-api-dev` Lambda as a “keep warm” mechanism, reducing the impact of cold starts during demos and peak usage periods. By combining multi-AZ infrastructure, managed services, and basic observability, we meet the course’s reliability requirements while keeping the operational burden low.

---

## 3. Integration of Course Concepts

### 3.1 Cloud Architecture

Mira’s architecture was intentionally designed as a layered cloud-native system rather than a monolithic server. The outermost layer is the CloudFront distribution plus the S3 static site bucket, which together serve the React SPA over HTTPS and provide global edge caching. The next layer handles identity and access via Amazon Cognito; all user sessions are mediated by Cognito, and downstream components trust it as the source of identity. Behind that, API Gateway serves as the front door for all backend operations, mediating traffic between the internet-facing frontend and the private Lambda function. Finally, the Lambda function orchestrates calls to our data stores (DynamoDB, S3) and external services (Bedrock, astrology API), encapsulating the application logic in a single serverless compute layer.

This separation of concerns maps well to real-world architectures because it isolates each responsibility into the AWS service best suited to handle it. Static assets and content delivery are decoupled from compute, identity is decoupled from business logic, and state persistence is decoupled from chat orchestration. As a result, the system is easier to reason about, scale, and modify: for example, we can update the frontend independently of backend logic, or experiment with different Bedrock models without touching the React app. This architecture also positions us well for future extensions, such as adding worker Lambdas for asynchronous processing or additional microservices behind the same API Gateway.

### 3.2 IAM and Security

IAM and security run through every part of the project, from team-level access control to fine-grained service permissions. At the human level, we defined an Administrator role and PowerUser roles so that not every team member needs or uses full admin privileges, and we stored our IAM policies for these roles in the `/roles` directory as JSON. This aligns with the course’s focus on explicit, reviewable IAM configuration and ensures that role assumptions are part of our repository, not tribal knowledge.

At the application level, we rely heavily on **least privilege**. The Lambda execution role is deliberately constrained to: (1) read and write only to the DynamoDB tables created for Mira; (2) access only the specific S3 buckets we use for frontend and artifacts; (3) call a limited set of Bedrock models; and (4) read exactly one secret from Secrets Manager for the Astrologer API key. We avoid wildcard actions and wildcard resources where possible, preferring explicit ARNs exported from Terraform modules. Cognito JWTs are validated in API Gateway before they ever reach Lambda, so unauthorized requests are rejected early. Together, these practices demonstrate that we used IAM as a core design tool rather than an afterthought.

### 3.3 VPC Networking

Our decision to use a custom VPC instead of placing everything on the public internet was driven by both security and realism. By creating public and private subnets across two AZs, we can place sensitive compute (Lambda, VPC endpoints) and data access strictly in private subnets and keep only essential ingress components, such as NAT gateways or certain endpoints, in public subnets. The presence of gateway endpoints for S3 and DynamoDB ensures that even when the Lambda function accesses these services, the traffic does not traverse the public internet, which reduces exposure to common network-level attacks.

From a networking perspective, this design exercises several important course concepts: CIDR allocation, route table configuration, and the distinction between gateway and interface endpoints. For instance, the Bedrock VPC interface endpoint is targeted to private subnets and attached to a specific security group, allowing only traffic from our Lambda’s security group or authorized CIDR ranges. This setup mirrors patterns used in real production systems where outbound internet access is tightly controlled, but applications still need to reach managed services like databases, object storage, and AI APIs.

### 3.4 Compute (Serverless)

We chose AWS Lambda as the primary compute platform for Mira because it matches our usage pattern and our cost constraints. Chat interactions are inherently event-driven: a user sends a message, our backend processes it, and then there is a period of inactivity until the next message. Provisioning always-on servers or even persistent containers for this pattern would lead to idle capacity and higher operational overhead. Lambda’s pay-per-use model, automatic scaling, and integration with API Gateway are a natural fit, especially for a student project where we want to avoid managing OS patches, capacity, and auto-scaling policies.

Within Lambda, we used the `@api_handler` decorator (as described in the backend README) to standardize how API events are parsed and responses returned. This decorator handles JSON parsing, error translation into HTTP status codes, CORS headers, and logging, enabling us to focus each handler on application logic—like fetching a horoscope or generating a chart. We also took cold start behavior into account: during development, we observed that the first request after a long idle period has higher latency. To mitigate this, we configured an EventBridge “keep warm” rule that periodically invokes the Lambda with a special event, which is a practical demonstration of how to work around cold starts in a serverless architecture.

### 3.5 Storage and Databases

Storage in Mira is split between **DynamoDB** for structured and semi-structured user data and **S3** for static content and artifacts. DynamoDB is an appropriate choice for chat-related data because it offers very low-latency reads and writes, scales automatically, and handles variable, evolving schemas well. Our `dynamodb_mira` module provisions tables specifically for user profiles and conversations, and we design our keys and item types around user-centric access patterns: for example, a profile item keyed by `user_id` and a stable sort key, and conversation or summary items keyed by the same `user_id` with sort keys encoding timestamps or item types.

S3 plays two distinct roles. First, an S3 bucket configured by the `s3_static` module hosts the built SPA assets, making it easy to integrate with CloudFront for fast, cached delivery of static files. Second, an “artifacts” bucket stores generated chart images and potentially other derivative data, tagged and organized by user and chart type. Using S3 for artifacts allows us to offload large or binary data from DynamoDB and rely on S3’s high durability and cost-effective storage. The combination of DynamoDB and S3 is a common pattern in serverless architectures: DynamoDB stores metadata and quick-access state, while S3 stores heavy or long-lived assets referenced by that metadata.

### 3.6 Reliability and Multi-AZ

Reliability and multi-AZ design are baked into our choice of services and VPC configuration. DynamoDB, Lambda, API Gateway, and Cognito are all regional services that inherently run across multiple Availability Zones behind the scenes, giving us robust fault tolerance without manually managing replicas or failover. Our custom VPC ensures that the private and public subnets exist in at least two AZs as well, which is important for VPC-bound resources like interface endpoints and Lambda ENIs.

We also made explicit choices to avoid single points of failure. For example, there is no single EC2 instance or single database instance that, if it fails, would take down the system. Our configuration for CloudWatch alarms, particularly the `mira-api-dev-errors` alarm, ensures that we will notice backend issues quickly, which is a key part of operational reliability. The EventBridge keep-warm rule is another reliability-oriented feature: by reducing cold start latency, we increase the likelihood that users experience consistently responsive behavior, even when traffic is bursty or low-volume.

### 3.7 Monitoring and Logging

Monitoring in Mira is centered around AWS CloudWatch. Every Lambda invocation produces logs that are captured by CloudWatch Logs, including request traces, error messages, and any custom logging we add in the `api_handler` decorator or individual handlers. These logs are searchable through CloudWatch Logs Insights, which supports the kind of ad-hoc debugging and incident investigations we practiced during development. Additionally, we configured CloudWatch Metrics and a specific `mira-api-dev-errors` alarm so that we can see when error rates spike and, in a more production-like environment, notify an SNS topic or email distribution list.

We also considered security and privacy concerns related to logging. Because Mira deals with user-generated chat content that may include sensitive or emotional disclosures, we avoid logging full request bodies or raw messages whenever possible. Instead, logs focus on metadata such as request IDs, user IDs (or anonymized identifiers), and high-level error categories. This approach demonstrates an understanding of both observability and data minimization: we want enough information to diagnose problems without creating new privacy risks by storing sensitive content in logs indefinitely.

### 3.8 Infrastructure as Code (Terraform)

All of Mira’s cloud infrastructure is described as code in the `/infra/terraform` directory using Terraform. Modules such as `network_vpc`, `dynamodb_mira`, `s3_static`, `cognito_auth`, `lambda_api`, `api_gateway`, `bedrock_vpce`, `secrets_astrologer`, and `gateway_endpoints` encapsulate logical components of the architecture. The root `main.tf` file wires these modules together, passes shared variables like `name_prefix` and `environment`, and exports key outputs such as the API base URL, CloudFront domain, and DynamoDB table names.

Using Terraform has several benefits. It ensures that our infrastructure is reproducible: any team member with the appropriate IAM role can run `terraform init`, `terraform plan`, and `terraform apply` to recreate the environment from scratch. It also allows us to version control infrastructure changes alongside application code, review them in pull requests, and roll back if something goes wrong. Finally, it provides a single source of truth for our architecture; instead of guessing how a resource was configured in the console, we can inspect the corresponding Terraform module and read the configuration directly.

### 3.9 CI/CD and Testing

Our GitHub repository is structured to support CI/CD, with a `.github` directory housing our workflow definitions. These GitHub Actions workflows follow the course recommendations by including stages for dependency installation, automated tests, Terraform linting/validation, and deployment steps. When a pull request is created or changes are pushed to key branches, the pipeline runs `npm install` or `pip install -r requirements.txt`, executes our test suite, runs `terraform fmt` and `terraform validate` in the `/infra` directory, and, for main-branch changes, can trigger deployment commands.

In the context of this report, we emphasize that CI/CD is not just a convenience but a way to enforce quality gates on our work. For example, a broken backend test or invalid Terraform file will cause the pipeline to fail before changes are merged, catching issues early. We also use test reports and pipeline logs as part of our cloud evidence: screenshots of successful and failing runs, along with descriptions of how we diagnosed and fixed them, demonstrate that we took an engineering approach to deployment rather than manual, ad-hoc pushes.

### 3.10 Cost-Aware Design

Cost-awareness influenced several architectural decisions in Mira. Serverless services like Lambda, DynamoDB, and API Gateway are billed primarily based on actual usage, which is ideal for a student project that may see bursts of activity around demos and grading but relatively low sustained traffic. Similarly, using CloudFront in front of an S3 static website keeps data transfer costs predictable and allows for aggressive caching of static assets. This is both economical and performant compared to running a dedicated web server.

We also prepared a detailed budget in `docs/final/budget/Estimated Cost for AWS Resources.xlsx`, estimating the monthly costs for each AWS resource under realistic usage scenarios. The main cost drivers are Bedrock LLM invocation charges, Lambda execution time, and DynamoDB read/write capacity. By modeling different usage levels, we confirmed that the architecture remains affordable under typical student project usage patterns and scales economically if usage increases. This budgeting exercise reinforced the importance of choosing managed, on-demand services and avoiding over-provisioned, always-on infrastructure.

---

## 4. Cloud Evidence

In this section of the PDF version of the report, we include annotated screenshots from the AWS console that demonstrate that our infrastructure exists and matches the architecture described above. Each screenshot has a clear caption and highlights the relevant configuration so that a reader can easily verify alignment between documentation and implementation.

**4.1 VPC and Subnets**  
We include screenshots of the VPC details page showing the `10.0.0.0/16` CIDR block and the list of public and private subnets across two Availability Zones. Additional screenshots show the route tables associated with these subnets, highlighting routes to the Internet Gateway for public subnets and the use of gateway endpoints or restricted routes for private subnets.

**4.2 Security Groups and Network Endpoints**  
We show the security group associated with the Bedrock VPC endpoint and/or the Lambda function, including inbound and outbound rules. Another screenshot shows the list of VPC endpoints, with entries for S3, DynamoDB, and the Bedrock runtime, demonstrating that our backend calls to these services remain inside the VPC rather than going over the public internet.

**4.3 Compute and API Layer**  
Screenshots of the `mira-api-dev` Lambda function display its runtime (Python 3.10), memory and timeout settings, VPC configuration (private subnets and security group), and environment variables like `DYNAMODB_PROFILES_TABLE` and `ASTROLOGY_SECRET_NAME`. We also capture the API Gateway console views that show our HTTP API, its routes, integrations, and the Cognito authorizer configuration, confirming the relationship between API Gateway, Lambda, and Cognito.

**4.4 Storage Services**  
We provide screenshots of the DynamoDB tables provisioned for user profiles and conversations, including their table names, partition/sort key configurations, and sample items. Additional screenshots show the S3 buckets created by the `s3_static` module: the frontend static site bucket and the artifacts bucket, along with the CloudFront distribution configuration that points to the frontend bucket as an origin.

**4.5 Logs and Metrics**  
CloudWatch screenshots show log groups for the `mira-api-dev` Lambda function, including example log streams that correspond to chat requests. We also capture the CloudWatch Metrics dashboard for Lambda errors and the specific `mira-api-dev-errors` alarm, including its threshold and evaluation period. This evidence demonstrates that we implemented monitoring in line with our documentation.

**4.6 IAM Roles and Policies**  
Finally, we include screenshots from the IAM console summarizing the Lambda execution role and its attached policies, as well as any roles used by API Gateway or supporting services. Captions explain how these policies restrict access to particular DynamoDB tables, S3 buckets, Bedrock models, and Secrets Manager secrets, reinforcing the least-privilege approach described in the Architecture and IAM sections.

---

## 5. Data Models

### 5.1 Data Description

Mira works with a mix of structured and unstructured data. The structured data primarily consists of **user profiles**, which include fields such as the user’s name, birthdate, birth location (country and city), computed zodiac sign, and other preferences that may influence how we interpret horoscopes and generate responses. Semi-structured and unstructured data includes individual chat messages, LLM responses, horoscope text retrieved from the external API, and various logs or metadata that describe the state of the application.

Each type of data serves a clear purpose in the system. Profile data anchors the personalized aspects of the experience: without a persistent profile, we could not generate accurate birth charts or tailor interpretations over time. Chat-related data provides context so that the AI can respond in a way that is consistent with what the user has already shared. Logs and metrics help operators understand how the system is behaving, detect errors, and audit high-level system activity without revealing sensitive message content. Together, these data types enable Mira to deliver both personalization and operational robustness.

### 5.2 Data Sources

Mira’s data comes from three primary sources. First and most importantly, **users** supply data via the frontend: they complete the onboarding/profile form with birth details and type free-form messages in the chat interface. Second, **external APIs** augment this user-provided information. The Astrologer API provides structured horoscope and chart data for specific zodiac signs and dates, while AWS Bedrock provides LLM-based responses that we combine with horoscope insights. Third, **system-generated logs and events**—such as CloudWatch logs and metrics—capture technical information about requests, errors, and performance that we use for debugging and monitoring.

The combination of these sources means that the system must handle both trusted and untrusted data. User inputs and external API responses must be validated and sanitized to prevent misuse, while system logs must be designed to store only the minimum necessary information for troubleshooting. Our data plan (`data/DataRequirements.md`) documents these considerations and influenced design decisions about where and how to store data.

### 5.3 Storage and Access Patterns

The main persistent data store is **DynamoDB**, provisioned via the `dynamodb_mira` module. This module creates tables dedicated to user profiles and conversations, both organized around a `user_id`-centric partitioning strategy. A typical pattern is to use `user_id` as the partition key and a sort key that encodes item type and, for conversation records, a timestamp, such as `CHAT_SUMMARY#<timestamp>`. This design allows us to efficiently fetch all relevant items for a single user—profile, recent chat summaries, and other state—by performing a partition key query and, optionally, sorting or filtering by the sort key prefix.

S3 is used for **artifacts** like generated chart images (often SVG) and any additional visualization data we might create. These artifacts are typically keyed by user and chart type, e.g., `user/<user_id>/charts/<chart_id>.svg`, and referenced from DynamoDB items or generated on the fly during responses. Access patterns reflect the typical user flow: when a user opens the chat or profile page, the backend verifies their JWT, loads the profile from DynamoDB, retrieves or computes any needed chart data (possibly including S3 URIs for images), and returns a combined view to the frontend. New chat messages result in writes to the conversations table and, if applicable, updates to summaries or sentiment metadata.

### 5.4 ERD / NoSQL Diagram

Because we use DynamoDB, our “ERD” is more accurately a NoSQL data modeling diagram that focuses on partition keys, sort keys, and item types rather than traditional relational tables and foreign keys. The diagram, stored as a PDF under `docs/final/data models/` (for example, `mira_dynamodb_erd.pdf`), shows the primary entities: user profile items keyed by `user_id` with `sk = "PROFILE"`, and chat summary or conversation items keyed by the same `user_id` with sort keys like `CHAT_SUMMARY#<timestamp>`. Additional attributes capture fields like `zodiac_sign`, `summary`, and `topics`.

The diagram also illustrates key design trade-offs. By embedding related information (such as summary topics) directly within conversation items rather than splitting everything into separate tables, we avoid complex joins and keep the most common access patterns (fetch profile and most recent chats) to a single partition query. At the same time, we are careful not to over-embed, especially for large chat transcripts, so we can maintain predictable item sizes and costs. This model reflects guidance from both AWS best practices and our own experimentation during the design phase.

---

## 6. Integrating Feedback

Throughout the project, we received feedback at multiple checkpoints and used it to refine both the scope and the technical details of Mira. During the **proposal phase**, instructors encouraged us to be realistic about what we could build within a single semester and to clearly separate “nice-to-have” features from core functionality. In response, we narrowed our initial vision to focus on a well-polished chat experience with birth chart visualizations and basic emotional-safety considerations, rather than attempting to add advanced analytics, social features, or multiple AI personas in the first iteration.

In the **progress phase**, feedback focused more on concrete technical aspects: data modeling, IAM clarity, and observability. We were encouraged to move from a more ad-hoc description of our DynamoDB design to a clearly documented, user-centric key schema with item types and access patterns spelled out. This led directly to the more detailed data plan and ERD in `data/DataRequirements.md` and `docs/final/data models/`, as well as tighter IAM policies in the `lambda_api` and `dynamodb_mira` modules. We also added CloudWatch alarms and refined our logging approach based on suggestions to think more about how we would debug production issues.

Near the end of the semester, **final-round feedback** from peers and the instructor nudged us toward polishing reliability and documentation rather than chasing additional features. For example, we devoted time to documenting how to run the app (`docs/final/RunningProject.md` and the top-level README), ensuring that our Terraform configuration was clean and reproducible, and curating cloud evidence screenshots that matched the architecture diagram. This last iteration of feedback helped us ship a project that is not just functional but also understandable and maintainable, which is a key learning outcome of the course.

---

## 7. Challenges, Lessons Learned, and Future Work

### 7.1 Challenges

One of the most significant **technical challenges** we encountered was wiring together multiple Terraform modules and ensuring they applied in the correct order with the correct dependencies. For instance, the `lambda_api` module depends on outputs from `dynamodb_mira`, `s3_static`, `network_vpc`, `bedrock_vpce`, and `secrets_astrologer`. Early on, we saw errors where Lambda was created before the VPC or endpoints existed, leading to failed deployments and confusing error messages. We resolved this by carefully passing module outputs as inputs, adding explicit dependencies where necessary, and iterating on our Terraform structure until `terraform plan` and `terraform apply` were consistently clean.

Another challenge was integrating **Cognito, API Gateway, and the frontend** in a way that felt seamless to users. Getting callback URLs, logout URLs, and CORS settings exactly right took several rounds of trial and error. A misconfigured callback URL would leave users stuck after login, and overly restrictive CORS settings would cause seemingly random failures from the browser’s perspective. We addressed this by centralizing environment configuration in the frontend (`.env` and `env.js`), aligning those values with the `cognito_auth` and `api_gateway` module settings, and methodically testing the full login → chat flow in both local and deployed environments.

We also had to manage **secrets and external API keys** responsibly. Storing the Astrologer API key in plain-text configuration would have been simpler in the short term but violated best practices. Instead, we used the `secrets_astrologer` Terraform module to store the key in Secrets Manager and grant the Lambda execution role permission to read it. This introduced its own complexity—ensuring the secret existed before Lambda deployed and that the environment variable names matched—but forced us to internalize good habits around secret management.

### 7.2 Lessons Learned

From these challenges, we drew several important lessons. First, we experienced firsthand how **infrastructure as code** fundamentally changes the development workflow: instead of clicking through the console, we treated infrastructure changes like code changes, subject to version control, reviews, and rollbacks. This approach is more rigorous but also more transparent, making it easier for all team members to understand the overall system.

Second, we learned that **data modeling and IAM** should be addressed early in the design process, not as last-minute tasks. Our initial, somewhat vague notion of “we’ll store chat history in DynamoDB” evolved into a concrete schema with partition/sort keys and item types only after we sat down to write the data plan and ERD. Similarly, our IAM policies improved significantly when we wrote them in Terraform and could see precisely which ARNs we were granting access to. These experiences reinforced the idea that careful upfront thinking about data and security pays off in fewer surprises later.

Finally, we gained appreciation for the **power and limitations of managed services**. Using Lambda, DynamoDB, Cognito, and Bedrock meant that we did not have to maintain servers, databases, or model infrastructure ourselves, which is an enormous productivity boost. At the same time, each service has its own configuration model and quirks (such as cold starts or region-specific constraints) that you only fully appreciate when you build a real application.

### 7.3 Future Work

If we had more time, there are several areas where we would extend and improve Mira. On the **user experience and UI side**, we plan to design a more polished and responsive interface with clearer navigation, richer visual affordances for charts and insights, and smoother mobile/desktop experiences. This would make it easier for users to understand complex astrological information at a glance and feel more immersed in their daily reflections.

On the **AI and astrology data side**, we would like to support a broader range of LLM models and add a more flexible routing layer so that different tasks (e.g., gentle reflection vs. analytical breakdowns) can leverage the most suitable model. We also plan to integrate additional astrology API endpoints to power deeper relationship insights, more advanced natal and transit analysis, and “cosmic timing” features (e.g., windows of opportunity or caution around specific themes).

On the **engineering and operations side**, future work could include more comprehensive testing (integration and end-to-end tests that hit the deployed API), more advanced deployment strategies (such as blue-green or canary deployments for Lambda and frontend versions), and better cost and usage monitoring dashboards. We would also continue to refine our safety guardrails and content filters, including clearer disclaimers and escalation suggestions, to keep Mira both helpful and responsible as it evolves.

---

## 8. References

- Astrologer API – `https://github.com/g-battaglia/v4.astrologer-api`  
- AWS Documentation – Amazon Cognito, AWS Lambda, Amazon DynamoDB, Amazon API Gateway, Amazon S3, Amazon CloudFront, Amazon VPC, AWS Secrets Manager, Amazon CloudWatch, AWS Bedrock.  
- Course materials and lecture notes from CS6620 Cloud Computing (architecture patterns, IAM best practices, VPC design, serverless, monitoring, and cost management).  
- Any additional blog posts, tutorials, or reference architectures consulted during the project (to be filled in with specific URLs and citation style preferred by the instructor).

---

## 9. Use of Generative AI (Full Disclosure)

In keeping with the course policies, we used Generative AI tools only to assist with writing quality and organization, not to generate original technical work, architecture, or code. For example, we used ChatGPT (accessed via Cursor) to help us restructure and polish the wording of this report and to turn our existing notes, READMEs, Terraform files, and design documents into clearer, more cohesive prose. All underlying technical decisions, architectural choices, Terraform configurations, and code were designed and implemented by the team based on course content and our own research.

We did **not** use Generative AI to generate cloud-related code, Terraform modules, tests, or to design our architecture or choose AWS services. Where AI suggestions touched on technical descriptions, we cross-checked them against our actual implementation and AWS documentation, and we treated them as editorial assistance rather than authoritative sources. If additional tools such as GitHub Copilot were used in IDEs for minor code completions or comment suggestions, they were similarly constrained to non-critical scaffolding and did not substitute for our own design work.

To maintain transparency, we have kept records of the prompts and conversations we had with AI tools during the writing process. These prompt logs are available upon request or can be included as an appendix to this report, depending on grading needs. Overall, Generative AI played a supporting role in improving the clarity and readability of text we had already drafted or conceptually outlined, while all substantive technical content and implementation details remain the work of the team.