import React, { useRef, useState, useEffect } from "react";
import { Layer, Stage } from "react-konva";
import CanvasBackground from "./CanvasBackground";
import ImageComponent from "./ImageComponent";
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { useCurrentFrame } from 'remotion';
import { spring } from 'remotion';
import { interpolate } from 'remotion';

const tempData = [
  {
    id: "image0",
    src: "https://texts.com/images/mobile-social-logos.png",
    x: 153.0989926076774,
    y: 88.52367522486367,
  },
  {
    id: "image1",
    src: "https://texts.com/images/msg1.png",
    x: 94.16808794734652,
    y: 360.2920219868365,
  },
  {
    id: "image2",
    src: "https://texts.com/images/msg3.png",
    x: 515.1403559968304,
    y: 87.48942695580762,
  }
]

const CanvasAnimation = () => {
  const [imageDemoProp, setImageDemoProp] = useState<any>(tempData[0])

  // static canvas dimensions used for scaling ratio
  const stageWidth = 3840,
    stageHeight = 2160;

  // dynamic canvas dimensions
  const [stageDimensions, setStageDimensions] = useState({
    width: stageWidth,
    height: stageHeight,
    scale: 1
  });

  // stageRef is used for handling callbacks - example: getting canvas positions after drag and rop
  const stageRef = useRef<any>();
  // containerRef is used for dynamic canvas scalling
  // main purpose of containerRef is to get width of parent div of canvas stage
  const containerRef = useRef<any>();
  // dragUrl stores temporary src of dragged image
  const [dragUrl, setDragUrl] = useState();
  // images stores images that are added to canvas
  const [images, setImages] = useState<any>([]);
  // backgroundImage is used for setting backgroundImage of canvas
  const [backgroundImage, setBackgroundImage] = useState();
  // selectedId is used for keeping selected image to handle resizes, z-index priority etc.
  const [selectedId, setSelectedId] = useState<any>(null);

  // function to handle adding images on drag and drop to canvas
  const handleOnDrop = (e: any) => {
    e.preventDefault();
    stageRef.current.setPointersPositions(e);
    setImages(
      images.concat([
        {
          ...stageRef.current.getPointerPosition(),
          src: dragUrl,
        },
      ])
    );
  };

  // if clicked on empty space of canvas, including backgroundImage perform deselect item
  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    const clikedOnBackground = e.target.getId() === "canvasBackground";
    if (clickedOnEmpty || clikedOnBackground) {
      setSelectedId(null);
    }
  };

  // function to handle adding images on click
  const handleAddOnClick = (src: any) => {
    let centerX = stageDimensions.width / 2
    let centerY = stageDimensions.height / 2
    setImages(
      images.concat([
        {
          x: centerX,
          y: centerY,
          src: src,
        },
      ])
    );
  }

  // used for passing image id to image attributes
  const passImageWithId = (image: any, id: any) => {
    const imageWithId = {
      ...image,
      id: id,
    };
    return imageWithId;
  };

  // update image attributes when performing resize
  const handleTransformChange = (newAttrs: any, i: any) => {
    console.log("newAttrs>>", newAttrs);

    // let imagesToUpdate = images;
    // let singleImageToUpdate = imagesToUpdate[i];
    // update old attributes
    setImageDemoProp(newAttrs)
    // singleImageToUpdate = newAttrs;
    // imagesToUpdate[i] = singleImageToUpdate;
    // setImages(imagesToUpdate);
  };


  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const zoomProgress = spring({
    fps,
    frame: frame - 20,
    config: {
      damping: 200,
    },
  });
  const scale = interpolate(zoomProgress, [10, 60], [1, 3]);
  const translateX = interpolate(zoomProgress, [0, 1], [0, 945], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(zoomProgress, [0, 1], [0, 328], {
    extrapolateRight: "clamp",
  });

  return (
    <div>
      <div className="canvasWrap">
        <div
          className="canvasBody"
          ref={containerRef}
          onDrop={handleOnDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Stage
            width={stageDimensions.width}
            height={stageDimensions.height}
            scaleX={stageDimensions.scale}
            scaleY={stageDimensions.scale}
            className="canvasStage"
            ref={stageRef}
            onMouseDown={(e) => {
              // deselect when clicked on empty area or background image
              checkDeselect(e);
            }}
          >
            <Layer>
              {typeof backgroundImage === "string" && (
                // check if background image is not empty, default state is null
                <CanvasBackground
                  backgroundUrl={backgroundImage}
                  width={stageWidth}
                  height={stageHeight}
                />
              )}
              <ImageComponent
                image={tempData[0]}
                shapeProps={{...imageDemoProp, scaleX: scale, scaleY: scale, x: translateX, y: translateY}}
                id={`image${0}`}
                key={0}
                isSelected={0 === selectedId}
                onSelect={() => {
                  setSelectedId(0);
                }}
                onChange={(newAttrs: any) => {
                  handleTransformChange(newAttrs, 0);
                }}
                keepRatio={true}
              />
              {/* {tempData.map((image: any, i: any) => {
                return (
                  <ImageComponent
                    image={image}
                    shapeProps={passImageWithId(image, `image${i}`)}
                    id={`image${i}`}
                    key={i}
                    isSelected={i === selectedId}
                    onSelect={() => {
                      setSelectedId(i);
                    }}
                    onChange={(newAttrs: any) => {
                      handleTransformChange(newAttrs, i);
                    }}
                  />
                );
              })} */}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default CanvasAnimation;
