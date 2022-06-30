import { Pivot, PivotItem, Stack, StackItem } from "@fluentui/react";
import { ChromeCloseIcon } from "@fluentui/react-icons-mdl2";
import { Kvp } from "./Kvp";

export interface IModelProps {
  model: any;
  className?: string;
}

const ContentElement = ({ content }) => {
  const contentDisplayName =
    content.displayName &&
    content.displayName !== content.name &&
    typeof content.displayName === "object"
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
  let modelName =
    model.displayName && typeof model.displayName === "object"
      ? model.displayName.en.value
      : model.displayName;
  if (modelName === undefined) modelName = model["@id"];
  const modelDescription =
    model.description && typeof model.description === "object"
      ? model.description.en.value
      : model.description;
  const modelComment =
    model.comment && typeof model.comment === "object"
      ? model.comment.en.value
      : model.comment;

  const properties =
    model.contents?.filter((c) => c["@type"] === "Property") ?? [];
  const telemetry =
    model.contents?.filter((c) => c["@type"] === "Telemetry") ?? [];
  const relationships =
    model.contents?.filter((c) => c["@type"] === "Relationship") ?? [];
  const components = model.contents?.filter((c) => c["@type"] === "Component");
  const commands = model.contents?.filter((c) => c["@type"] === "Command");

  return (
    <div className={"ontology-panel border-l " + className}>
      {model && (
        <>
          <div className="px-10 py-5 sm:px-6 flex flex-row border-b">
            <div className="basis-auto h-20 w-full">
              <Stack aria-orientation="vertical">
                <StackItem className="mt-4 w-100">
                  <h2 className="text-lg leading-6 font-medium text-gray-900 float-left">
                    {modelName}
                  </h2>
                  <span className="float-right text-lg leading-6 font-medium text-gray-400 cursor-pointer" title={`Close ${modelName}`}>
                    <ChromeCloseIcon onClick={() => onModelClose()} />
                  </span>
                </StackItem>

                {modelDescription && <StackItem>{modelDescription}</StackItem>}
                {modelComment && <StackItem>{modelComment}</StackItem>}
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
                      <ContentSection
                        title="Commands"
                        contents={commands}
                      />
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
