import { useGallery } from "../../providers/FileGalleryProvider";
import { fileToUint8Array } from "../../utils/helpers";
import { Button } from "../display/Button";
import { useRef } from "react";

export const FileUploadButton = () => {
  const { loading, parsePgnToFiles } = useGallery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <label htmlFor="upload-file" className="">
      {loading ? (
        <Button className="flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-t-orange-300 border-neutral-900 h-8 w-8 animate-spin" />
        </Button>
      ) : (
        <>
          <Button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            <p className="text-sm">
              <span className="font-bold text-sm">Click to upload PGN</span>
            </p>
            <p className="text-xxs"></p>
          </Button>
          <input
            onChange={async (e) => {
              const { files } = e.target;
              if (!files) return;

              await Promise.all(
                Array.from(files).map(async (file) => {
                  await parsePgnToFiles(await fileToUint8Array(file));
                }),
              );
            }}
            id="upload-file"
            type="file"
            ref={fileInputRef}
            multiple
            accept="application/x-chess-pgn"
            className="hidden"
          />
        </>
      )}
    </label>
  );
};
