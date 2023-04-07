import useScaleElementWithScroll from "@/hooks/useScaleElementWithScroll";
import YTEmbedMemo from "./YTEmbedMemo";
const VideoEmbed = ({
  videoID,
  className,
  width,
  height,
  videoSeek,
  scaleHeight = false,
}: {
  videoID?: string;
  width?: number;
  height?: number;
  className?: string;
  videoSeek: [number, number, number];
  scaleHeight?: boolean;
}) => {
  const containerRef = useScaleElementWithScroll({
    initialHeight: height,
    initialWidth: width,
    min: 300,
    max: height,
    enabled: scaleHeight,
  });
  return (
    <div
      ref={containerRef}
      className={`${className} relative`}
      style={{ aspectRatio: `${width ?? 16} / ${height ?? 9}` }}
    >
      {videoID && (
        <YTEmbedMemo
          videoID={videoID}
          height={height}
          width={width}
          videoSeek={videoSeek}
        />
      )}
    </div>
  );
};

export default VideoEmbed;
