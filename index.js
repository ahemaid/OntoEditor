const ShareDB = require("sharedb");
ShareDB.types.register(require("ot-text").type);
const WebSocket = require("ws");
const WebSocketJSONStream = require("websocket-json-stream");
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongodb = require("mongodb");
const { uuid } = require('uuidv4');

const GitHub = require("github-api");
const { Bitbucket } = require("bitbucket");
const fetch = require("node-fetch");


//Sql configuration
// const mysqlOptions = { db: {host: 'localhost', user: 'root', password: '', database: 'editor', connectionLimit: 20}, ops_table: 'ops', snapshots_table: 'snapshots', debug: true };
// var mySQLDB = require('sharedb-mysql')(mysqlOptions);


// mongodb configuration
// const db = require("sharedb-mongo")({
//   mongo: function (callback) {
//     mongodb.connect("mongodb://localhost:27017/editor", callback);
//   },
// });

// Static Server
const app = express();
const server = http.createServer(app);

const editorRouter = require("./routes/editor/index.js");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", editorRouter);
app.use("/", express.static("./"));

app.get("/collaborative_editing", function (req, res, next) {
  // Create the document if it hasn't been already
  const projId = req.query.projId;

  if (
    projId &&
    typeof projId !== "" &&
    projId != undefined &&
    req.query.owner &&
    typeof req.query.owner !== "" &&
    req.query.owner != undefined &&
    req.query.repo &&
    typeof req.query.repo !== "" &&
    req.query.repo != undefined &&
    req.query.branch &&
    typeof req.query.branch !== "" &&
    req.query.branch != undefined &&
    req.query.file_sha &&
    typeof req.query.file_sha !== "" &&
    req.query.file_sha != undefined &&
    req.query.path &&
    typeof req.query.path !== "" &&
    req.query.path != undefined &&
    req.query.git &&
    typeof req.query.git !== "" &&
    req.query.git != undefined
  ) {
    console.log(projId);
    const sharedoc = shareconn.get(projId, "default");

    sharedoc.fetch(function (err) {
      if (err) {
        next(createError(404));
      }
      if (sharedoc.data == null) {
        next(createError(404));
      } else {
        res.render("editor/collaborative", {
          docs: req.query.projId,
          docsname: "default",
          token: req.query.token,
          username: req.query.username,
        });
      }
    });
  } else {
    next(createError(404));
  }
});

