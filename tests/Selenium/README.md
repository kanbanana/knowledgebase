# knowledgebase

# Selenium Tests

This branch provides several selenium test cases.

## Requirements
1. Maven
2. Eclipse TestNG Plugin

## Setup Eclipse Test project

1. Clone this repository
2. mvn eclipse:eclipse
3. Import project with eclipse.

## Update an existing project

Whenever a new dependency is added to the pom file it is necessary to do the following steps.

1. Open Eclipse and remove the project. Do not delete the Files from your harddrive! Just remove the project.
2. mvn dependency:resolve
3. mvn eclipse:eclipse
4. Reimport the Project with eclipse.


## TODO 

Implement logic into the test cases

