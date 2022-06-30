import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { OntologySearch } from "../pages/OntologySearch";

const getPage = (pageName: string): JSX.Element => {
  switch (pageName?.toLocaleLowerCase()) {
    default:
    case "ontologysearch":
      return <OntologySearch />;
  }
}

function NavigationRouter(props: any) {
  const [Navigation] = useState(props.Navigation ?? []);
  return (
    <div className={`main px-3 py-3 transition-all duration-700`} >
      <Routes>
        <Route key="home" path="/" element={getPage("home")}></Route>
        {Navigation && Navigation.map((item: any, idx: number) => (<Route key={idx} path={item.href} element={getPage(item.name)} />))}
      </Routes>
    </div>
  );
}

export default NavigationRouter;
