const express = require("express");
const router = express.Router();
const { Octokit } = require("@octokit/core");

const GitHub = require("github-api");
const { Bitbucket } = require("bitbucket");
const fetch = require("node-fetch");

router.get("/", function (req, res, next) {
  console.log("Editor index route");
  res.render("editor/index");
});

router.post("/repo_listRepos", async function (req, res, next) {
  const selected_git = req.body.selected_git;
  const username = req.body.username.trim();
  const token = req.body.token;
  const selected_file_format = req.body.selected_file_format;

  if (
    selected_git &&
    typeof selected_git !== "" &&
    selected_git != undefined &&
    token &&
    typeof token !== "" &&
    token != undefined
  ) {
    if (selected_git === "github") {
      console.log("github selected");

      if (username != "") {
        // basic auth
        var gh = new GitHub({
          username: username,
          password: token,
        });
      } else {
        // basic auth
        var gh = new GitHub({
          token: token,
        });
      }


      var user = gh.getUser();
       console.log(username)

      user
        .listRepos()
        .then(function ({ data: reposJson }) {
          repos = reposJson;
          console.log(repos)

          res.status(200).json({ repos: reposJson });
        })
        .catch(function (err) {
          console.log(err)

          res.status(400).json({ err: err.response.statusText });
        });


    //     // Octokit.js
    //     // https://github.com/octokit/core.js#readme
    //     const octokit = new Octokit({
    //       auth: token
    //     })

    //     let response = await octokit.request('GET /users/{username}/repos', {
    //       username: username,
    //       headers: {
    //     'X-GitHub-Api-Version': '2022-11-28'
    //       }
    //   })
    //   // console.log(response);
    //   // let result = await response.json();
    //   if (response.status == 200) {
    //     res.status(200).json({ repos: response });
    // } else {
    //     this.errorMessage = "Failed to load posts!";
    //     res.status(400).json({ err: this.errorMessage });
    // }

    }

    if (selected_git === "bitbucket") {
      console.log("bitbucket selected");

      if (username != "") {
        // basic auth
        var clientOptions = {
          auth: {
            username: username,
            password: token,
          },
        };
      } else {
        // basic auth
        var clientOptions = {
          auth: {
            token: token,
          },
        };
      }

      const bitbucket = new Bitbucket(clientOptions);

      bitbucket.repositories
        .listGlobal({ role: "contributor", pagelen: 20, sort: "-updated_on" })
        .then(({ data }) => {
          // console.log(data);
          res.status(200).json({ repos: data.values });
        })
        .catch((err) => {
          console.error(err);
          res.status(400).json({ err: "Something wrong" });
        });
    }
    if (selected_git === "gitlab") {
      console.log("gitlab selected");

      fetch("https://gitlab.com/api/v4/projects?owned=true", {
        headers: { Authorization: "Bearer " + token },
      })
        .then(function (response) {
          if (response.ok) {
            response.json().then((data) => {
              res.status(200).json({ repos: data });
            });
          } else {
            res.status(400).json({ err: response.statusText });
          }
        })
        .catch(function (error) {
          console.log(error);
          res.status(400).json({ err: "Something wrong" });
        });
    }
  } else {
    res.status(422).json({ err: "Missing Parameters" });
  }
});

