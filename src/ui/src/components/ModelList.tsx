import { useEffect, useState } from "react";
import {
  BulletedTreeListIcon,
  BulletedListIcon,
  GitGraphIcon,
} from "@fluentui/react-icons-mdl2";
import { isArray } from "util";
import { Loading } from "./Loading";
import React from "react";
import CytoscapeComponent from "react-cytoscapejs";

import {
  graphStyles
} from "./Config";
import {  dagreOptions } from "./CytoscapeConfig";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import cola from "cytoscape-cola";
import dagre from "cytoscape-dagre";
import klay from "cytoscape-klay";
import d3Force from "cytoscape-d3-force";

cytoscape.use(klay);
cytoscape.use(dagre);
cytoscape.use(cola);
cytoscape.use(fcose);
cytoscape.use(d3Force);
export interface IModelListProps {
  ontology: any;
  className: string;
  onItemClick: (item: any) => void;
}

const ModelHierarchyItem = ({ hierarchyItem, onItemClick }) => {
  return (
    <details
      className={`mt-3 mx-3 ${
        hierarchyItem.children.length === 0 ? "no-children" : "children"
      }`}
    >      
      <summary className="cursor-pointer">
        <span onClick={() => onItemClick(hierarchyItem.model)}>
          {hierarchyItem.model.displayName} - {hierarchyItem.model.dtId}
        </span>
      </summary>
      <div className="mx-4">
        {hierarchyItem.children &&
          hierarchyItem.children.length > 0 &&
          hierarchyItem.children.map((child) => (
            <ModelHierarchyItem
              hierarchyItem={child}
              onItemClick={onItemClick}
            />
          ))}
      </div>
    </details>
  );
};

