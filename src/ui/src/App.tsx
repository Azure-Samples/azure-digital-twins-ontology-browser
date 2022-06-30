import { BrowserRouter as Router } from "react-router-dom";
import MainPanel from "./components/MainPanel";
import { useEffect, useState } from "react";
import Navigation from "./data/Navigation";
import { initializeIcons, loadTheme } from "@fluentui/react";

function App() {
  const [navItems] = useState(Navigation);

  initializeIcons();
  loadTheme({
    palette: { themePrimary: "#505050", themeDarkAlt: "#106EBE" },
    semanticColors: { buttonBackground: "white" },
  });

  if (process.env.REACT_APP_ontology_url === "[ontology-api-url]") {
    return <div>You need to update your .env file - see the README</div>;
  }

  return (
    <Router>
      <div className="app dark-mode slate">
        <MainPanel Navigation={navItems} />
      </div>
    </Router>
  );
}

export default App;
