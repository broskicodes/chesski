import { DragEvent, ReactNode, useState } from "react";

// import { addNotification } from "../../../../lib/notifications";
import { useGallery } from "../../providers/FileGalleryProvider";
import { useNotifications } from "../../providers/NotificationProvider";
import { fileToUint8Array } from "../../utils/helpers";
// import { getFilesFromWNFS, uploadFileToWNFS } from "../../../../routes/video-library/lib/gallery";

/**
 * This is needed to prevent the default behaviour of the file opening in browser
 * when it is dropped
 * @param event
 */
const handleDragOver: (event: DragEvent<HTMLLabelElement>) => void = (event) =>
  event.preventDefault();

type Props = {
  children: ReactNode;
};

const Dropzone = ({ children }: Props) => {
  const { writeFile } = useGallery();
  const { addNotification } = useNotifications();
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Detect when a user drags a file in or out of the dropzone to change the styles
   */
  const handleDragEnter: () => void = () => setIsDragging(true);
  const handleDragLeave: () => void = () => setIsDragging(false);

  /**
   * Process files being dropped in the drop zone and ensure they are images
   * @param event
   */
  const handleDrop: (
    event: DragEvent<HTMLLabelElement>,
  ) => Promise<void> = async (event) => {
    // Prevent default behavior (Prevent file from being opened)
    (event as any).preventDefault();

    const files = Array.from((event as any).dataTransfer.items);

    // Iterate over the dropped files and upload them to WNFS
    await Promise.all(
      files.map(async (item: any) => {
        if (item.kind === "file") {
          const file: File = item.getAsFile();

          if (!file.type.match("application/x-chess-pgn")) {
            addNotification({
              msg: "Only pgn files can be uploaded",
              type: "error",
            });
          } else {
            await writeFile(file.name, await fileToUint8Array(file));
          }
        }
      }),
    );

    // Disable isDragging state
    setIsDragging(false);
  };

  return (
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      htmlFor="dropzone-file"
      className={`h-full flex flex-col mt-8${isDragging ? "opacity-50" : ""}`}
    >
      {children}
    </label>
  );
};

export default Dropzone;