export const ModelList: React.FC<IModelListProps> = ({
  ontology,
  className,
  onItemClick,
}) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("list");
  const [graphControl, setGraphControl] = useState(null);

  const loadModels = async () => {
    setLoading(true);
    const fieldApiUrl = `${process.env.REACT_APP_ontology_url}ModelIndex/OntologyModels?ontology=${ontology.owner.toLocaleLowerCase()}%2F${ontology.name.toLocaleLowerCase()}&includeModelDefinitions=false`;
    const response = await fetch(fieldApiUrl);
    const responseText = await response.text();
    setModels(JSON.parse(responseText).sort((a,b)=>{
      const aName = a.displayName ?? a.dtId;
      const bName = b.displayName ?? b.dtId;
      return aName.localeCompare(bName);
    }));
    setLoading(false);
  };

  const cyRef = React.createRef();

  const [modelHierarchy, setModelHierarchy] = useState([]);

  const extendsAnyModel = (model: any) => {
    const realModel = JSON.parse(model.Dtdl);
    const extendedBy = realModel.extends;
    const doesExtendSomething =
      extendedBy !== undefined && extendedBy.length > 0;
    const extendsSomethingHere =
      models.filter((m) => extendedBy && extendedBy.includes(m.dtId)).length >
      0;
    return doesExtendSomething && extendsSomethingHere;
  };

  const isExtendedBy = (model, subject) => {
    const realSubject = JSON.parse(subject.Dtdl);
    if (!realSubject.extends) return false;
    const extendedBy = realSubject.extends;
    if (typeof extendedBy === "string") return extendedBy === model.dtId;
    else if (isArray(extendedBy)) return extendedBy.includes(model.dtId);
    return false;
  };

  useEffect(() => {
    const populateChildren = (model: any) => {
      const childModels = models.filter((m) => isExtendedBy(model, m));
      return childModels.map((m) => {
        return {
          model: m,
          children: [],
        };
      });
    };

    const hierarchy = models
      .filter((s) => !extendsAnyModel(s))
      .map((m) => {
        return {
          model: m,
          children: populateChildren(m),
        };
      });

    setModelHierarchy(hierarchy);
    // eslint-disable-next-line
  }, [models]);

  useEffect(() => {
    loadModels();
    // eslint-disable-next-line
  }, [ontology]);

  useEffect(() => {
    if (!graphControl) return;

    const getExtends = (model: any) => {
      const realModel = JSON.parse(model.Dtdl);
      const extendedBy = realModel.extends;
      const doesExtendSomething =
        extendedBy !== undefined && extendedBy.length > 0;
      if (!doesExtendSomething) return [];
      const extendsThings = models.filter(
        (m) => extendedBy && extendedBy.includes(m.dtId)
      );
      return extendsThings;
    };

    const addModelNodes = () => {
      const mapped = models
        .filter((x) => graphControl.$id(x.dtId).length === 0)
        .map((x) => ({
          data: {
            id: x.dtId,
            label: x.displayName,
            category: "Model",
          },
        }));
      graphControl.add(mapped);
    };

    const addModelRelations = () => {
      models.forEach((model) => {
        const modelData = JSON.parse(model.Dtdl);
        if (!modelData.contents) return;
        const relationships = modelData.contents.filter(
          (m) => m["@type"] === "Relationship"
        );
        relationships.forEach((relationship) => {
          let target = model.dtId;
          if (relationship.target) target = relationship.target;
          const targetModel = models.find((m) => m.dtId === target);

          if (targetModel)
            graphControl.add({
              data: {
                source: model.dtId,
                target: target,
                label: relationship.name,
                category: "related",
              },
            });
        });
      });
    };

    const addModelExtends = () => {
      models.forEach((model) => {
        const parents = getExtends(model);
        parents.forEach((parent) => {
          const targetModel = models.find((m) => m.dtId === parent.dtId);
          if (targetModel)
            graphControl.add({
              data: {
                source: parent.dtId,
                target: model.dtId,
                label: "extends",
                category: "extends",
              },
            });
        });
      });
    };

    addModelNodes();
    addModelExtends();
    addModelRelations();

    const layout = graphControl.layout(dagreOptions);
    try {
      layout.run();
    } catch (e) {}
  }, [graphControl, models]);

  const modelDescription = (mdl) => {
    return mdl.description && typeof mdl.description === "object"
    ? mdl.description.en
    : mdl.description
  }

  return (
    <div className={className}>
      <div className="overflow-y-scroll inset-panel">
        {loading && (
          <Loading
            loadingMessage={`Loading ${ontology.name} Models..`}
            text_color="text-slate-500"
          />
        )}
        {!loading && models.length > 0 && (
          <>
            <div className="h-20">
              <div className="flex flex-row justify-between px-4">
                {models.length} Models
              </div>
              <div className="flex flex-row justify-between mt-2 mx-1">
                <div className="basis-1/5">
                  <BulletedTreeListIcon
                    className={`mx-4 ${
                      mode === "hierarchy" ? "active text-blue-500" : ""
                    }`}
                    onClick={() => setMode("hierarchy")}
                    title="Hierarchy"
                  />
                  <BulletedListIcon
                    className={`mr-4 ${
                      mode === "list" ? "active text-blue-500" : ""
                    }`}
                    onClick={() => setMode("list")}
                    title={"list"}
                  />
                  <GitGraphIcon
                    className={`${
                      mode === "graph" ? "active text-blue-500" : ""
                    }`}
                    onClick={() => setMode("graph")}
                    title={"graph"}
                  />
                </div>
              </div>
            </div>
            {mode === "list" && (
              <table className="min-w-full  border-t">
                <thead className="border-b">
                  <tr>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {models.map((model, index) => (
                    <tr
                      className="border-b cursor-pointer hover:bg-sky-200"
                      onClick={(e) => onItemClick(model)}
                    >
                      <td
                        className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap align-text-top"
                        title={model.dtId}
                      >
                        {model.displayName ?? model.dtId}
                      </td>
                      <td className="text-sm text-gray-900 font-light px-6 py-4 ">
                        {modelDescription(model)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {mode === "hierarchy" && (
              <div className="border-t min-w-full w-full">
                {modelHierarchy.map((h) => (
                  <ModelHierarchyItem
                    hierarchyItem={h}
                    onItemClick={onItemClick}
                  />
                ))}
              </div>
            )}
            {mode === "graph" && (
              <div className="border-t min-w-full w-full">
                <CytoscapeComponent
                  elements={[]}
                  ref={cyRef}
                  stylesheet={graphStyles}
                  className={`graph-control app dark-mode w-full stroke-slate-300 text-slate-200`}
                  cy={(cy) => {
                    if (graphControl !== cy) {
                      setGraphControl(cy);
                    }
                  }}
                  maxZoom={2}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
