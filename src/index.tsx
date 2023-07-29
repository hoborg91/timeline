import React from "react";
//import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import { App } from "./App";

import "bootstrap/dist/css/bootstrap.min.css";

//ReactDOM.render(<App />, document.getElementById("container"));
const root = createRoot(document.getElementById("container")!);
root.render(<App />);
