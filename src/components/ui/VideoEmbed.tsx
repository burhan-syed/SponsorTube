import React from "react";

const VideoEmbed = ({
  iFrameSrc,
  styles,
  width,
  height,
}: {
  iFrameSrc: string;
  width?: number;
  height?: number;
  styles?: string;
}) => {
  return (
    <iframe
      className={styles}
      style={{ aspectRatio: `${width ?? 16} / ${height ?? 9}` }}
      src={iFrameSrc}
    ></iframe>
  );
};

export default VideoEmbed;
