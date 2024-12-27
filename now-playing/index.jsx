import { React, styled } from "uebersicht";

export const command = "osascript ./now-playing/script.scpt";

const Backdrop = styled.div`
    background-color: #000;
    height: 100vh;
    position: relative;
    pointer-events: none;
    width: 100vw;
`;

const BackdropImage = styled.img`
    filter: blur(30px);
    height: 100%;
    object-fit: cover;
    opacity: 0.3;
    transform: scale(1.2);
    pointer-events: none;
    width: 100%;
`;

const NowPlaying = styled.div`
    align-items: center;
    color: #f9fafb;
    display: grid;
    font-family: "Avenir Next Ultra Light";
    grid-template-columns: ${({ cover }) => (cover ? "320px 1fr" : "1fr")};
    grid-column-gap: 32px;
    left: 300px;
    position: absolute;
    top: 50vh;
    transform: translateY(-50%);
    width: calc(100vw - 600px);
`;

const Link = styled.a`
    color: #c2aec1;
    cursor: pointer;
    display: block;
    margin-top: 16px;
`;

const Cover = styled.div`
    position: relative;
`;

const CoverImage = styled.img`
    border-radius: 8px;
    position: relative;
    width: 100%;
    z-index: 1;
`;

const CoverShadow = styled.img`
    filter: blur(20px);
    height: 320px;
    left: 0;
    position: absolute;
    top: 20px;
    transform: scale(0.85);
    width: 100%;
`;

const Metadata = styled.div``;

const Artist = styled.div`
    color: #d1d5db;
    font-size: 20px;
`;

const Track = styled.div`
    font-size: 48px;
    margin-top: 4px;
    font-weight: 600;
`;

const Album = styled.div`
    color: #6b7280;
    font-size: 16px;
    margin-top: 4px;
`;

const Duration = styled.div`
    align-items: center;
    color: #6b7280;
    display: grid;
    font-size: 14px;
    grid-column-gap: 16px;
    grid-template-columns: auto 1fr auto;
    margin-top: 12px;
`;

const ProgressBar = styled.div`
    background-color: #6b7280;
    border-radius: 4px;
    height: 12px;
`;

const Progress = styled.div`
    border-radius: 4px;
    height: 100%;
`;

const TrackDuration = styled.button`
    appearance: none;
    background: none;
    border: 0;
    color: #6b7280;
    cursor: pointer;
    font-family: "Avenir Next Ultra Light";
    font-size: 14px;
`;

const addLeadingZero = (v) => (v < 10 ? `0${v}` : v);
const parseSeconds = (s) => parseFloat(s.toString().replace(",", "."));

const parseTime = (seconds) => {
    const parsedSeconds = parseSeconds(seconds);
    const m = parsedSeconds / 60;
    const s = ((parsedSeconds / 60) % 1) * 60;

    return `${Math.floor(m)}:${addLeadingZero(Math.floor(s))}`;
};

function lightenHexColor(hex, percent) {
    // Remove the hash (#) if present
    hex = hex.replace("#", "");

    // Convert hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Lighten each color by the specified percent (1.3 is 30% lighter)
    r = Math.min(255, Math.round(r * (1 + percent)));
    g = Math.min(255, Math.round(g * (1 + percent)));
    b = Math.min(255, Math.round(b * (1 + percent)));

    // Convert back to hex and pad with leading zeros if necessary
    let newHex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

    return newHex;
}

const ProgressDisplay = ({ position, duration, dom_colour }) => {
    const [displayCountdownTime, setCountdownTime] = React.useState(false);
    const parsedDuration = parseSeconds(duration);
    const parsedPosition = parseSeconds(position);
    const progress = `${(parsedPosition / parsedDuration) * 100}%`;

    return (
        <Duration>
            {parseTime(position)}
            <ProgressBar>
                <Progress
                    style={{
                        width: progress,
                        backgroundImage: `linear-gradient(to right, ${dom_colour}, ${lightenHexColor(dom_colour, 0.4)})`,
                        // transition:
                        //     "background-image 4s ease-in-out",
                    }}
                />
            </ProgressBar>
            <TrackDuration
                onClick={() => setCountdownTime(!displayCountdownTime)}
            >
                {displayCountdownTime
                    ? `-${parseTime(duration - position)}`
                    : parseTime(duration)}
            </TrackDuration>
        </Duration>
    );
};

function getDominantColor(url) {
    // Fallback color
    const fallbackColor = "transparent";

    try {
        // Create a hidden canvas element
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Create image element
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Attempt to enable CORS
        img.src = url;

        // Synchronous image load (browser hack)
        canvas.width = 15; // Reduced size for faster processing
        canvas.height = 15;

        // Draw scaled image to canvas
        ctx.drawImage(img, 0, 0, 15, 15);

        // Get image data
        const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        ).data;

        // Color counting logic
        const colorCounts = {};
        let maxCount = 0;
        let dominantColor = fallbackColor;

        // Sample pixels
        for (let i = 0; i < imageData.length; i += 40) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            // Skip transparent or near-transparent pixels
            if (a < 10) continue;

            const hex =
                "#" +
                ("0" + r.toString(16)).slice(-2) +
                ("0" + g.toString(16)).slice(-2) +
                ("0" + b.toString(16)).slice(-2);

            colorCounts[hex] = (colorCounts[hex] || 0) + 1;

            if (colorCounts[hex] > maxCount) {
                maxCount = colorCounts[hex];
                dominantColor = hex;
            }
        }

        return dominantColor;
    } catch (error) {
        console.error("Color extraction error:", error);
        return fallbackColor;
    }
}

export const render = ({ output, error }) => {
    if (error) {
        console.log(error);
        return null;
    }

    const [
        state,
        artist,
        track,
        album,
        link,
        cover,
        position,
        duration,
        dom_colour,
    ] = output.split("::");

    if (state !== "playing") {
        return null;
    }

    // console.log(cover)
    const dcol = getDominantColor(cover);
    console.log(dcol);

    return (
        <>
            {cover && (
                <Backdrop>
                    <BackdropImage src={cover} />
                </Backdrop>
            )}
            <NowPlaying cover={!!cover}>
                {cover && (
                    <Cover>
                        <CoverImage src={cover} />
                        <CoverShadow src={cover} />
                    </Cover>
                )}
                <Metadata>
                    <Track>{track}</Track>
                    <Artist>{artist}</Artist>
                    <Album>{album}</Album>
                    <ProgressDisplay
                        duration={duration}
                        position={position}
                        dom_colour={dcol}
                    />
                    {link && <Link href={link}></Link>}
                </Metadata>
            </NowPlaying>
        </>
    );
};
