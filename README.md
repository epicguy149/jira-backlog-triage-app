# Log Juggler

This app is a backlog filtering app which assists managers and software developers to clear up there backlogs on Jira. The App was developed through the Forge Framework. 

## Software Required

This project requires the following software tools to be installed:

### Visual Studio
<div align="center">
<img src="./Images/Visual Studios.png" alt="Visual Studio" width="200"/>
</div>

<br>

<div align="center">

<b>

Download Visual Studio from the official website:  
[https://visualstudio.microsoft.com/downloads/](https://visualstudio.microsoft.com/downloads/)

</b>

</div>

<br>

<b>Install the extention Dev Containers.</b><br>
<div align="center">
<img src="./Images/Dev Containers image.png" alt="Visual Studio" width="200"/>
</div>

<br>

### Docker Desktop
<div align="center">
<img src="./Images/Docker Desktop icon.png" alt="Docker Desktop" width="200"/>
</div>

<div align="center">
<b>

Download Docker Desktop from the official website:  
[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

</b>
</div>

## Jira set up


<br>

<div align="center">
<b>

Make a jira account with a domain within jira.<br>
[http://go.atlassian.com/cloud-dev](http://go.atlassian.com/cloud-dev)

</b>
</div>

<br>

<div align="center">
<b>

Make a API Token in Jira.<br>
[https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)

</b>
</div>

<br>

<div align="center">
<b>Enter your Jira domain and your ready to install the app.</b>
</div>

## How to Install

### Step 1: 
<br>

<b>Clone Repo</b>

```
git clone https://github.com/unsw-cse-comp99-3900/capstone-project-25t3-3900-h18b-apple.git
```

### Step 2:
<br>
<b>In visual studios press the key board shortcut.</b>

<br>

```
CTRL + SHIFT + P
```

### Step 3:

<br>

<b>Click Dev Containers: Open Folder in Container</b>

<br>

<div align="center">
<img src="./Images/Package to install container.png" alt="Visual Studio" width="400"/>
</div>
<br>
<b>Ensure you have Docker Desktop running in the background</b>
<br>

### Step 4:
<br>

<b>Log in with you Forge email and Forge API token</b>

<br>

```
export FORGE_EMAIL="YOUR EMAIL"
```
<br>

```
export FORGE_API_TOKEN="YOUR TOKEN"
```

<br>
To check your login worked.<br>

```
forge whoami
```
<br>

### Step 5:

<b>Register the App</b>

```
forge register
```
<br>

### Step 6: 
<br>

<b>Install the app on your jira domain.</b>

<br>

```
forge install
```

## How to Test (backend)

### Step 1: 
<br>

<b>Download dependencies</b>
```
npm i
```

### Step 2: 
<br>

<b>Run the test</b>
```
npm test
```


## How to Test (Matrix frontend tests)

### Step 1: 
<br>

<b>Download dependencies</b>
```
npm run install_ or (1. npm i, 2. cd frontend, 3. npm i)
```

### Step 2: 
<br>

<b>Go to the directory</b>
```
cd frontend/src/matrixTest
```

### Step 3: 
<br>

<b>Run the test</b>
```
npm test
```

<b>Or you want choose the specific tests</b>
```
npm test MatrixBench.test.tsx
```