app.post("/collaborate", function (req, res) {
  const username = req.body.username;
  const token = req.body.token;
  const repos = req.body.repo;
  const branch = req.body.branch;
  const fileName = req.body.filename;
  const file_sha = req.body.file_sha;
  const selected_git = req.body.selected_git;
  const mode = req.body.mode;
  const owner = repos.split("/")[0];
  const repo_name = repos.split("/")[1];
  const uuidID = uuid()

  if (
    token &&
    typeof token !== "" &&
    token != undefined &&
    repos &&
    typeof repos !== "" &&
    repos != undefined &&
    branch &&
    typeof branch !== "" &&
    branch != undefined &&
    fileName &&
    typeof fileName !== "" &&
    fileName != undefined &&
    file_sha &&
    typeof file_sha !== "" &&
    file_sha != undefined &&
    mode &&
    typeof mode !== "" &&
    mode != undefined &&
    selected_git &&
    typeof selected_git !== "" &&
    selected_git != undefined
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

      repo.getContents(branch, fileName, true, null)
        .then(function ({ data: data }) {
          //  console.log(data);
          let parameters ="projId=" +uuidID +"&owner=" +owner +"&repo=" +repo_name +"&branch=" +branch +"&file_sha=" +file_sha +"&path=" +fileName +"&git=" +selected_git +"&mode=" +mode;
          if (typeof data != "string") {
            data = JSON.stringify(data, undefined, 2);
          }
          const sharedoc = shareconn.get(uuidID, "default");
          sharedoc.fetch(function (err) {
            if (err) {
              console.log(err);
            } else {
              if (sharedoc.data == null) sharedoc.create(data, "text");
              res.status(200).json({ link: parameters });
            }
          });
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

      bitbucket.source
        .read({
          repo_slug: repo_name,
          workspace: owner,
          node: branch,
          path: fileName,
        })
        .then(({ data }) => {
          console.log(data);

          let parameters ="projId=" +uuidID +"&owner=" +owner +"&repo=" +repo_name +"&branch=" +branch +"&file_sha=" +file_sha +"&path=" +fileName +"&git=" +selected_git +"&mode=" +mode;

          const sharedoc = shareconn.get(uuidID, "default");
          sharedoc.fetch(function (err) {
            if (err) {
              console.log(err);
            } else {
              if (sharedoc.data == null) sharedoc.create(data, "text");

              res.status(200).json({ link: parameters });
            }
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(400).json({ err: "something wrong" });
        });
    }

    if (selected_git === "gitlab") {
      console.log("gitlab selected");

      let encodedURI = encodeURIComponent(repos);
      let encodeURIfileName = encodeURIComponent(fileName);
      fetch(
        "https://gitlab.com/api/v4/projects/" +
          encodedURI +
          "/repository/files/" +
          encodeURIfileName +
          "/raw?ref=" +
          branch,
        {
          headers: { Authorization: "Bearer " + token },
        }
      )
        .then(function (response) {
          if (response.ok) {
            response.text().then((data) => {

              let parameters ="projId=" +uuidID +"&owner=" +owner +"&repo=" +repo_name +"&branch=" +branch +"&file_sha=" +file_sha +"&path=" +fileName +"&git=" +selected_git +"&mode=" +mode;

              const sharedoc = shareconn.get(uuidID, "default");
              sharedoc.fetch(function (err) {
                if (err) {
                  console.log(err);
                } else {
                  if (sharedoc.data == null) sharedoc.create(data, "text");

                  res.status(200).json({ link: parameters });
                }
              });

              // res.status(200).json({ filecontent: data})
            });
          } else {
            res.status(400).json({ err: response.statusText });
          }
          // // console.log(response);
          // res.status(200).json({ filecontent: response})
        })
        .catch(function (error) {
          // console.log(error);
          res.status(400).json({ err: "Something wrong" });
        });
    }
  } else {
    res.status(400).json({ err: "Missing Parameters." });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Socket IO Server
const io = socketio(server);
const anchors = {};
const names = {};
io.on("connection", (client) => {
  var query = client.handshake.query;
  var roomName = query.roomName;
  var userName = query.userName;
  console.log(roomName);
  if (!roomName) {
    // Handle this as required
  }
  client.join(roomName);

  const id = roomName + "room" + client.id;
  names[id] = userName;
  anchors[id] = [0, 0];

  // send client its id and anchor and names obj
  client.emit("initialize", { anchors, names });

  client.on("anchor-update", (msg) => {
    // set anchors[id]
    anchors[id] = msg;
    io.emit("anchor-update", { id, anchor: anchors[id] });
  });


  client.on("chat-message", (msg) => {
    //send message to all users in this room except sender
    client.broadcast.to(roomName).emit("chat_message_broadcast", msg);
  });

  client.on("commit-pushed", (msg) => {
    console.log(msg.commit_message);
    console.log(msg);
    //send message to all users in this room.
    io.to(roomName).emit("commit", msg);
  });

  client.on("merge-commit-pushed", (msg) => {
    console.log(msg.merge_message);
    console.log(msg);
    //send message to all users in this room.
    io.to(roomName).emit("merge_commit", msg);
  });

  io.emit("id-join", { id, name: names[id], anchor: anchors[id] });

  // Remove id info and update clients
  // connections that eventually will close
  client.on("disconnect", () => {
    console.log("left", id);
    delete names[id];
    delete anchors[id];
    io.emit("id-left", { id });
  });
});

// Start Server
const port = process.env.PORT || 5000;
server.listen(port);
console.log(`listening on port ${port}`);

// Share DB
// const share = new ShareDB({ db });
//To run without mongodb
const share = new ShareDB();
const shareconn = share.connect();
const shareserver = http.createServer();
const sharewss = new WebSocket.Server({ server: shareserver });
sharewss.on("connection", (client) =>
  share.listen(new WebSocketJSONStream(client))
);
shareserver.listen(8080);

console.log(`ShareDB listening on port 8080  `);
