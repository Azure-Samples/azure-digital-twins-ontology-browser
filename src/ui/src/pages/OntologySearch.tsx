import { Combobox } from "@headlessui/react";
import { ChevronRightIcon, SearchIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loading } from "../components/Loading";
import { Model } from "../components/Model";
import { ModelList } from "../components/ModelList";
import { Ontology } from "../components/Ontology";

export interface IOntologySearchProps {
  className?: string;
}

export interface IOntologyResultItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: string;
  children: IOntologyResultItem[];
}


export const OntologySearch: React.FC<IOntologySearchProps> = ({
  className,
}) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  let urlSelectedOntology = null;
  if (params.get("o")) {
    const ontology = params.get("o");
    const model = params.get("m");
    const type = model ?"model":"ontology";
    const id = type === "model" ? decodeURI(ontology)+"/"+decodeURI(model) : decodeURI(ontology);
    urlSelectedOntology = {
      displayName: ontology,
      name:ontology ,
      type: type,
      id: id
    };
  }

  const [selectedResult, setSelectedResult] = useState(urlSelectedOntology);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedOntology, setSelectedOntology] = useState(null);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState<Array<any>>([]);
  const [searching, setSearching] = useState(false);
  const [loadingOntology, setLoadingOntology] = useState(false);
  const [indexState, setIndexState] = useState(null);

  const loadIndexState = async () => {
    const fieldApiUrl = `${process.env.REACT_APP_ontology_url}IndexState`;
    const response = await fetch(fieldApiUrl);
    const data = await response.json();
    setIndexState(data);
  };

  const search = async (searchString: string) => {
    let results = [];
    if (searchString.length === 0) return results;
    setSearching(true);
    const fieldApiUrl = `${process.env.REACT_APP_ontology_url}ModelIndex?fieldNames=${searchString}&includeModelDefinitions=false`;
    const response = await fetch(fieldApiUrl);
    const responseText = await response.text();
    const data = JSON.parse(responseText);
    if (data.suggestedOntologies.length > 0) {
      results = data.suggestedOntologies.sort((a,b) => a.name.localeCompare(b.name)).map((ontology) => {
        return {
          id: ontology.name + "/",
          name: ontology.name,
          displayName: ontology.name,
          description: ontology.description,
          type: "ontology",
          children: Object.keys(ontology.suggestedModels).sort().map((modelId) => {
            const model = ontology.suggestedModels[modelId];
            return {
              id: ontology.name + "/" + model.id,
              name: model.id,
              displayName: model.id,
              ontology: ontology,
              type: "model",
            };
          }),
        };
      });
    } else {
      if (!indexState) await loadIndexState();
      results = getOntologyList();
    }
    setSearching(false);
    return results;
  };

  const getOntologyList = () => {
    return indexState.ontologyIndexes
      .sort((a,b) =>{
        if(a.indexName.includes("Azure") && b.indexName.includes("Azure")) return  a.indexName.localeCompare(b.indexName);
        if(a.indexName.includes("Azure"))
          return -1;
        if(b.indexName.includes("Azure"))
          return 1;
        return a.indexName.localeCompare(b.indexName);
      })
      .filter(
        (index: any) =>
          !searchString ||
          searchString.length === 0 ||
          typeof searchString === "object" ||
          index.indexName
            .toLocaleLowerCase()
            .includes(searchString.toLocaleLowerCase())
      )
      .map((ontology) => {
        return {
          id: ontology.indexName,
          name: ontology.indexName,
          displayName: ontology.indexName,
          type: "ontology",
          children: [],
        };
      });
  };

  useEffect(() => {
    const loadModelAsync = async (ontologyName: string, modelId: string) => {
      const modelApiUrl = `${
        process.env.REACT_APP_ontology_url
      }ModelIndex/Dtdl?ontology=${encodeURI(ontologyName)}&id=${encodeURI(
        modelId
      )}`;
      console.log(modelApiUrl);
      if(!selectedOntology) await loadOntologyAsync(selectedResult.name.split("/")[0]+"/"+selectedResult.name.split("/")[1]);
      const response = await fetch(modelApiUrl);
      const data = await response.json();
      setSelectedModel(data);
    };

    const loadOntologyAsync = async (ontologyName: string) => {
      if (selectedOntology && selectedOntology.name === ontologyName) return;
      setLoadingOntology(true);
      setSelectedOntology(null);
      const modelApiUrl = `${
        process.env.REACT_APP_ontology_url
      }ModelIndex/OntologyDetails?ontology=${encodeURI(ontologyName)}`;
      const response = await fetch(modelApiUrl);
      const data = await response.json();
      setSelectedOntology(data);
      setLoadingOntology(false);
    };

    if (!selectedResult) return;

    if (selectedResult.ontology ) {
      loadOntologyAsync(selectedResult.ontology.name);
    } else if (selectedResult.type === "ontology") {
      loadOntologyAsync(selectedResult.name);
    } else setSelectedOntology(null);

    if (selectedResult.type === "model") {
      loadModelAsync(
        selectedResult.id.split("/")[0] + "/" + selectedResult.id.split("/")[1],
        selectedResult.id.split("/")[2]
      );
    } else setSelectedModel(null);
    // eslint-disable-next-line
  }, [selectedResult, setSelectedModel]);

  const onSearch = async (newVal?: string) => {
    clearSearchResults();
    setSearchString(newVal ?? "");
  };

  const onSearchClick = () => {
    if (searchString.length > 0) return;
    if (!indexState || indexState.ontologyIndexes.length === 0) return;
    setSearchResults(getOntologyList());
  };

  useEffect(() => {
    loadIndexState();
  }, []);

  useEffect(() => {
    const doSearch = async (targetString: string) => {
      if (targetString.length > 0) {
        const results = await search(targetString);
        setSearchResults(results);
      }
    };
    doSearch(searchString);
    // eslint-disable-next-line
  }, [searchString, setSearchResults, setSelectedOntology]);

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  const [searchClassNames, setSearchClassNames] = useState<string>("my-50");

  useEffect(() => {
    const isMainBit = !selectedOntology && !selectedModel;
    if (isMainBit) setSearchClassNames("my-auto");
    else setSearchClassNames("my-0");
  }, [selectedModel, selectedOntology]);

  return (
    <div className={className}>
      <div
        className={`${searchClassNames} center mx-4 divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all opacity-100 scale-100`}
      >
        <label htmlFor="search" className="sr-only">
          Search For An Ontology
        </label>
        <Combobox
          value={searchString}
          onChange={(e) => {
            onSearch(e);
          }}
        >
          {() => (
            <>
              <div className="relative">
                <SearchIcon
                  className="pointer-events-none absolute mt-3 ml-3 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <Combobox.Input
                  onClick={(e) => onSearchClick()}
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 pb-2 border border-transparent rounded-md leading- focus:outline-none focus:bg-white focus:border-white focus:ring-white focus:text-gray-900 sm:text-sm"
                  placeholder="Search For An Ontology"
                  onChange={(e) => {
                    onSearch(e.target.value);
                  }}
                  value={searchString}
                  type="search"
                />
              </div>

              {(searchString === "" || searchResults.length > 0) && (
                <Combobox.Options
                  as="div"
                  static
                  hold
                  className="flex divide-x divide-gray-100 relative"
                >
                  <div className="-mx-2 text-sm text-gray-700">
                    {searchResults.map((result) => (
                      <>
                        <Combobox.Option
                          as="div"
                          key={result.id}
                          value={result}
                          onClick={() => {
                            setSelectedResult(result);
                          }}
                          className={({ active }) =>
                            ` cursor-default select-none items-center rounded-md p-2 ${
                              active ? "bg-gray-100 text-gray-900" : ""
                            }`
                          }
                        >
                          {({ active }) => (
                            <div className="flex flex-row">
                              <img
                                src={"/logo.svg"}
                                alt=""
                                className="h-6 w-6 flex-none rounded-full mx-3 basis-1/12"
                              />
                              <span className="flex-auto truncate text-medium">
                                {result.displayName}
                              </span>
                              {active && (
                                <ChevronRightIcon
                                  className="ml-3 h-5 w-5 flex-none text-gray-400"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          )}
                        </Combobox.Option>
                        {result.type === "ontology" &&
                          result.children.map((child) => (
                            <Combobox.Option
                              as="div"
                              key={child.id}
                              value={child}
                              onClick={() => {
                                setSelectedResult(child);
                              }}
                              className={({ active }) =>
                                ` cursor-default select-none items-center rounded-md p-2 ${
                                  active ? "bg-gray-100 text-gray-900" : ""
                                }`
                              }
                            >
                              {({ active }) => (
                                <div className="flex flex-row">
                                  <span className="ml-12 flex-auto truncate">
                                    {child.displayName}
                                  </span>
                                  {active && (
                                    <ChevronRightIcon
                                      className="ml-3 h-5 w-5 flex-none text-gray-400"
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                              )}
                            </Combobox.Option>
                          ))}
                      </>
                    ))}
                  </div>
                </Combobox.Options>
              )}
            </>
          )}
        </Combobox>
      </div>
      {!searching && (loadingOntology || selectedModel || selectedOntology) && (
        <div className="bg-white shadow sm:rounded-lg  my-4 mx-4 p-4 sm:flex sm:flex-auto md:flex-row ">
          {
            <Ontology
              ontology={selectedOntology}
              loading={loadingOntology}
              className="md:basis-1/2 sm:basis-0 sm:w-full sm:flex-wrap"
            />
          }
          {selectedOntology && !selectedModel && (
            <ModelList
              className="sm:flex-wrap md:basis-1/2"
              ontology={selectedOntology}
              onItemClick={(i) =>
                setSelectedResult({
                  ontology: selectedOntology,
                  type: "model",
                  id: `${selectedOntology.owner}/${selectedOntology.name}/${i.dtId}`,
                })
              }
            />
          )}
          {selectedModel && (
            <Model
              className="overflow-y-auto md:basis-1/2"
              model={selectedModel}
              onOpenModel={(modelId) => {
                
                setSelectedResult({
                  ontology: selectedOntology,
                  type: "model",
                  id: `${selectedOntology.owner}/${selectedOntology.name}/${modelId}`,
                })
              }}
              onModelClose={() => setSelectedModel(null)}
            />
          )}
        </div>
      )}
      {searching && (
        <div className="flex py-56">
          <Loading
            loadingMessage={`Searching for ${searchString}`}
            text_color="text-white"
          />
        </div>
      )}
    </div>
  );
};
