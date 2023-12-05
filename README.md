
<h1 align="center">
  <br>
      OntoEditor
  <br>
</h1>

<p align="center">
  <a href="mailto:ahmad.hemid@fit.fraunhofer.de">Contact</a> •
<a href="https://github.com/ahemaid/OntoEditor/blob/main/CONTRIBUTING.md">Contribute</a> •
<a href="https://ahemaid.github.io/OntoEditor/">Docs</a> •
  <a href="https://github.com/ahemaid/OntoEditor/issues">Issues</a> •
  <a href="https://github.com/ahemaid/OntoEditor/blob/main/LICENSE">License</a>
</p>

OntoEditor is an Online Collaborative Ontology Editor, built on Distributed
Version Control Systems. It aims to support collaborative ontology development
across different RDF serialization formats: Turtle, JSON-LD, and RDF/XML.

Requirements
------------
Node.js for installing the development tools and dependencies form [here](https://nodejs.org/en).

OntoEditor Installation
-----------------
1. Navigate to the root folder.
2. Run `npm install` to install the dependencies and build the project
3. Run `npm start` to run and execute the project 
4. OntoEditor GUI will be accessible at http://localhost:5000/

Running Using Docker
-----------------
1. You can also run OntoEditor using docker, If you have it installed on your machine, otherwise, you use [this](https://docs.docker.com/engine/install/) to install docker. Once you have docker, then you can issue the following command to download the OntoEditor docker image:
```
docker pull ahemid/ontoeditor
```
or you can create an OntoEditor docker image by giving the following command on the project root folder:
```
docker build .  -t ahemid/ontoeditor
```
2. Next, create the OntoEditor docker container using the following command: 
```
docker run -d -p 5000:5000 -p 8080:8080 ahemid/ontoeditor
```
3. Then, KGraphX GUI is accessible at http://localhost:8000/ and the Fuseki server is running at http://localhost:3030/
## License
Copyright © 2023 Fraunhofer. This project is licensed under the MIT License - see the
[LICENSE](LICENSE) for details.

## Contributing
You are very welcome to contribute to this project when you find a bug, want to suggest an improvement, or have an idea for a helpful feature. Please find a set of guidelines at the [CONTRIBUTING.md](https://github.com/ahemaid/OntoEditor/blob/main/CONTRIBUTING.md) and the [CODE_OF_CONDUCT.md](https://github.com/ahemaid/OntoEditor/blob/main/CODE_OF_CONDUCT.md).

