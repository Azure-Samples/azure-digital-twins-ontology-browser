import { Button, Link, Modal, Stack, StackItem } from "@fluentui/react";
import { ShareIcon } from "@fluentui/react-icons-mdl2";
import { useEffect, useState } from "react";
import MarkdownRenderer from "react-markdown-renderer";
import { useLocation } from "react-router-dom";
import { Loading } from "./Loading";

export interface IOntologyProps {
  ontology: any;
  className?: string;
  loading: boolean;
}

export const Ontology: React.FC<IOntologyProps> = ({
  ontology,
  className,
  loading,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const location = useLocation();
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if(!ontology) return;
    setShareUrl(
      `${window.location.protocol}//${window.location.host}${location.pathname}?o=${ontology.owner}/${ontology.name}`
    );
  }, [location.pathname, ontology]);

  return (
    <div className={className}>
      {ontology && (
        <div className="ontology-panel">
          <div className="px-10 py-5 sm:px-6 md:flex md:flex-row border-b">
            <div className="flex basis-1/10 wrap">
              <img
                src={"/logo.svg"}
                alt=""
                className="h-20 w-20 flex-none mx-3"
              />
            </div>
            <div className="basis-auto">
              <Stack aria-orientation="vertical">
                <StackItem className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  {ontology.owner}/{ontology.name}
                </StackItem>
                <StackItem>
                  <Link href={ontology.gitHubUrl} target="blank">
                    GitHub
                  </Link>
                  <span className="mx-1">|</span>
                  <ShareIcon onClick={() => setIsShareModalOpen(true)} title={`Share ${ontology.name}`} />
                </StackItem>
              </Stack>
            </div>
          </div>
          <div className="px-10 py-5 sm:px-6 md:flex md:flex-row">
            <div className="flex flex-wrap markdown-body px-5 pb-5 inset-panel overflow-y-scroll ">
              <MarkdownRenderer
                className="w-full"
                markdown={ontology.readmeMd}
              />
            </div>
          </div>
        </div>
      )}
      {loading && (
        <Loading
          loadingMessage={`Loading ontology..`}
          text_color="text-slate-500"
        />
      )}
      {ontology && (
        <Modal
          containerClassName="w-1/3"
          titleAriaId={`Share ${ontology.name}`}
          isOpen={isShareModalOpen}
          className="modal-container"
          onDismiss={() => setIsShareModalOpen(false)}
          isBlocking={false}
        >
          <Stack aria-orientation="vertical" className="m-3">
            <StackItem>
              <h2 className="text-lg leading-6 font-medium text-gray-900" id="share-ontology-label">
                Share Ontology
              </h2>
            </StackItem>
            <StackItem>
              <input aria-labelledby="share-ontology-label" onClick={(e) => {e.currentTarget.select(); navigator.clipboard.writeText(shareUrl);}} value={shareUrl} className="my-3 form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" />
            </StackItem>
            <StackItem>
              <Button onClick={() => { navigator.clipboard.writeText(shareUrl); setIsShareModalOpen(false);}} className="w-full">Copy</Button>
            </StackItem>
          </Stack>
        </Modal>
      )}
    </div>
  );
};