router.post("/repo_listBranches", async function (req, res, next) {
  const username = req.body.username.trim();
  const token = req.body.token;
  const repos = req.body.repo;
  const selected_git = req.body.selected_git;
  const owner = repos.split("/")[0];
  const repo_name = repos.split("/")[1];

  if (
    selected_git &&
    typeof selected_git !== "" &&
    selected_git != undefined &&
    token &&
    typeof token !== "" &&
    token != undefined &&
    repos &&
    typeof repos !== "" &&
    repos != undefined
  ) {
    if (selected_git === "github") {
      if (username != "") {
        // basic auth
        var gh = new GitHub({
          username: username,
          password: token,
        });
      } else {
        // basic auth
        var gh = new GitHub({
          token: token,
        });
      }

      const repo = gh.getRepo(owner, repo_name);

      repo
        .listBranches(null)
        .then(function ({ data: data }) {
          // console.log(data);
          res.status(200).json({ repos: data });
        })
        .catch(function (err) {
          // console.error(err);
          res.status(400).json({ err: "something wrong" });
        });


    //   // Octokit.js
    //    // https://github.com/octokit/core.js#readme
    //   const octokit = new Octokit({
    //       auth: token
    //     })

    //   console.log(username   + "      "+ repo_name  )
    //   let response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
    //     owner: username,
    //     repo: repo_name,
    //     headers: {
    //       'X-GitHub-Api-Version': '2022-11-28'
    //     }
    //   })
    //   if (response.status == 200) {
    //     res.status(200).json({ repos: response });
    // } else {
    //     this.errorMessage = "Something wrong!";
    //     res.status(400).json({ err: this.errorMessage });
    // }
    
        
    }

    if (selected_git === "bitbucket") {
      console.log("bitbucket selected");

      if (username != "") {
        // basic auth
        var clientOptions = {
          auth: {
            username: username,
            password: token,
          },
        };
      } else {
        // basic auth
        var clientOptions = {
          auth: {
            token: token,
          },
        };
      }

      const bitbucket = new Bitbucket(clientOptions);

      bitbucket.repositories
        .listBranches({ repo_slug: repo_name, workspace: owner })
        .then(({ data }) => {
          console.log(data);
          res.status(200).json({ repos: data.values });
        })
        .catch((err) => {
          // console.error(err);
          res.status(400).json({ err: "something wrong" });
        });
    }
    if (selected_git === "gitlab") {
      console.log("gitlab selected");

      let encodedURI = encodeURIComponent(repos);

      fetch(
        "https://gitlab.com/api/v4/projects/" +
          encodedURI +
          "/repository/branches",
        {
          headers: { Authorization: "Bearer " + token },
        }
      )
        .then(function (response) {
          if (response.ok) {
            response.json().then((data) => {
              res.status(200).json({ repos: data });
            });
          } else {
            res.status(400).json({ err: response.statusText });
          }
          // console.log("ok");
          // res.status(200).json({ repos: response})
        })
        .catch(function (error) {
          // console.log(error);
          res.status(400).json({ err: "Something wrong" });
        });
    }
  } else {
    res.status(422).json({ err: "Missing Parameters" });
  }
});

router.post("/repo_listFiles", async function (req, res, next) {
  const username = req.body.username;
  const token = req.body.token;
  const repos = req.body.repo;
  const branch = req.body.branch;
  const selected_git = req.body.selected_git;
  const owner = repos.split("/")[0];
  const repo_name = repos.split("/")[1];


  if (
    selected_git &&
    typeof selected_git !== "" &&
    selected_git != undefined &&
    token &&
    typeof token !== "" &&
    token != undefined &&
    repos &&
    typeof repos !== "" &&
    repos != undefined &&
    branch &&
    typeof branch !== "" &&
    branch != undefined
  ) {
    if (selected_git === "github") {
      if (username != "") {
        // basic auth
        var gh = new GitHub({
          username: username,
          password: token,
        });
      } else {
        // basic auth
        var gh = new GitHub({
          token: token,
        });
      }

      const repo = gh.getRepo(owner, repo_name);

      repo
        .getTree(branch + "?recursive=1", null)
        .then(function ({ data: data }) {
          // console.log(data);

          res.status(200).json({ repos: data });
        })
        .catch(function (err) {
          // console.error(err);
          res.status(400).json({ err: "something wrong" });
        });
  //     const octokit = new Octokit({
  //       auth: token
  //     })

  //     let response = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1', {
  //         owner: username,
  //         repo: repo_name,
  //         tree_sha: branch, //+'?recursive=1',
  //         // recursive: 1,
  //         headers: {
  //           'X-GitHub-Api-Version': '2022-11-28'
  //         }
  //       })
  //  if (response.status == 200) {
  //     res.status(200).json({ repos: response });
  // } else {
  //     this.errorMessage = "Something wrong!";
  //     res.status(400).json({ err: this.errorMessage });
  // }
    }

    if (selected_git === "bitbucket") {
      console.log("bitbucket selected");

      if (username != "") {
        // basic auth
        var clientOptions = {
          auth: {
            username: username,
            password: token,
          },
        };
      } else {
        // basic auth
        var clientOptions = {
          auth: {
            token: token,
          },
        };
      }

      const bitbucket = new Bitbucket(clientOptions);

      bitbucket.repositories
        .readSrcRoot({
          repo_slug: repo_name,
          workspace: owner,
          node: branch,
          path: "/",
          max_depth: 10,
          pagelen: 100,
        })
        .then(({ data }) => {
          console.log(data);

          res.status(200).json({ repos: data.values });
        })
        .catch((err) => {
          console.error(err);
          res.status(400).json({ err: "something wrong" });
        });
    }
    if (selected_git === "gitlab") {
      console.log("gitlab selected");

      let encodedURI = encodeURIComponent(repos);
      fetch(
        "https://gitlab.com/api/v4/projects/" +
          encodedURI +
          "/repository/tree?recursive=true&ref=" +
          branch,
        {
          headers: { Authorization: "Bearer " + token },
        }
      )
        .then(function (response) {
          if (response.ok) {
            response.json().then((data) => {
              res.status(200).json({ repos: data });
            });
          } else {
            res.status(400).json({ err: response.statusText });
          }
        })
        .catch(function (error) {
          console.log(error);
          res.status(400).json({ err: "Something wrong" });
        });
    }
  } else {
    res.status(422).json({ err: "Missing Parameters" });
  }
});

