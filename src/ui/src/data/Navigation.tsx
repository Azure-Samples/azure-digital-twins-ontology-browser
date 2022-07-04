export interface INavItem {
  id: string;
  name: string;
  displayName: string;
  href: string;
}

const Navigation: INavItem[] = [
  {
    id: "0",
    name: "ontologysearch",
    displayName: "Ontology Search",
    href: "ontologysearch",
  }
];

export default Navigation;
