import useScaleElementWithScroll from "@/hooks/useScaleElementWithScroll";
import YTEmbedMemo from "./YTEmbedMemo";
import { motion, useScroll, useTransform } from "framer-motion";

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
  // const containerRef = useScaleElementWithScroll({
  //   initialHeight: height,
  //   initialWidth: width,
  //   min: 300,
  //   max: height,
  //   enabled: scaleHeight,
  // });

  const { scrollY } = useScroll();
  const scaleX = useTransform(scrollY, [0, 300], [1, scaleHeight ? 0.75 : 1]);
  const scaleY = useTransform(scrollY, [0, 300], [1, scaleHeight ? 0.75 : 1]);
  return (
    <>
      <motion.div
        className={`${className} relative origin-top`}
        style={{
          aspectRatio: `${width ?? 16} / ${height ?? 9}`,
          background: "black",
          scaleY,
        }}
      >
        <motion.div
          // ref={containerRef}
          className={`${className} relative origin-top`}
          style={{ aspectRatio: `${width ?? 16} / ${height ?? 9}`, scaleX }}
        >
          {videoID && (
            <YTEmbedMemo
              videoID={videoID}
              height={height}
              width={width}
              videoSeek={videoSeek}
            />
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default VideoEmbed;
