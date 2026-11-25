# Security policy

## Supported project status

TaskFlow is an actively developed Android project. It has not been represented as a security-audited or production-certified application.

## Reporting a vulnerability

Please do not publish credentials, personal task data or exploit details in a public issue. Contact the repository owner privately through the contact method listed on their GitHub profile and include:

- A concise description of the issue
- The affected component or file
- Steps to reproduce in a test environment
- Potential impact

## Secret handling

- Never commit `.env`, private keys, keystores, service-account files or access tokens.
- Keep real local configuration in an ignored `.env` file.
- `.env.example` should contain only blank or clearly fake placeholder values.
- Firebase client configuration is not a substitute for Firestore Security Rules.
- Review changes and dependency updates before distributing a new APK.

## Data and cloud backup

Task data is stored locally in SQLite. Optional cloud backup uses anonymous Firebase Authentication and Firestore. Anonymous identity is installation-scoped; reinstalling or clearing app data can prevent access to the previous anonymous cloud data. Avoid storing highly sensitive information in tasks.