router.post("/repo_getFile", async function (req, res, next) {
  const username = req.body.username;
  const token = req.body.token;
  const repos = req.body.repo;
  const branch = req.body.branch;
  const filename = req.body.filename;
  const selected_git = req.body.selected_git;
  const owner = repos.split("/")[0];
  const repo_name = repos.split("/")[1];

  if (
    selected_git &&
    typeof selected_git !== "" &&
    selected_git != undefined &&
    token &&
    typeof token !== "" &&
    token != undefined &&
    repos &&
    typeof repos !== "" &&
    repos != undefined &&
    branch &&
    typeof branch !== "" &&
    branch != undefined &&
    filename &&
    typeof filename !== "" &&
    filename != undefined
  ) {
    if (selected_git === "github") {
      if (username != "") {
        // basic auth
        var gh = new GitHub({
          username: username,
          password: token,
        });
      } else {
        // basic auth
        var gh = new GitHub({
          token: token,
        });
      }

      const repo = gh.getRepo(owner, repo_name);

      repo
        .getContents(branch, filename, false, null)

        .then(function ({ data: data }) {
          // console.log(data);
          res.status(200).json({ filecontent: data });
        })
        .catch(function (err) {
          // console.error(err);
          res.status(400).json({ err: "something wrong" });
        });
      // console.log(filename+'?ref='+branch)
      //   const octokit = new Octokit({
      //     auth: token
      //   })
        
      //   const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}?ref={branch}', {
      //     owner: username,
      //     repo: repo_name,
      //     path: filename ,//+'?ref='+branch,
      //     branch: branch,
      //     headers: {
      //       'X-GitHub-Api-Version': '2022-11-28'
      //     }
      //   })
      //   if (response.status == 200) {
      //     res.status(200).json({ filecontent: response });
      // } else {
      //     this.errorMessage = "Something wrong!";
      //     res.status(400).json({ err: this.errorMessage });
      // }
      


    }

    if (selected_git === "bitbucket") {
      console.log("bitbucket selected");

      if (username != "") {
        // basic auth
        var clientOptions = {
          auth: {
            username: username,
            password: token,
          },
        };
      } else {
        // basic auth
        var clientOptions = {
          auth: {
            token: token,
          },
        };
      }

      const bitbucket = new Bitbucket(clientOptions);

      bitbucket.source
        .read({
          commit: branch,
          repo_slug: repo_name,
          workspace: owner,
          path: filename,
        })
        .then(({ data }) => {
           console.log(data);

          res.status(200).json({ filecontent: data });
        })
        .catch((err) => {
           console.error(err);
          res.status(400).json({ err: "something wrong" });
        });
    }
    if (selected_git === "gitlab") {
      console.log("gitlab selected");

      let encodedURI = encodeURIComponent(repos);
      let encodeURIfileName = encodeURIComponent(filename);
      fetch(
        "https://gitlab.com/api/v4/projects/" +
          encodedURI +
          "/repository/files/" +
          encodeURIfileName +
          "?ref=" +
          branch,
        {
          headers: { Authorization: "Bearer " + token },
        }
      )
        .then(function (response) {
          if (response.ok) {
            response.json().then((data) => {
              res.status(200).json({ filecontent: data });
            });
          } else {
            res.status(400).json({ err: response.statusText });
          }
        })
        .catch(function (error) {
          res.status(400).json({ err: "Something wrong" });
        });
    }
  } else {
    res.status(422).json({ err: "Missing Parameters" });
  }
});

