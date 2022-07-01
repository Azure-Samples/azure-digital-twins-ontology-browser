import { Pivot, PivotItem, Stack, StackItem } from "@fluentui/react";
import { ChromeCloseIcon } from "@fluentui/react-icons-mdl2";
import { useEffect, useState } from "react";
import { Kvp } from "./Kvp";

export interface IModelProps {
  model: any;
  className?: string;
}

const ContentElement = ({ content }) => {
  //console.log(content);
  const contentDisplayName =
    content.displayName && typeof content.displayName === "object"
      ? content.displayName.en
      : content.displayName;
  const contentDescription =
    content.description && typeof content.description === "object"
      ? content.description.en
      : content.description;
  const contentComment =
    content.comment && typeof content.comment === "object"
      ? content.comment.en
      : content.comment;

  return (
    <div className="mx-6 py-3 border-b">
      <div>
        <span className=" leading-6 font-medium text-gray-900">
          {content.name}
        </span>
        <span className=" ml-2">{contentDisplayName}</span>
      </div>
      <div className="flex flex-row">{contentDescription}</div>
      <div className="px-6 py-3 italic">{contentComment}</div>
      {content.schema && (
        <Kvp
          keyName={"Schema"}
          value={content.schema}
          className="flex flex-row"
        />
      )}
      {content.target && (
        <Kvp
          keyName={"Targets"}
          value={content.target}
          className="flex flex-row"
        />
      )}
    </div>
  );
};

const ContentSection = ({ title, contents }) => {
  return (
    <>
      {contents.length > 0 && (
        <div className="w-full  -mx-8 py-3 sm:px-6 border-b">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            {contents.length} {title}
          </h2>
        </div>
      )}
      {contents.map((content) => (
        <ContentElement content={content} key={content.name} />
      ))}
    </>
  );
};

export const Model: React.FC<any> = ({ model, className, onModelClose }) => {

  const [mdl] = useState(model);
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [modelComment, setModelComment] = useState("");

  const [properties, setProperties] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [commands, setCommands] = useState([]);
  const [components, setComponents] = useState([]);
  const [relationships, setRelationships] = useState([]);

  useEffect(() => {
    console.log(mdl);
    let name =
      mdl.displayName && typeof mdl.displayName === "object"
        ? mdl.displayName.en
        : mdl.displayName;

    if (name === undefined) name = mdl["@id"];

    setModelDescription(
      mdl.description && typeof mdl.description === "object"
        ? mdl.description.en
        : mdl.description
    );
    setModelName(name);
    setModelComment(
      mdl.comment && typeof mdl.comment === "object"
      ? mdl.comment.en
      : mdl.comment);

    setProperties(mdl.contents?.filter((c) => c["@type"] === "Property") ?? []);
    setTelemetry(mdl.contents?.filter((c) => c["@type"] === "Telemetry") ?? [])
    setCommands(mdl.contents?.filter((c) => c["@type"] === "Command") ?? []);
    setComponents(mdl.contents?.filter((c) => c["@type"] === "Component") ?? []);
    setRelationships(mdl.contents?.filter((c) => c["@type"] === "Relationship") ?? []);


  }, [mdl, modelName, setModelDescription, setModelComment]);

  return (
    <div className={"ontology-panel border-l " + className}>
      {model && (
        <>
          <div className="px-10 py-5 sm:px-6 flex flex-row border-b">
            <div className="basis-auto h-20 w-full">
              <Stack aria-orientation="vertical">
                <StackItem className="mt-4 w-100">
                  <h2 className="text-lg leading-6 font-medium text-gray-900 float-left" title={mdl["@id"]}>
                    {modelName}
                  </h2>
                  <span
                    className="float-right text-lg leading-6 font-medium text-gray-400 cursor-pointer"
                    title={`Close ${modelName}`}
                  >
                    <ChromeCloseIcon onClick={() => onModelClose()} />
                  </span>
                </StackItem>
                <StackItem>{modelDescription}</StackItem>
                 <StackItem>{modelComment}</StackItem>
              </Stack>
            </div>
          </div>
          <Pivot className="bg-white shadow overflow-hidden sm:rounded-lg ">
            <PivotItem headerText={"Details"}>
              <div className="flex flex-col overflow-scroll">
                <div className="overflow-auto max-h-screen">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {model["@id"]}
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 p-5 overflow-auto max-h-screen">
                    {properties && properties.length > 0 && (
                      <ContentSection
                        title="Properties"
                        contents={properties}
                      />
                    )}
                    {telemetry && telemetry.length > 0 && (
                      <ContentSection title="Telemetry" contents={telemetry} />
                    )}
                    {relationships && relationships.length > 0 && (
                      <ContentSection
                        title="Relationships"
                        contents={relationships}
                      />
                    )}
                    {components && components.length > 0 && (
                      <ContentSection
                        title="Components"
                        contents={components}
                      />
                    )}
                    {commands && commands.length > 0 && (
                      <ContentSection title="Commands" contents={commands} />
                    )}
                  </div>
                </div>
              </div>
            </PivotItem>
            <PivotItem headerText="DTDL">
              <div className="flex flex-col">
                <div className="bg-white overflow-scroll mx-6 pt-4">
                  <div className="border shadow border-gray-200 p-5 overflow-auto max-h-screen">
                    <pre>{JSON.stringify(model, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </PivotItem>
          </Pivot>
        </>
      )}
    </div>
  );
};
