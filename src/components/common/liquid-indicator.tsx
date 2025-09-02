import { useTransform, motion, useMotionTemplate, MotionValue } from "framer-motion";
import Indicator from '@/components/common/indicator';

const FramerBox = motion.div



export default function LiquidIndicator({
    count = 6,
    sliderWidth = 198,
    indicatorColor = "#888",
    size = 20,
    progress,
}: {
    count?: number;
    sliderWidth?: number;
    indicatorColor?: string;
    size?: number;
    progress: MotionValue<number>;
}) {
    const x = useTransform(() => (progress.get() > 0 ? 0 : -progress.get()));
    const indexRange = useTransform(() => Math.floor(x.get() / sliderWidth));


    const x1 = useTransform(
        () =>
            size / 2 +
            (indexRange.get() % 2) * size * 8 +
            Math.floor(indexRange.get() / 2) * size * 4
    );

    const x2 = useTransform(
        () =>
            size * 6 +
            size / 2 -
            (indexRange.get() % 2) * size * 4 +
            Math.floor(indexRange.get() / 2) * size * 4
    );

    const x3 = useTransform(
        () =>
            size * 4 -
            size * 4 * ((x.get() / sliderWidth) % 1) +
            Math.ceil(indexRange.get() / 2) * size * 4
    );

    const x4 = useTransform(
        () =>
            size * 6 -
            size * 4 * ((x.get() / sliderWidth) % 1) +
            Math.floor(indexRange.get() / 2) * size * 4
    );

    const scaleX1 = useTransform(
        () => ((indexRange.get() + 1) % 2) - ((x.get() / sliderWidth) % 1)
    );

    const scaleX2 = useTransform(
        () => (indexRange.get() % 2) - ((x.get() / sliderWidth) % 1)
    );

    const transform1 = useMotionTemplate`
    translateX(${x1}px) translateX(${-size * 2
        }px) scaleX(${scaleX1}) translateX(${size * 2}px)`;

    const transform2 = useMotionTemplate`
              translateX(${x2}px) translateX(${-size * 2
        }px) scaleX(${scaleX2}) translateX(${size * 2}px)
    `;

    const transform3 = useMotionTemplate`
    translateX(${x3}px)
    `;

    const transform4 = useMotionTemplate`
    translateX(${x4}px)
    `;


    const opacity = useTransform(() =>
        x.get() / sliderWidth >= count - 1 ? 0 : 1
    );

    return (
        <FramerBox className="block w-full flex flex-row justify-center pointer-events-none">
            <FramerBox className="w-full flex flex-row">
                {Array.from(Array(count + 2).keys()).map((_, i) => (
                    <Indicator
                        key={`indicator-${i}`}
                        progress={progress}
                        index={i}
                        color={indicatorColor}
                        size={size}
                        sliderWidth={sliderWidth}
                    />
                ))}
                <FramerBox className="absolute" style={{ transform: transform1 }}>
                    <FramerBox
                        style={{ backgroundColor: indicatorColor, width: size * 4, height: size, marginLeft: size / 2, marginRight: size / 2 }}
                    />
                </FramerBox>
                <FramerBox
                    className="absolute"
                    style={{ transform: transform2, opacity }}
                >
                    <FramerBox
                        style={{ backgroundColor: indicatorColor, width: size * 4, height: size, marginLeft: size / 2, marginRight: size / 2 }}
                    />
                </FramerBox>
                <FramerBox className="absolute" style={{ transform: transform3 }}>
                    <FramerBox
                        style={{ backgroundColor: indicatorColor, width: size, height: size, marginLeft: size / 2, marginRight: size / 2, borderRadius: size / 2 }}
                    />
                </FramerBox>
                <FramerBox
                    className="absolute"
                    style={{ transform: transform4, opacity }}
                >
                    <FramerBox
                        style={{ backgroundColor: indicatorColor, width: size, height: size, marginLeft: size / 2, marginRight: size / 2, borderRadius: size / 2 }}
                    />
                </FramerBox>
            </FramerBox>
        </FramerBox>
    );
};