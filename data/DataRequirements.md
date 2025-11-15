# Project Data Plan

If your project uses any data, whether it's user data, external API data, uploaded files, or internal logs, you must provide the following.



### Dataset Description (if applicable)
A brief description of the dataset/s you chose (e.g., number of variables, year, etc). Include an exact link to the dataset. 

* DO NOT  include the dataset in your repo! Please put it in your .gitignore, that way you can use the dataset in your local repos but it will not be reflected into your GitHub.
* Describe the format your data comes in
* Describe any relevant metadata
* List the variables (at a high level)

> your answer here

--

### Storage and Database Decisions

**Where will you store data?**
Name the specific cloud resource/s you will use. Is it a database, an S3 bucket, etc. If you store multiple aspects of your application name each part. For example, an S3 bucket for a static website, and a PostgreSQL database

> your answer here

**Why did your team decide to use this specific resource/s?**
Justify your choice. There needs to be an architectural reason beyond "this is cool" or "this is the most popular".

> your answer here

--

### ERD (Entity-Relationship Diagram)

You must create an ERD when using SQL or NoSQL storage. Your ERD must include all entities/tables/collections. Include the full ERD in the repo as a PDF. Please upload any diagrams to `/docs/` as PDF documents

Attributes

* Primary/foreign keys
* Relationship types

For NoSQL:

* Document structure
* Embedded vs referenced strategy
* Partition/sort keys (if DynamoDB)

Include a brief description of the ERD here, highlighting key intricacies/challenges from the ERD.
> your answer here



--

### Data Access Patterns

Your design document must include a data plan answering the questions below.

**What data does your system need? Structured/unstructured**
> your answer here

**Brief description of the purpose of each type of data**
> your answer here

**Where does the data come from?**
If you have multiple data sources, elaborate on how each one is collected
Examples of data sources:

* Users
* External APIs
* Uploads
* Public datasets
* Logs or events

> your answer here

**Describe how your data enters your system?**
You may add diagrams here if it helps explain.
Examples:

* API ingestion
* Form submission
* File upload
* Scheduled jobs

> your answer here


**Are there specific challenges with the data you will store/generate?**
Consider any of the following that apply to your application:

* How will you ensure user privacy is respected and data is securely stored?
* If the data comes from an API, how will you ensure its validity?
* Are there any specific risks with the data your are storing (from a dataset or user?

> your answer here


**How will you access the data and respond with data back to your user?**

> your answer here


**Monitoring your app**
How will you ensure you are alerted to any bugs or issues in your application in the cloud? Are there any specific challenges in collecting, storing and analyzing logs?

> your answer here
