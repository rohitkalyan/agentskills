# Quality rules

Discover the destination project's tools, test commands and CI before editing. Keep types, validation, error handling, resource cleanup and permission checks explicit. Avoid unnecessary frameworks and abstractions.

Use meaningful behavior tests for changed outcomes and important failure paths. Investigate coverage gaps by risk rather than adding assertions to reach a number. Preserve the project's agreed coverage gate.

Check secrets, dependency advisories and security-sensitive code using the project's configured tools. SonarQube, Checkmarx and Veracode require actual account policies and scanner runs; recipes are not certification.

Report exactly what ran, what passed and what remains unverified. A toolkit maintenance check does not validate the user's application.