router.post("/repo_addFile", function (req, res, next) {
  const username = req.body.username;
  const token = req.body.token;
  const repos = req.body.repo;
  const branch = req.body.branch;
  const filename = req.body.filename;
  const selected_git = req.body.selected_git;
  const commit_message = req.body.commit_message;
  const owner = repos.split("/")[0];
  const repo_name = repos.split("/")[1];

  if (
    selected_git &&
    typeof selected_git !== "" &&
    selected_git != undefined &&
    token &&
    typeof token !== "" &&
    token != undefined &&
    repos &&
    typeof repos !== "" &&
    repos != undefined &&
    branch &&
    typeof branch !== "" &&
    branch != undefined &&
    filename &&
    typeof filename !== "" &&
    filename != undefined &&
    commit_message &&
    typeof commit_message !== "" &&
    commit_message != undefined
  ) {
    if (selected_git === "github") {
      if (username != "") {
        // basic auth
        var gh = new GitHub({
          username: username,
          password: token,
        });
      } else {
        // basic auth
        var gh = new GitHub({
          token: token,
        });
      }

      const repo = gh.getRepo(owner, repo_name);

      repo
        .writeFile(branch, filename, "", commit_message, (options = {}))
        .then(function ({ data: data }) {
          // console.log(data);
          res.status(200).json({ success: true });
        })
        .catch(function (err) {
          // console.error(err);
          res.status(400).json({ err: "Something wrong" });
        });
    }

    if (selected_git === "bitbucket") {
      console.log("bitbucket selected");

      if (username != "") {
        // basic auth
        var clientOptions = {
          auth: {
            username: username,
            password: token,
          },
        };
      } else {
        // basic auth
        var clientOptions = {
          auth: {
            token: token,
          },
        };
      }

      const bitbucket = new Bitbucket(clientOptions);

      bitbucket.source
        .createFileCommit({
          repo_slug: repo_name,
          workspace: owner,
          branch: branch,
          [filename]: "",
          message: commit_message,
        })
        .then(({ data }) => {
          // console.log(data);
          res.status(200).json({ success: true });
        })
        .catch((err) => {
          // console.error(err);
          res.status(400).json({ err: "something wrong" });
        });
    }
    if (selected_git === "gitlab") {
      console.log("gitlab selected");

      let gitlab_data = {
        branch: branch,
        content: "",
        commit_message: commit_message,
      };

      let encodedURI = encodeURIComponent(repos);
      let encodeURIfileName = encodeURIComponent(filename);
      fetch(
        "https://gitlab.com/api/v4/projects/" +
          encodedURI +
          "/repository/files/" +
          encodeURIfileName,
        {
          method: "POST",
          body: JSON.stringify(gitlab_data),
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      )
        .then(function (response) {
          if (response.ok) {
            response.json().then((data) => {
              res.status(200).json({ success: true });
            });
          } else {
            res.status(400).json({ err: response.statusText });
          }
        })
        .catch(function (error) {
          res.status(400).json({ err: "Something wrong" });
        });
    }
  } else {
    res.status(422).json({ err: "Missing Parameters" });
  }
});

router.post("/repo_deleteFile", function (req, res, next) {
  const username = req.body.username;
  const token = req.body.token;
  const repos = req.body.repo;
  const branch = req.body.branch;
  const filename = req.body.filename;
  const selected_git = req.body.selected_git;
  const commit_message = req.body.commit_message;
  const owner = repos.split("/")[0];
  const repo_name = repos.split("/")[1];

  if (
    selected_git &&
    typeof selected_git !== "" &&
    selected_git != undefined &&
    token &&
    typeof token !== "" &&
    token != undefined &&
    repos &&
    typeof repos !== "" &&
    repos != undefined &&
    branch &&
    typeof branch !== "" &&
    branch != undefined &&
    filename &&
    typeof filename !== "" &&
    filename != undefined &&
    commit_message &&
    typeof commit_message !== "" &&
    commit_message != undefined
  ) {
    if (selected_git === "github") {
      if (username != "") {
        // basic auth
        var gh = new GitHub({
          username: username,
          password: token,
        });
      } else {
        // basic auth
        var gh = new GitHub({
          token: token,
        });
      }

      const repo = gh.getRepo(owner, repo_name);
      repo
        .deleteFile(branch, filename)
        .then(function ({ data: data }) {
          // console.log(data);
          res.status(200).json({ success: true });
        })
        .catch(function (err) {
          // console.error(err);
          res.status(400).json({ err: "Something wrong" });
        });
    }

    if (selected_git === "bitbucket") {
      console.log("bitbucket selected");

      if (username != "") {
        // basic auth
        var clientOptions = {
          auth: {
            username: username,
            password: token,
          },
        };
      } else {
        // basic auth
        var clientOptions = {
          auth: {
            token: token,
          },
        };
      }

      const bitbucket = new Bitbucket(clientOptions);

      bitbucket.source
        .createFileCommit({
          repo_slug: repo_name,
          workspace: owner,
          branch: branch,
          files: filename,
          message: commit_message,
        })
        .then(({ data }) => {
          // console.log(data);
          res.status(200).json({ success: true });
        })
        .catch((err) => {
          // console.error(err);
          res.status(400).json({ err: "something wrong" });
        });
    }
    if (selected_git === "gitlab") {
      console.log("gitlab selected");

      let gitlab_data = {
        branch: branch,
        commit_message: commit_message,
      };

      let encodedURI = encodeURIComponent(repos);
      let encodeURIfileName = encodeURIComponent(filename);
      fetch(
        "https://gitlab.com/api/v4/projects/" +
          encodedURI +
          "/repository/files/" +
          encodeURIfileName,
        {
          method: "DELETE",
          body: JSON.stringify(gitlab_data),
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      )
        .then(function (response) {
          if (response.ok) {
            // console.log(response);
            res.status(200).json({ success: true });
          } else {
            res.status(400).json({ err: response.statusText });
          }
        })
        .catch(function (error) {
          res.status(400).json({ err: "Something wrong" });
        });
    }
  } else {
    res.status(422).json({ err: "Missing Parameters" });
  }
});

router.post("/repo_fileStatus", function (req, res, next) {
  const username = req.body.username;
  const token = req.body.token;
  const repos = req.body.repo;
  const branch = req.body.branch;
  const filename = req.body.filename;
  const filesha = req.body.filesha;
  const content = Buffer.from(req.body.content, "base64").toString();
  const selected_git = req.body.git;

  const message = req.body.message;
  const owner = repos.split("/")[0];
  const repo_name = repos.split("/")[1];

  if (selected_git === "github") {
    if (username != "" && username != null && username != undefined) {
      // basic auth
      var gh = new GitHub({
        username: username,
        password: token,
      });
    } else {
      // basic auth
      var gh = new GitHub({
        token: token,
      });
    }

    const repo = gh.getRepo(owner, repo_name);

    repo
      .getContents(branch, filename, false, null)

      .then(function ({ data: data }) {
         console.log(data);
         console.log(data.sha)

        if (data.sha === filesha) {
          console.log("file is same. we can push the commit");
          console.log(branch, filename, content, message);
          repo
            .writeFile(branch, filename, content, message, (encode = true))
            .then(function (data1) {
              console.log(data1);
              res.status(data1.status).json({
                data: data1.data,
                statusText: data1.statusText,
                fileChanged: false,
                status: true,
              });
            })
            .catch(function (error) {
              console.log(error);
              res.status(error.response.status).json({
                statusText: error.response.statusText,
                status: false,
              });
            });
        } else {
          console.log("file is changed. do you want to see the changed?");
          res.status(200).json({
            data: data,
            fileChanged: true,
            status: true,
          });
        }
      })
      .catch(function (err) {
        res.status(err.response.status).json({
          statusText: err.response.statusText,
          status: false,
        });
      });

  }
  if (selected_git === "bitbucket") {
    console.log("bitbucket selected");

    if (username != "") {
      // basic auth
      var clientOptions = {
        auth: {
          username: username,
          password: token,
        },
      };
    } else {
      // basic auth
      var clientOptions = {
        auth: {
          token: token,
        },
      };
    }

    const bitbucket = new Bitbucket(clientOptions);
    if (req.body.btfilesha === filesha) {
      bitbucket.source
        .createFileCommit({
          branch: branch,
          message: message,
          repo_slug: repo_name,
          workspace: owner,
          // path: filename,
          [filename]: content,
        })
        .then(({ data }) => {
          console.log(data);

          res.status(200).json({
            fileChanged: false,
            status: true,
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(400).json({ err: "something wrong", status: false });
        });
    } else {
      bitbucket.source
        .read({
          commit: branch,
          repo_slug: repo_name,
          workspace: owner,
          path: filename,
        })
        .then(({ data }) => {
          console.log("file is changed. do you want to see the changed?");
          res.status(200).json({
            data: data,
            fileChanged: true,
            status: true,
          });
        })
        .catch((err) => {
          // console.error(err);
          res.status(400).json({ err: "something wrong" });
        });
    }
  }
  if (selected_git === "gitlab") {
    console.log("gitlab selected");

    let encodedURI = encodeURIComponent(repos);
    let encodeURIfileName = encodeURIComponent(filename);
    fetch(
      "https://gitlab.com/api/v4/projects/" +
        encodedURI +
        "/repository/files/" +
        encodeURIfileName +
        "?ref=" +
        branch,
      {
        headers: { Authorization: "Bearer " + token },
      }
    )
      .then(function (response) {
        if (response.ok) {
          response.json().then((data) => {
            if (data.blob_id === filesha) {
              var formdata = {
                branch: branch,
                content: content,
                commit_message: message,
              };

              fetch(
                "https://gitlab.com/api/v4/projects/" +
                  encodedURI +
                  "/repository/files/" +
                  encodeURIfileName,
                {
                  method: "PUT",
                  body: JSON.stringify(formdata),
                  headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                  },
                }
              )
                .then(function (response) {
                  if (response.ok) {
                    response.json().then((data1) => {
                      console.log(data1);

                      fetch(
                        "https://gitlab.com/api/v4/projects/" +
                          encodedURI +
                          "/repository/files/" +
                          encodeURIfileName +
                          "?ref=" +
                          branch,
                        {
                          headers: { Authorization: "Bearer " + token },
                        }
                      )
                        .then(function (response) {
                          if (response.ok) {
                            response.json().then((data2) => {
                              res.status(200).json({
                                data: data2,
                                statusText: response.statusText,
                                fileChanged: false,
                                status: true,
                              });
                            });
                          } else {
                            res.status(400).json({
                              statusText: response.statusText,
                              status: false,
                            });
                          }
                        })
                        .catch(function (error) {
                          // console.log(error);
                          res.status(400).json({ err: "Something wrong" });
                        });
                    });
                  } else {
                    res.status(400).json({
                      statusText: response.statusText,
                      status: false,
                    });
                  }
                })
                .catch(function (error) {
                  // console.log(error);
                  res.status(400).json({ err: "Something wrong" });
                });
            } else {
              console.log("file is changed. do you want to see the changed?");
              res.status(200).json({
                data: data,
                fileChanged: true,
                status: true,
              });
            }
          });
        } else {
          res.status(400).json({ err: response.statusText });
        }
        // console.log("ok");
        // // console.log(response);
        // res.status(200).json({ filecontent: response})
      })
      .catch(function (error) {
        // console.log(error);
        res.status(400).json({ err: "Something wrong" });
      });
  }
});

module.exports = router;
